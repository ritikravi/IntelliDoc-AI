import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  getOverdueInvoices,
  getUpcomingDue,
  markAsPaid,
  getPaymentSummary,
  getVendorSpending,
  getCashFlowProjection,
} from '../controllers/notification.controller.js';

const router = express.Router();

router.use(protect);

router.get('/overdue', getOverdueInvoices);
router.get('/upcoming', getUpcomingDue);
router.get('/payment-summary', getPaymentSummary);
router.get('/vendor-spending', getVendorSpending);
router.get('/cash-flow', getCashFlowProjection);
router.patch('/mark-paid/:id', markAsPaid);

export default router;
