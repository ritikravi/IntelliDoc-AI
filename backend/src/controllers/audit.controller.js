import AuditLog from '../models/AuditLog.model.js';
import mongoose from 'mongoose';
import { AppError } from '../middleware/errorHandler.js';

export const createAuditLog = async (logData) => {
  try {
    await AuditLog.create(logData);
  } catch (error) {
    console.error('Failed to create audit log:', error);
  }
};

export const getDocumentHistory = async (req, res, next) => {
  try {
    const { documentId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const logs = await AuditLog.find({ document: documentId })
      .populate('actionBy', 'name email')
      .sort('-createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await AuditLog.countDocuments({ document: documentId });

    res.json({
      success: true,
      logs,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      total: count,
    });
  } catch (error) {
    next(error);
  }
};

export const getUserAuditLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, action, startDate, endDate } = req.query;

    const query = { user: req.user._id };
    if (action) query.action = action;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const logs = await AuditLog.find(query)
      .populate('document', 'fileName invoiceNumber vendorName')
      .populate('actionBy', 'name email')
      .sort('-createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await AuditLog.countDocuments(query);

    res.json({
      success: true,
      logs,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      total: count,
    });
  } catch (error) {
    next(error);
  }
};

export const getAuditStats = async (req, res, next) => {
  try {
    const stats = await AuditLog.aggregate([
      { $match: { user: req.user._id } },
      {
        $facet: {
          byAction: [
            { $group: { _id: '$action', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
          ],
          byDay: [
            {
              $group: {
                _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                count: { $sum: 1 }
              }
            },
            { $sort: { _id: -1 } },
            { $limit: 30 }
          ],
          mostActive: [
            {
              $group: {
                _id: '$actionBy',
                count: { $sum: 1 }
              }
            },
            { $sort: { count: -1 } },
            { $limit: 10 }
          ]
        }
      }
    ]);

    if (stats[0].mostActive.length > 0) {
      const userIds = stats[0].mostActive.map(s => s._id);
      const users = await mongoose.model('User').find({ _id: { $in: userIds } }).select('name email');
      const userMap = {};
      users.forEach(u => { userMap[u._id] = u; });
      stats[0].mostActive = stats[0].mostActive.map(s => ({
        user: userMap[s._id],
        count: s.count
      }));
    }

    res.json({
      success: true,
      stats: stats[0]
    });
  } catch (error) {
    next(error);
  }
};

export const exportAuditLogs = async (req, res, next) => {
  try {
    const { startDate, endDate, action } = req.query;

    const query = { user: req.user._id };
    if (action) query.action = action;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const logs = await AuditLog.find(query)
      .populate('document', 'fileName invoiceNumber')
      .populate('actionBy', 'name email')
      .sort('-createdAt')
      .lean();

    const csv = [
      'Timestamp,Action,Document,User,IP Address',
      ...logs.map(log => 
        `${log.createdAt},${log.action},${log.document?.fileName || 'N/A'},${log.actionBy?.name || 'System'},${log.ipAddress || 'N/A'}`
      )
    ].join('\n');
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=audit-logs.csv');
    res.send(csv);
  } catch (error) {
    next(error);
  }
};
