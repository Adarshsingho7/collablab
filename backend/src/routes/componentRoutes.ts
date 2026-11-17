import express from 'express';
import { getCustomComponents, createCustomComponent, deleteCustomComponent } from '../controllers/componentController';
import { authenticate } from '../middleware/authMiddleware';

const router = express.Router();


router.use(authenticate);

router.get('/', getCustomComponents);
router.post('/', createCustomComponent);
router.delete('/:id', deleteCustomComponent);

export default router;
