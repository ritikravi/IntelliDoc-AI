import express from 'express';
import multer from 'multer';
import { protect } from '../middleware/auth.js';
import { auditLogger } from '../middleware/auditLogger.js';
import {
  uploadDocument,
  getDocuments,
  getDocument,
  deleteDocument,
  processDocument,
  exportDocuments,
  bulkDelete,
  getStats,
  detectDuplicates,
  fraudDetection,
  searchDocuments,
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

router.post('/upload', upload.single('file'), auditLogger('created'), uploadDocument);
router.get('/', getDocuments);
router.get('/stats', getStats);
router.get('/search', searchDocuments);
router.get('/duplicates', detectDuplicates);
router.get('/fraud-detection', fraudDetection);
router.get('/export', auditLogger('exported'), exportDocuments);
router.get('/:id', auditLogger('viewed'), getDocument);
router.delete('/:id', auditLogger('deleted'), deleteDocument);
router.post('/bulk-delete', auditLogger('deleted'), bulkDelete);
router.post('/process/:id', auditLogger('updated'), processDocument);

export default router;
