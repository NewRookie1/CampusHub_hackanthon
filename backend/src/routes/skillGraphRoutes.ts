import { Router } from 'express';
import { skillGraphController } from '../controllers/skillGraphController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticate, skillGraphController.getGraph);
router.post('/generate', authenticate, skillGraphController.generateGraph);

export default router;
