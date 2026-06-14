import Document from '../models/Document.model.js';
import User from '../models/User.model.js';
import { AppError } from '../middleware/errorHandler.js';

export const setBudget = async (req, res, next) => {
  try {
    const { category, amount, period, alertThreshold } = req.body;

    if (!category || !amount || !period) {
      throw new AppError('Category, amount, and period are required', 400);
    }

    const user = await User.findById(req.user._id);
    
    if (!user.budgets) {
      user.budgets = [];
    }

    // Remove existing budget for this category
    user.budgets = user.budgets.filter(b => b.category !== category);

    // Add new budget
    user.budgets.push({
      category,
      amount,
      period, // 'monthly', 'quarterly', 'yearly'
      alertThreshold: alertThreshold || 80, // Alert at 80% by default
      createdAt: new Date()
    });

    await user.save();

    res.json({
      success: true,
      message: 'Budget set successfully',
      budgets: user.budgets
    });
  } catch (error) {
    next(error);
  }
};

export const getBudgets = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const budgets = user.budgets || [];

    // Calculate spending for each budget
    const budgetsWithSpending = await Promise.all(
      budgets.map(async (budget) => {
        const startDate = getStartDate(budget.period);
        
        const spending = await Document.aggregate([
          {
            $match: {
              user: req.user._id,
              status: 'processed',
              category: budget.category,
              invoiceDate: { $gte: startDate }
            }
          },
          {
            $group: {
              _id: null,
              total: { $sum: '$totalAmount' },
              count: { $sum: 1 }
            }
          }
        ]);

        const spent = spending[0]?.total || 0;
        const remaining = budget.amount - spent;
        const percentageUsed = (spent / budget.amount) * 100;
        const isOverBudget = spent > budget.amount;
        const isNearLimit = percentageUsed >= budget.alertThreshold;

        return {
          category: budget.category,
          budgetAmount: budget.amount,
          spent,
          remaining,
          percentageUsed: Math.round(percentageUsed),
          period: budget.period,
          alertThreshold: budget.alertThreshold,
          isOverBudget,
          isNearLimit,
          invoiceCount: spending[0]?.count || 0
        };
      })
    );

    res.json({
      success: true,
      budgets: budgetsWithSpending
    });
  } catch (error) {
    next(error);
  }
};

export const deleteBudget = async (req, res, next) => {
  try {
    const { category } = req.params;

    const user = await User.findById(req.user._id);
    user.budgets = (user.budgets || []).filter(b => b.category !== category);
    await user.save();

    res.json({
      success: true,
      message: 'Budget deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const getBudgetAlerts = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const budgets = user.budgets || [];

    const alerts = [];

    for (const budget of budgets) {
      const startDate = getStartDate(budget.period);
      
      const spending = await Document.aggregate([
        {
          $match: {
            user: req.user._id,
            status: 'processed',
            category: budget.category,
            invoiceDate: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$totalAmount' }
          }
        }
      ]);

      const spent = spending[0]?.total || 0;
      const percentageUsed = (spent / budget.amount) * 100;

      if (spent > budget.amount) {
        alerts.push({
          type: 'over_budget',
          severity: 'critical',
          category: budget.category,
          budgetAmount: budget.amount,
          spent,
          overBy: spent - budget.amount,
          message: `Over budget by $${Math.round(spent - budget.amount)} in ${budget.category}`
        });
      } else if (percentageUsed >= budget.alertThreshold) {
        alerts.push({
          type: 'near_limit',
          severity: 'warning',
          category: budget.category,
          budgetAmount: budget.amount,
          spent,
          percentageUsed: Math.round(percentageUsed),
          message: `${Math.round(percentageUsed)}% of budget used in ${budget.category}`
        });
      }
    }

    res.json({
      success: true,
      alertCount: alerts.length,
      alerts
    });
  } catch (error) {
    next(error);
  }
};

export const getSpendingForecast = async (req, res, next) => {
  try {
    const { category, period = 'monthly' } = req.query;

    // Get spending for last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const query = {
      user: req.user._id,
      status: 'processed',
      invoiceDate: { $gte: sixMonthsAgo }
    };

    if (category) {
      query.category = category;
    }

    const historicalSpending = await Document.aggregate([
      { $match: query },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$invoiceDate' } },
          total: { $sum: '$totalAmount' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Calculate average and trend
    const amounts = historicalSpending.map(h => h.total);
    const avgSpending = amounts.reduce((a, b) => a + b, 0) / amounts.length;
    
    // Simple linear regression for trend
    const n = amounts.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
    
    amounts.forEach((y, x) => {
      sumX += x;
      sumY += y;
      sumXY += x * y;
      sumXX += x * x;
    });
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const trend = slope > 0 ? 'increasing' : slope < 0 ? 'decreasing' : 'stable';
    
    // Forecast next 3 months
    const forecast = [];
    for (let i = 1; i <= 3; i++) {
      const predictedAmount = avgSpending + (slope * (n + i));
      forecast.push({
        month: i,
        predictedAmount: Math.round(predictedAmount),
        confidence: 'medium'
      });
    }

    res.json({
      success: true,
      historicalAverage: Math.round(avgSpending),
      trend,
      historicalData: historicalSpending,
      forecast
    });
  } catch (error) {
    next(error);
  }
};

export const compareToLastPeriod = async (req, res, next) => {
  try {
    const { period = 'month' } = req.query;

    const currentPeriodStart = getStartDate(period);
    const lastPeriodStart = getPreviousPeriodStart(period);
    const lastPeriodEnd = new Date(currentPeriodStart.getTime() - 1);

    const currentSpending = await Document.aggregate([
      {
        $match: {
          user: req.user._id,
          status: 'processed',
          invoiceDate: { $gte: currentPeriodStart }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalAmount' },
          count: { $sum: 1 }
        }
      }
    ]);

    const lastSpending = await Document.aggregate([
      {
        $match: {
          user: req.user._id,
          status: 'processed',
          invoiceDate: { $gte: lastPeriodStart, $lte: lastPeriodEnd }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalAmount' },
          count: { $sum: 1 }
        }
      }
    ]);

    const current = currentSpending[0] || { total: 0, count: 0 };
    const last = lastSpending[0] || { total: 0, count: 0 };

    const difference = current.total - last.total;
    const percentageChange = last.total > 0 ? ((difference / last.total) * 100) : 0;

    res.json({
      success: true,
      period,
      current: {
        total: current.total,
        count: current.count
      },
      previous: {
        total: last.total,
        count: last.count
      },
      difference,
      percentageChange: Math.round(percentageChange),
      trend: difference > 0 ? 'increased' : difference < 0 ? 'decreased' : 'stable'
    });
  } catch (error) {
    next(error);
  }
};

// Helper functions
function getStartDate(period) {
  const now = new Date();
  switch (period) {
    case 'monthly':
      return new Date(now.getFullYear(), now.getMonth(), 1);
    case 'quarterly':
      const quarter = Math.floor(now.getMonth() / 3);
      return new Date(now.getFullYear(), quarter * 3, 1);
    case 'yearly':
      return new Date(now.getFullYear(), 0, 1);
    default:
      return new Date(now.getFullYear(), now.getMonth(), 1);
  }
}

function getPreviousPeriodStart(period) {
  const now = new Date();
  switch (period) {
    case 'month':
      return new Date(now.getFullYear(), now.getMonth() - 1, 1);
    case 'quarter':
      return new Date(now.getFullYear(), now.getMonth() - 3, 1);
    case 'year':
      return new Date(now.getFullYear() - 1, 0, 1);
    default:
      return new Date(now.getFullYear(), now.getMonth() - 1, 1);
  }
}
