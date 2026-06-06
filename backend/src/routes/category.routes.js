import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  categorizeDocument,
  autoCategorizeAll,
  getCategoryStats,
  getTagCloud,
  getByCategory,
  getByTag,
  addTag,
  removeTag,
} from '../controllers/category.controller.js';

const router = express.Router();

router.use(protect);

router.post('/categorize/:id', categorizeDocument);
router.post('/auto-categorize', autoCategorizeAll);
router.get('/stats', getCategoryStats);
router.get('/tags', getTagCloud);
router.get('/category/:category', getByCategory);
router.get('/tag/:tag', getByTag);
router.post('/tag/:id', addTag);
router.delete('/tag/:id/:tag', removeTag);

export default router;
