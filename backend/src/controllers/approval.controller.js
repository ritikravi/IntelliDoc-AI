import Document from '../models/Document.model.js';
import { AppError } from '../middleware/errorHandler.js';

export const getPendingApprovals = async (req, res, next) => {
  try {
    const pendingDocs = await Document.find({
      user: req.user._id,
      status: 'processed',
      approvalStatus: { $in: ['pending', undefined, null] }
    })
    .select('invoiceNumber vendorName totalAmount invoiceDate confidenceScore')
    .sort('-createdAt')
    .limit(50);

    res.json({
      success: true,
      count: pendingDocs.length,
      documents: pendingDocs
    });
  } catch (error) {
    next(error);
  }
};

export const approveInvoice = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { comment } = req.body;

    const document = await Document.findOne({ _id: id, user: req.user._id });
    
    if (!document) {
      throw new AppError('Document not found', 404);
    }

    document.approvalStatus = 'approved';
    document.approvedBy = req.user.name;
    document.approvedAt = new Date();
    document.approvalComment = comment;
    await document.save();

    res.json({
      success: true,
      message: 'Invoice approved successfully',
      document
    });
  } catch (error) {
    next(error);
  }
};

export const rejectInvoice = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason) {
      throw new AppError('Rejection reason is required', 400);
    }

    const document = await Document.findOne({ _id: id, user: req.user._id });
    
    if (!document) {
      throw new AppError('Document not found', 404);
    }

    document.approvalStatus = 'rejected';
    document.rejectedBy = req.user.name;
    document.rejectedAt = new Date();
    document.rejectionReason = reason;
    await document.save();

    res.json({
      success: true,
      message: 'Invoice rejected',
      document
    });
  } catch (error) {
    next(error);
  }
};

export const bulkApprove = async (req, res, next) => {
  try {
    const { documentIds } = req.body;

    if (!documentIds || !Array.isArray(documentIds)) {
      throw new AppError('Please provide document IDs', 400);
    }

    const result = await Document.updateMany(
      {
        _id: { $in: documentIds },
        user: req.user._id
      },
      {
        $set: {
          approvalStatus: 'approved',
          approvedBy: req.user.name,
          approvedAt: new Date()
        }
      }
    );

    res.json({
      success: true,
      message: `${result.modifiedCount} invoices approved`,
      approvedCount: result.modifiedCount
    });
  } catch (error) {
    next(error);
  }
};

export const getApprovalStats = async (req, res, next) => {
  try {
    const stats = await Document.aggregate([
      { $match: { user: req.user._id, status: 'processed' } },
      {
        $group: {
          _id: '$approvalStatus',
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' }
        }
      }
    ]);

    const pending = await Document.countDocuments({
      user: req.user._id,
      status: 'processed',
      approvalStatus: { $in: ['pending', undefined, null] }
    });

    res.json({
      success: true,
      stats,
      pendingApproval: pending
    });
  } catch (error) {
    next(error);
  }
};

export const getApprovalHistory = async (req, res, next) => {
  try {
    const { limit = 20 } = req.query;

    const history = await Document.find({
      user: req.user._id,
      approvalStatus: { $in: ['approved', 'rejected'] }
    })
    .select('invoiceNumber vendorName totalAmount approvalStatus approvedBy rejectedBy approvedAt rejectedAt approvalComment rejectionReason')
    .sort('-approvedAt -rejectedAt')
    .limit(parseInt(limit));

    res.json({
      success: true,
      count: history.length,
      history
    });
  } catch (error) {
    next(error);
  }
};

export const requiresApproval = async (req, res, next) => {
  try {
    const { amount } = req.query;
    const threshold = 10000; // Amounts above $10,000 require approval

    const needsApproval = amount && parseFloat(amount) > threshold;

    res.json({
      success: true,
      requiresApproval: needsApproval,
      threshold,
      amount: parseFloat(amount) || 0
    });
  } catch (error) {
    next(error);
  }
};
