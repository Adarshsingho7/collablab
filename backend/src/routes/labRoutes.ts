import { Router } from 'express';
import { createLab, getLabs, getLabById, getLiveSessions, getSubmittedSessions } from '../controllers/labController';
import { authenticate, requireRole } from '../middleware/authMiddleware';

const router = Router();

router.post('/', createLab);
router.get('/', getLabs);
router.get('/live-sessions', getLiveSessions);
router.get('/submissions', getSubmittedSessions);
router.get('/student-or-teacher', authenticate, (_req, res) => {
  res.status(200).json({ message: 'Authorized' });
});
router.post('/teacher-only', authenticate, requireRole('TEACHER'), (_req, res) => {
  res.status(200).json({ message: 'Authorized teacher' });
});
router.get('/:id', getLabById);

export default router;
