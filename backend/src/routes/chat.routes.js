import express from 'express';
import { protect } from '../middleware/auth.js';
import { chatQuery } from '../controllers/chat.controller.js';

const router = express.Router();

router.use(protect);

router.post('/query', chatQuery);

export default router;
