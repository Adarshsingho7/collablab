import { Router } from 'express';
const router = Router();

// TODO: Implement User routes
router.get('/', (req, res) => {
  res.status(501).json({ message: 'Not Implemented' });
});

export default router;
