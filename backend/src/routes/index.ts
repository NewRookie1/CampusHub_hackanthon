import { Router } from 'express';
import authRoutes from './authRoutes.js';
import resumeRoutes from './resumeRoutes.js';
import skillGapRoutes from './skillGapRoutes.js';
import matchingRoutes from './matchingRoutes.js';
import skillGraphRoutes from './skillGraphRoutes.js';
import plannerRoutes from './plannerRoutes.js';
import interviewRoutes from './interviewRoutes.js';
import roleRoutes from './roleRoutes.js';
import mockTestRoutes from './mockTestRoutes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/resume', resumeRoutes);
router.use('/skill-gap', skillGapRoutes);
router.use('/matching', matchingRoutes);
router.use('/skill-graph', skillGraphRoutes);
router.use('/planner', plannerRoutes);
router.use('/interview', interviewRoutes);
router.use('/roles', roleRoutes);
router.use('/mock-test', mockTestRoutes);

export default router;
