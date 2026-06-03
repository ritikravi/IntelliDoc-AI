import Document from '../models/Document.model.js';
import { AppError } from '../middleware/errorHandler.js';

export const getOverdueInvoices = async (req, res, next) => {
  try {
    const today = new Date();
    
    const overdueInvoices = await Document.find({
      user: req.user._id,
      status: 'processed',
      paymentStatus: 'pending',
      dueDate: { $lt: today }
    })
    .select('invoiceNumber vendorName totalAmount dueDate invoiceDate')
    .sort('dueDate');

    const totalOverdue = overdueInvoices.reduce((sum, doc) => sum + doc.totalAmount, 0);

    res.json({
      success: true,
      count: overdueInvoices.length,
      totalOverdue,
      overdueInvoices
    });
  } catch (error) {
    next(error);
  }
};

export const getUpcomingDue = async (req, res, next) => {
  try {
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    const upcomingInvoices = await Document.find({
      user: req.user._id,
      status: 'processed',
      paymentStatus: 'pending',
      dueDate: { $gte: today, $lte: nextWeek }
    })
    .select('invoiceNumber vendorName totalAmount dueDate invoiceDate')
    .sort('dueDate');

    const totalDue = upcomingInvoices.reduce((sum, doc) => sum + doc.totalAmount, 0);

    res.json({
      success: true,
      count: upcomingInvoices.length,
      totalDue,
      upcomingInvoices
    });
  } catch (error) {
    next(error);
  }
};

export const markAsPaid = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const document = await Document.findOne({ _id: id, user: req.user._id });
    
    if (!document) {
      throw new AppError('Document not found', 404);
    }

    document.paymentStatus = 'paid';
    document.paidDate = new Date();
    await document.save();

    res.json({
      success: true,
      message: 'Invoice marked as paid',
      document
    });
  } catch (error) {
    next(error);
  }
};

export const getPaymentSummary = async (req, res, next) => {
  try {
    const summary = await Document.aggregate([
      { $match: { user: req.user._id, status: 'processed' } },
      {
        $group: {
          _id: '$paymentStatus',
          count: { $sum: 1 },
          total: { $sum: '$totalAmount' }
        }
      }
    ]);

    const overdue = await Document.countDocuments({
      user: req.user._id,
      status: 'processed',
      paymentStatus: 'pending',
      dueDate: { $lt: new Date() }
    });

    res.json({
      success: true,
      summary,
      overdueCount: overdue
    });
  } catch (error) {
    next(error);
  }
};

export const getVendorSpending = async (req, res, next) => {
  try {
    const { period = '30' } = req.query;
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(period));

    const spending = await Document.aggregate([
      {
        $match: {
          user: req.user._id,
          status: 'processed',
          invoiceDate: { $gte: daysAgo }
        }
      },
      {
        $group: {
          _id: '$vendorName',
          totalSpent: { $sum: '$totalAmount' },
          invoiceCount: { $sum: 1 },
          avgAmount: { $avg: '$totalAmount' },
          lastInvoice: { $max: '$invoiceDate' }
        }
      },
      { $sort: { totalSpent: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      success: true,
      period: `${period} days`,
      vendors: spending
    });
  } catch (error) {
    next(error);
  }
};

export const getCashFlowProjection = async (req, res, next) => {
  try {
    const today = new Date();
    const next90Days = new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000);

    const projection = await Document.aggregate([
      {
        $match: {
          user: req.user._id,
          status: 'processed',
          paymentStatus: 'pending',
          dueDate: { $gte: today, $lte: next90Days }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$dueDate' } },
          amount: { $sum: '$totalAmount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const totalProjected = projection.reduce((sum, day) => sum + day.amount, 0);

    res.json({
      success: true,
      totalProjected,
      dailyProjection: projection
    });
  } catch (error) {
    next(error);
  }
};
