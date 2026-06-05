import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  getPendingApprovals,
  approveInvoice,
  rejectInvoice,
  bulkApprove,
  getApprovalStats,
  getApprovalHistory,
  requiresApproval,
} from '../controllers/approval.controller.js';

const router = express.Router();

router.use(protect);

router.get('/pending', getPendingApprovals);
router.get('/stats', getApprovalStats);
router.get('/history', getApprovalHistory);
router.get('/check', requiresApproval);
router.post('/approve/:id', approveInvoice);
router.post('/reject/:id', rejectInvoice);
router.post('/bulk-approve', bulkApprove);

export default router;
