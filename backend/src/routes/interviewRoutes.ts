import { Router } from 'express';
import { interviewController } from '../controllers/interviewController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.post('/start', authenticate, interviewController.startSession);
router.post('/evaluate', authenticate, interviewController.evaluateAnswer);
router.get('/my', authenticate, interviewController.getMySessions);
router.get('/:id', authenticate, interviewController.getSession);
router.post('/:id/abandon', authenticate, interviewController.abandonSession);

export default router;
