import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware';
import { 
  createSharedSession, 
  getCollaborators, 
  addCollaborator,
  updateCollaboratorRole, 
  removeCollaborator,
  submitSession,
  getSession,
  getUserSessions
} from '../controllers/sessionController';

const router = Router();

router.post('/share', authenticate, createSharedSession);
router.get('/', authenticate, getUserSessions);
router.get('/:id', authenticate, getSession);
router.post('/:id/submit', authenticate, submitSession);
router.get('/:id/collaborators', authenticate, getCollaborators);
router.post('/:id/collaborators', authenticate, addCollaborator);
router.patch('/:id/collaborators/:collaboratorId', authenticate, updateCollaboratorRole);
router.delete('/:id/collaborators/:collaboratorId', authenticate, removeCollaborator);

export default router;
