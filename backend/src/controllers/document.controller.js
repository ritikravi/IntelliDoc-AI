import axios from 'axios';
import { v2 as cloudinary } from 'cloudinary';
import Document from '../models/Document.model.js';
import { AppError } from '../middleware/errorHandler.js';
import { cacheGet, cacheSet, cacheDel } from '../config/redis.js';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new AppError('Please upload a file', 400);
    }

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'intellidoc',
          resource_type: 'auto',
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(req.file.buffer);
    });

    const document = await Document.create({
      user: req.user._id,
      fileName: req.file.originalname,
      fileUrl: result.secure_url,
      fileType: req.file.mimetype.split('/')[1],
      fileSize: req.file.size,
      cloudinaryId: result.public_id,
      status: 'uploaded',
    });

    res.status(201).json({
      success: true,
      documentId: document._id,
      fileUrl: result.secure_url,
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

    // Delete from Cloudinary
    if (document.cloudinaryId) {
      await cloudinary.uploader.destroy(document.cloudinaryId);
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
