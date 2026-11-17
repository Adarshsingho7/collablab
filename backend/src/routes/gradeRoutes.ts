import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware';
import { submitGrade, getGrade } from '../controllers/gradeController';

const router = Router();

router.post('/:sessionId', authenticate, submitGrade);
router.get('/:sessionId', authenticate, getGrade);

export default router;
