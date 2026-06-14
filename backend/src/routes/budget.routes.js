import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  setBudget,
  getBudgets,
  deleteBudget,
  getBudgetAlerts,
  getSpendingForecast,
  compareToLastPeriod,
} from '../controllers/budget.controller.js';

const router = express.Router();

router.use(protect);

router.post('/', setBudget);
router.get('/', getBudgets);
router.get('/alerts', getBudgetAlerts);
router.get('/forecast', getSpendingForecast);
router.get('/compare', compareToLastPeriod);
router.delete('/:category', deleteBudget);

export default router;
