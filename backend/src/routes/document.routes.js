import express from 'express';
import multer from 'multer';
import { protect } from '../middleware/auth.js';
import {
  uploadDocument,
  getDocuments,
  getDocument,
  deleteDocument,
  processDocument,
  exportDocuments,
} from '../controllers/document.controller.js';

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || 10485760), // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF and images are allowed.'));
    }
  },
});

router.use(protect);

router.post('/upload', upload.single('file'), uploadDocument);
router.get('/', getDocuments);
router.get('/:id', getDocument);
router.delete('/:id', deleteDocument);
router.post('/process/:id', processDocument);
router.get('/export', exportDocuments);

export default router;
