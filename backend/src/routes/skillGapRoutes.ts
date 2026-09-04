import { Router } from 'express';
import { skillGapController } from '../controllers/skillGapController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.post('/analyze', authenticate, skillGapController.analyze);
router.get('/history', authenticate, skillGapController.history);
router.post('/compare', authenticate, skillGapController.compare);

export default router;
