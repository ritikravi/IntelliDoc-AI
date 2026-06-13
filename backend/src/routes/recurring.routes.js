import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  detectRecurringInvoices,
  getSubscriptions,
  markAsSubscription,
  cancelSubscription,
  getSubscriptionAnalytics,
  compareRecurringCosts,
  getAnomalies,
} from '../controllers/recurring.controller.js';

const router = express.Router();

router.use(protect);

router.get('/detect', detectRecurringInvoices);
router.get('/subscriptions', getSubscriptions);
router.get('/subscriptions/analytics', getSubscriptionAnalytics);
router.get('/compare', compareRecurringCosts);
router.get('/anomalies', getAnomalies);
router.post('/subscription/:vendorName', markAsSubscription);
router.delete('/subscription/:vendorName', cancelSubscription);

export default router;
