import { Router } from 'express';
import { simulateCircuit } from '../controllers/simulationController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

// Endpoint requires authentication
// Endpoint requires authentication
router.post('/simulate', authenticate, simulateCircuit);

export default router;
