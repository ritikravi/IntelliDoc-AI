import express from 'express';
import { protect } from '../middleware/auth.js';
import { search, semanticSearch } from '../controllers/search.controller.js';

const router = express.Router();

router.use(protect);

router.get('/', search);
router.post('/semantic', semanticSearch);

export default router;
