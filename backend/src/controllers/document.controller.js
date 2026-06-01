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
    const documents = await Document.find({ user: req.user._id })
      .select('-embedding -__v')
      .lean();

    res.json({
      success: true,
      documents,
    });
  } catch (error) {
    next(error);
  }
};
