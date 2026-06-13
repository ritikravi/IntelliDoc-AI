import Document from '../models/Document.model.js';
import { AppError } from '../middleware/errorHandler.js';

export const detectRecurringInvoices = async (req, res, next) => {
  try {
    // Find invoices with same vendor and similar amounts
    const recurring = await Document.aggregate([
      { $match: { user: req.user._id, status: 'processed' } },
      {
        $group: {
          _id: '$vendorName',
          count: { $sum: 1 },
          amounts: { $push: '$totalAmount' },
          dates: { $push: '$invoiceDate' },
          invoices: { $push: { id: '$_id', amount: '$totalAmount', date: '$invoiceDate', invoiceNumber: '$invoiceNumber' } }
        }
      },
      { $match: { count: { $gte: 2 } } },
      {
        $project: {
          vendor: '$_id',
          count: 1,
          avgAmount: { $avg: '$amounts' },
          totalSpent: { $sum: '$amounts' },
          invoices: 1,
          isRecurring: {
            $cond: {
              if: { $gte: ['$count', 3] },
              then: true,
              else: false
            }
          }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Calculate frequency for recurring invoices
    const recurringWithFrequency = recurring.map(vendor => {
      if (vendor.count >= 3 && vendor.invoices.length >= 2) {
        const sortedDates = vendor.invoices
          .map(inv => new Date(inv.date))
          .sort((a, b) => a - b);
        
        const intervals = [];
        for (let i = 1; i < sortedDates.length; i++) {
          const days = Math.floor((sortedDates[i] - sortedDates[i-1]) / (1000 * 60 * 60 * 24));
          intervals.push(days);
        }
        
        const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
        let frequency = 'irregular';
        
        if (avgInterval >= 28 && avgInterval <= 32) frequency = 'monthly';
        else if (avgInterval >= 85 && avgInterval <= 95) frequency = 'quarterly';
        else if (avgInterval >= 12 && avgInterval <= 16) frequency = 'biweekly';
        else if (avgInterval >= 6 && avgInterval <= 8) frequency = 'weekly';
        else if (avgInterval >= 360 && avgInterval <= 370) frequency = 'yearly';
        
        vendor.frequency = frequency;
        vendor.avgIntervalDays = Math.round(avgInterval);
        
        // Predict next invoice date
        const lastDate = sortedDates[sortedDates.length - 1];
        vendor.predictedNextDate = new Date(lastDate.getTime() + avgInterval * 24 * 60 * 60 * 1000);
      }
      return vendor;
    });

    res.json({
      success: true,
      totalRecurring: recurringWithFrequency.filter(v => v.isRecurring).length,
      recurring: recurringWithFrequency
    });
  } catch (error) {
    next(error);
  }
};

export const getSubscriptions = async (req, res, next) => {
  try {
    const subscriptions = await Document.aggregate([
      { $match: { user: req.user._id, status: 'processed', isSubscription: true } },
      {
        $group: {
          _id: '$vendorName',
          monthlyAmount: { $first: '$totalAmount' },
          frequency: { $first: '$subscriptionFrequency' },
          lastInvoice: { $max: '$invoiceDate' },
          nextDue: { $first: '$subscriptionNextDue' },
          status: { $first: '$subscriptionStatus' }
        }
      },
      { $sort: { monthlyAmount: -1 } }
    ]);

    const totalMonthlySpend = subscriptions.reduce((sum, sub) => {
      if (sub.frequency === 'monthly') return sum + sub.monthlyAmount;
      if (sub.frequency === 'yearly') return sum + (sub.monthlyAmount / 12);
      if (sub.frequency === 'quarterly') return sum + (sub.monthlyAmount / 3);
      return sum;
    }, 0);

    res.json({
      success: true,
      totalSubscriptions: subscriptions.length,
      totalMonthlySpend,
      subscriptions
    });
  } catch (error) {
    next(error);
  }
};

export const markAsSubscription = async (req, res, next) => {
  try {
    const { vendorName } = req.params;
    const { frequency, amount } = req.body;

    const result = await Document.updateMany(
      {
        user: req.user._id,
        vendorName: new RegExp(vendorName, 'i'),
        status: 'processed'
      },
      {
        $set: {
          isSubscription: true,
          subscriptionFrequency: frequency,
          subscriptionStatus: 'active'
        }
      }
    );

    res.json({
      success: true,
      message: `${result.modifiedCount} invoices marked as subscription`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    next(error);
  }
};

export const cancelSubscription = async (req, res, next) => {
  try {
    const { vendorName } = req.params;

    const result = await Document.updateMany(
      {
        user: req.user._id,
        vendorName: new RegExp(vendorName, 'i'),
        isSubscription: true
      },
      {
        $set: {
          subscriptionStatus: 'cancelled',
          cancelledAt: new Date()
        }
      }
    );

    res.json({
      success: true,
      message: `Subscription cancelled for ${vendorName}`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    next(error);
  }
};

export const getSubscriptionAnalytics = async (req, res, next) => {
  try {
    const analytics = await Document.aggregate([
      { $match: { user: req.user._id, status: 'processed', isSubscription: true } },
      {
        $group: {
          _id: '$subscriptionFrequency',
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' }
        }
      }
    ]);

    const upcomingRenewals = await Document.find({
      user: req.user._id,
      isSubscription: true,
      subscriptionStatus: 'active',
      subscriptionNextDue: {
        $gte: new Date(),
        $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }
    })
    .select('vendorName totalAmount subscriptionNextDue')
    .sort('subscriptionNextDue')
    .limit(10);

    res.json({
      success: true,
      analytics,
      upcomingRenewals
    });
  } catch (error) {
    next(error);
  }
};

export const compareRecurringCosts = async (req, res, next) => {
  try {
    const { period = 6 } = req.query;
    const monthsAgo = new Date();
    monthsAgo.setMonth(monthsAgo.getMonth() - parseInt(period));

    const comparison = await Document.aggregate([
      {
        $match: {
          user: req.user._id,
          status: 'processed',
          invoiceDate: { $gte: monthsAgo }
        }
      },
      {
        $group: {
          _id: {
            vendor: '$vendorName',
            month: { $dateToString: { format: '%Y-%m', date: '$invoiceDate' } }
          },
          amount: { $sum: '$totalAmount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.month': 1 } },
      {
        $group: {
          _id: '$_id.vendor',
          monthlyData: {
            $push: {
              month: '$_id.month',
              amount: '$amount',
              count: '$count'
            }
          },
          totalSpent: { $sum: '$amount' },
          avgMonthly: { $avg: '$amount' }
        }
      },
      { $sort: { totalSpent: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      success: true,
      period: `${period} months`,
      comparison
    });
  } catch (error) {
    next(error);
  }
};

export const getAnomalies = async (req, res, next) => {
  try {
    // Find recurring invoices with unusual amounts
    const recurring = await Document.aggregate([
      { $match: { user: req.user._id, status: 'processed' } },
      {
        $group: {
          _id: '$vendorName',
          count: { $sum: 1 },
          avgAmount: { $avg: '$totalAmount' },
          stdDev: { $stdDevPop: '$totalAmount' },
          invoices: {
            $push: {
              id: '$_id',
              amount: '$totalAmount',
              date: '$invoiceDate',
              invoiceNumber: '$invoiceNumber'
            }
          }
        }
      },
      { $match: { count: { $gte: 3 } } }
    ]);

    const anomalies = [];

    for (const vendor of recurring) {
      for (const invoice of vendor.invoices) {
        const deviation = Math.abs(invoice.amount - vendor.avgAmount);
        if (deviation > vendor.stdDev * 2) {
          anomalies.push({
            ...invoice,
            vendor: vendor._id,
            expectedAmount: Math.round(vendor.avgAmount),
            deviation: Math.round(deviation),
            percentageChange: Math.round((deviation / vendor.avgAmount) * 100),
            reason: 'Amount significantly different from usual'
          });
        }
      }
    }

    anomalies.sort((a, b) => b.percentageChange - a.percentageChange);

    res.json({
      success: true,
      anomaliesFound: anomalies.length,
      anomalies: anomalies.slice(0, 20)
    });
  } catch (error) {
    next(error);
  }
};
