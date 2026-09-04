import { Router } from 'express';
import { plannerController } from '../controllers/plannerController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.post('/generate', authenticate, plannerController.generate);
router.get('/my', authenticate, plannerController.getMySchedules);
router.get('/:id', authenticate, plannerController.getSchedule);
router.post('/progress', authenticate, plannerController.updateProgress);

export default router;
