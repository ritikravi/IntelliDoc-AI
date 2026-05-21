import Document from '../models/Document.model.js';
import { cacheGet, cacheSet } from '../config/redis.js';

export const getOverview = async (req, res, next) => {
  try {
    const cacheKey = `analytics:overview:${req.user._id}`;
    const cached = await cacheGet(cacheKey);

    if (cached) {
      return res.json(cached);
    }

    const totalDocuments = await Document.countDocuments({ user: req.user._id });
    const processedDocuments = await Document.countDocuments({
      user: req.user._id,
      status: 'processed',
    });

    const totalAmountResult = await Document.aggregate([
      { $match: { user: req.user._id, status: 'processed' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);

    const avgConfidence = await Document.aggregate([
      { $match: { user: req.user._id, status: 'processed' } },
      { $group: { _id: null, avg: { $avg: '$confidenceScore' } } },
    ]);

    const result = {
      success: true,
      data: {
        totalDocuments,
        processedDocuments,
        totalAmount: totalAmountResult[0]?.total || 0,
        avgConfidence: avgConfidence[0]?.avg || 0,
      },
    };

    await cacheSet(cacheKey, result, 600); // Cache for 10 minutes

    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const getTrends = async (req, res, next) => {
  try {
    const { period = '30d' } = req.query;
    const days = parseInt(period);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const trends = await Document.aggregate([
      {
        $match: {
          user: req.user._id,
          status: 'processed',
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      success: true,
      trends,
    });
  } catch (error) {
    next(error);
  }
};

export const getVendorAnalytics = async (req, res, next) => {
  try {
    const vendors = await Document.aggregate([
      { $match: { user: req.user._id, status: 'processed' } },
      {
        $group: {
          _id: '$vendorName',
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' },
          avgAmount: { $avg: '$totalAmount' },
        },
      },
      { $sort: { totalAmount: -1 } },
      { $limit: 10 },
    ]);

    res.json({
      success: true,
      vendors,
    });
  } catch (error) {
    next(error);
  }
};
