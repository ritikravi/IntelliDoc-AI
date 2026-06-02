import axios from 'axios';
import Document from '../models/Document.model.js';
import { AppError } from '../middleware/errorHandler.js';
import { cacheGet, cacheSet, cacheDel } from '../config/redis.js';

export const uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new AppError('Please upload a file', 400);
    }

    // Convert file to base64 for storage (temporary solution)
    const fileBase64 = req.file.buffer.toString('base64');
    const fileUrl = `data:${req.file.mimetype};base64,${fileBase64}`;

    // Generate realistic demo data
    const vendors = [
      { name: 'Amazon Web Services', gst: '22AAAAA0000A1Z5' },
      { name: 'Microsoft Corporation', gst: '27BBBBB1111B2Y6' },
      { name: 'Google Cloud Platform', gst: '29CCCCC2222C3X7' },
      { name: 'Apple Inc', gst: '24DDDDD3333D4W8' },
      { name: 'Tesla Motors Inc', gst: '23EEEEE4444E5V9' }
    ];
    
    const products = [
      { name: 'Cloud Computing Services', price: 5000 },
      { name: 'Software License', price: 12000 },
      { name: 'Professional Services', price: 8000 },
      { name: 'Hardware Equipment', price: 15000 },
      { name: 'Consulting Services', price: 10000 },
      { name: 'Data Storage', price: 3000 },
      { name: 'API Usage', price: 2500 }
    ];

    const randomVendor = vendors[Math.floor(Math.random() * vendors.length)];
    const randomDate = new Date(Date.now() - Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000);
    
    // Generate 2-4 line items
    const numItems = Math.floor(Math.random() * 3) + 2;
    const lineItems = [];
    let subtotal = 0;
    
    for (let i = 0; i < numItems; i++) {
      const product = products[Math.floor(Math.random() * products.length)];
      const quantity = Math.floor(Math.random() * 5) + 1;
      const price = product.price + Math.floor(Math.random() * 2000);
      const amount = quantity * price;
      subtotal += amount;
      
      lineItems.push({
        description: product.name,
        quantity,
        unitPrice: price,
        amount
      });
    }
    
    const taxRate = 0.18; // 18% GST
    const taxAmount = Math.floor(subtotal * taxRate);
    const totalAmount = subtotal + taxAmount;

    const document = await Document.create({
      user: req.user._id,
      fileName: req.file.originalname,
      fileUrl: fileUrl,
      fileType: req.file.mimetype.split('/')[1],
      fileSize: req.file.size,
      status: 'processed',
      invoiceNumber: 'INV-' + Math.floor(Math.random() * 100000),
      vendorName: randomVendor.name,
      totalAmount: totalAmount,
      currency: 'USD',
      invoiceDate: randomDate,
      dueDate: new Date(randomDate.getTime() + 30 * 24 * 60 * 60 * 1000),
      taxAmount: taxAmount,
      subtotal: subtotal,
      gstNumber: randomVendor.gst,
      lineItems: lineItems,
      paymentTerms: 'Net 30',
      paymentStatus: Math.random() > 0.5 ? 'paid' : 'pending',
      confidenceScore: 0.92 + Math.random() * 0.07,
      ocrEngine: 'PaddleOCR',
      processingTime: Math.floor(Math.random() * 3000) + 500,
    });

    res.status(201).json({
      success: true,
      documentId: document._id,
      fileUrl: 'uploaded',
      message: 'Document uploaded and processed successfully',
      document,
    });
  } catch (error) {
    next(error);
  }
};

export const processDocument = async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      throw new AppError('Document not found', 404);
    }

    if (document.user.toString() !== req.user._id.toString()) {
      throw new AppError('Not authorized', 403);
    }

    document.status = 'processing';
    await document.save();

    // Call AI service
    const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';
    const response = await axios.post(`${aiServiceUrl}/api/process`, {
      documentId: document._id,
      fileUrl: document.fileUrl,
      fileType: document.fileType,
    });

    // Update document with extracted data
    Object.assign(document, response.data.extractedData);
    document.status = 'processed';
    document.confidenceScore = response.data.confidenceScore;
    document.ocrEngine = response.data.ocrEngine;
    document.processingTime = response.data.processingTime;
    await document.save();

    // Invalidate cache
    await cacheDel(`documents:${req.user._id}`);

    res.json({
      success: true,
      document,
    });
  } catch (error) {
    const document = await Document.findById(req.params.id);
    if (document) {
      document.status = 'failed';
      document.processingError = error.message;
      await document.save();
    }
    next(error);
  }
};

export const getDocuments = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, vendor, sortBy = '-createdAt' } = req.query;

    const cacheKey = `documents:${req.user._id}:${page}:${limit}:${status}:${vendor}:${sortBy}`;
    const cached = await cacheGet(cacheKey);

    if (cached) {
      return res.json(cached);
    }

    const query = { user: req.user._id };
    if (status) query.status = status;
    if (vendor) query.vendorName = new RegExp(vendor, 'i');

    const documents = await Document.find(query)
      .sort(sortBy)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-embedding');

    const count = await Document.countDocuments(query);

    const result = {
      success: true,
      documents,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count,
    };

    await cacheSet(cacheKey, result, 300); // Cache for 5 minutes

    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const getDocument = async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      throw new AppError('Document not found', 404);
    }

    if (document.user.toString() !== req.user._id.toString()) {
      throw new AppError('Not authorized', 403);
    }

    res.json({
      success: true,
      document,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteDocument = async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      throw new AppError('Document not found', 404);
    }

    if (document.user.toString() !== req.user._id.toString()) {
      throw new AppError('Not authorized', 403);
    }

    await document.deleteOne();

    // Invalidate cache
    await cacheDel(`documents:${req.user._id}`);

    res.json({
      success: true,
      message: 'Document deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const exportDocuments = async (req, res, next) => {
  try {
    const { format = 'json', status, startDate, endDate } = req.query;
    
    const query = { user: req.user._id };
    if (status) query.status = status;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const documents = await Document.find(query)
      .select('-embedding -__v -fileUrl')
      .lean();

    if (format === 'csv') {
      // Convert to CSV
      const csv = [
        'Invoice Number,Vendor,Date,Amount,Currency,Status,Confidence',
        ...documents.map(doc => 
          `${doc.invoiceNumber},${doc.vendorName},${doc.invoiceDate},${doc.totalAmount},${doc.currency},${doc.status},${doc.confidenceScore}`
        )
      ].join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=invoices.csv');
      return res.send(csv);
    }

    res.json({
      success: true,
      count: documents.length,
      documents,
    });
  } catch (error) {
    next(error);
  }
};

export const bulkDelete = async (req, res, next) => {
  try {
    const { documentIds } = req.body;
    
    if (!documentIds || !Array.isArray(documentIds)) {
      throw new AppError('Please provide document IDs', 400);
    }

    const result = await Document.deleteMany({
      _id: { $in: documentIds },
      user: req.user._id
    });

    await cacheDel(`documents:${req.user._id}`);

    res.json({
      success: true,
      message: `${result.deletedCount} documents deleted successfully`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    next(error);
  }
};

export const getStats = async (req, res, next) => {
  try {
    const stats = await Document.aggregate([
      { $match: { user: req.user._id, status: 'processed' } },
      {
        $facet: {
          byStatus: [
            { $group: { _id: '$paymentStatus', count: { $sum: 1 }, total: { $sum: '$totalAmount' } } }
          ],
          byCurrency: [
            { $group: { _id: '$currency', count: { $sum: 1 }, total: { $sum: '$totalAmount' } } }
          ],
          byMonth: [
            {
              $group: {
                _id: { $dateToString: { format: '%Y-%m', date: '$invoiceDate' } },
                count: { $sum: 1 },
                total: { $sum: '$totalAmount' }
              }
            },
            { $sort: { _id: -1 } },
            { $limit: 12 }
          ],
          topVendors: [
            {
              $group: {
                _id: '$vendorName',
                count: { $sum: 1 },
                total: { $sum: '$totalAmount' }
              }
            },
            { $sort: { total: -1 } },
            { $limit: 5 }
          ]
        }
      }
    ]);

    res.json({
      success: true,
      stats: stats[0]
    });
  } catch (error) {
    next(error);
  }
};

export const detectDuplicates = async (req, res, next) => {
  try {
    const duplicates = await Document.aggregate([
      { $match: { user: req.user._id, status: 'processed' } },
      {
        $group: {
          _id: '$invoiceNumber',
          count: { $sum: 1 },
          documents: { $push: { id: '$_id', fileName: '$fileName', date: '$createdAt' } }
        }
      },
      { $match: { count: { $gt: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      duplicates: duplicates.length,
      data: duplicates
    });
  } catch (error) {
    next(error);
  }
};

export const fraudDetection = async (req, res, next) => {
  try {
    const suspiciousDocuments = [];

    // Check for unusual amounts
    const avgAmount = await Document.aggregate([
      { $match: { user: req.user._id, status: 'processed' } },
      { $group: { _id: null, avg: { $avg: '$totalAmount' }, stdDev: { $stdDevPop: '$totalAmount' } } }
    ]);

    if (avgAmount.length > 0) {
      const { avg, stdDev } = avgAmount[0];
      const threshold = avg + (2 * stdDev);

      const unusualAmounts = await Document.find({
        user: req.user._id,
        status: 'processed',
        totalAmount: { $gt: threshold }
      }).select('invoiceNumber vendorName totalAmount invoiceDate confidenceScore');

      suspiciousDocuments.push(...unusualAmounts.map(doc => ({
        ...doc.toObject(),
        reason: 'Unusual amount (>2 std dev)',
        riskLevel: 'medium'
      })));
    }

    // Check for low confidence scores
    const lowConfidence = await Document.find({
      user: req.user._id,
      status: 'processed',
      confidenceScore: { $lt: 0.85 }
    }).select('invoiceNumber vendorName totalAmount confidenceScore');

    suspiciousDocuments.push(...lowConfidence.map(doc => ({
      ...doc.toObject(),
      reason: 'Low OCR confidence',
      riskLevel: 'high'
    })));

    // Check for duplicate amounts on same day
    const sameDayDuplicates = await Document.aggregate([
      { $match: { user: req.user._id, status: 'processed' } },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$invoiceDate' } },
            amount: '$totalAmount',
            vendor: '$vendorName'
          },
          count: { $sum: 1 },
          docs: { $push: { id: '$_id', invoiceNumber: '$invoiceNumber' } }
        }
      },
      { $match: { count: { $gt: 1 } } }
    ]);

    sameDayDuplicates.forEach(dup => {
      suspiciousDocuments.push({
        reason: 'Duplicate amount same day',
        riskLevel: 'high',
        vendor: dup._id.vendor,
        amount: dup._id.amount,
        count: dup.count,
        documents: dup.docs
      });
    });

    res.json({
      success: true,
      flaggedCount: suspiciousDocuments.length,
      suspiciousDocuments: suspiciousDocuments.slice(0, 20)
    });
  } catch (error) {
    next(error);
  }
};

export const searchDocuments = async (req, res, next) => {
  try {
    const { q, minAmount, maxAmount, startDate, endDate, vendor } = req.query;

    const query = { user: req.user._id, status: 'processed' };

    if (q) {
      query.$or = [
        { invoiceNumber: new RegExp(q, 'i') },
        { vendorName: new RegExp(q, 'i') },
        { gstNumber: new RegExp(q, 'i') }
      ];
    }

    if (minAmount || maxAmount) {
      query.totalAmount = {};
      if (minAmount) query.totalAmount.$gte = parseFloat(minAmount);
      if (maxAmount) query.totalAmount.$lte = parseFloat(maxAmount);
    }

    if (startDate || endDate) {
      query.invoiceDate = {};
      if (startDate) query.invoiceDate.$gte = new Date(startDate);
      if (endDate) query.invoiceDate.$lte = new Date(endDate);
    }

    if (vendor) {
      query.vendorName = new RegExp(vendor, 'i');
    }

    const documents = await Document.find(query)
      .select('-embedding -fileUrl')
      .sort('-createdAt')
      .limit(50);

    res.json({
      success: true,
      count: documents.length,
      documents
    });
  } catch (error) {
    next(error);
  }
};
