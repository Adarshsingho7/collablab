import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware';
import { generateReport, getReport, downloadReport } from '../controllers/reportController';

const router = Router();

router.post('/generate', authenticate, generateReport);
router.get('/download/:filename', authenticate, downloadReport);
router.get('/:sessionId', authenticate, getReport);

export default router;
