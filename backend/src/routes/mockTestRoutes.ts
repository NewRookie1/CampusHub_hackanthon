import { Router } from 'express';
import { mockTestController } from '../controllers/mockTestController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/exam-types', mockTestController.getExamTypes);
router.post('/start', authenticate, mockTestController.startTest);
router.post('/attempt/:id', authenticate, mockTestController.startAttempt);
router.post('/answer', authenticate, mockTestController.submitAnswer);
router.post('/complete', authenticate, mockTestController.completeTest);
router.get('/my', authenticate, mockTestController.getMyTests);
router.get('/stats', authenticate, mockTestController.getStats);
router.get('/:id', authenticate, mockTestController.getTest);
router.get('/:id/results', authenticate, mockTestController.getTestResults);
router.post('/:id/abandon', authenticate, mockTestController.abandonTest);
router.delete('/:id', authenticate, mockTestController.deleteTest);

export default router;
