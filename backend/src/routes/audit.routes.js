import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  getDocumentHistory,
  getUserAuditLogs,
  getAuditStats,
  exportAuditLogs,
} from '../controllers/audit.controller.js';

const router = express.Router();

router.use(protect);

router.get('/document/:documentId', getDocumentHistory);
router.get('/logs', getUserAuditLogs);
router.get('/stats', getAuditStats);
router.get('/export', exportAuditLogs);

export default router;
