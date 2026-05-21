import axios from 'axios';
import Document from '../models/Document.model.js';

export const search = async (req, res, next) => {
  try {
    const { q, page = 1, limit = 10 } = req.query;

    if (!q) {
      return res.status(400).json({ message: 'Search query required' });
    }

    const query = {
      user: req.user._id,
      $or: [
        { fileName: new RegExp(q, 'i') },
        { vendorName: new RegExp(q, 'i') },
        { invoiceNumber: new RegExp(q, 'i') },
      ],
    };

    const documents = await Document.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-embedding');

    const count = await Document.countDocuments(query);

    res.json({
      success: true,
      documents,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count,
    });
  } catch (error) {
    next(error);
  }
};

export const semanticSearch = async (req, res, next) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ message: 'Query required' });
    }

    // Call AI service for semantic search
    const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';
    const response = await axios.post(`${aiServiceUrl}/api/semantic-search`, {
      query,
      userId: req.user._id,
    });

    res.json({
      success: true,
      results: response.data.results,
    });
  } catch (error) {
    next(error);
  }
};
