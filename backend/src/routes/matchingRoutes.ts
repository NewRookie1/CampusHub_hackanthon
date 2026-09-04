import { Router } from 'express';
import { matchingController } from '../controllers/matchingController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.post('/match', authenticate, matchingController.matchResume);
router.get('/my-matches', authenticate, matchingController.getMyMatches);
router.get('/best-opportunities', authenticate, matchingController.getBestOpportunities);
router.get('/opportunities', matchingController.listOpportunities);
router.get('/opportunities/:id', matchingController.getOpportunity);

export default router;
