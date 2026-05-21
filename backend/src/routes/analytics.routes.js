import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  getOverview,
  getTrends,
  getVendorAnalytics,
} from '../controllers/analytics.controller.js';

const router = express.Router();

router.use(protect);

router.get('/overview', getOverview);
router.get('/trends', getTrends);
router.get('/vendors', getVendorAnalytics);

export default router;
