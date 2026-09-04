import { Router } from 'express';
import { roleController } from '../controllers/roleController.js';

const router = Router();

router.get('/', roleController.list);
router.get('/skills', roleController.listSkills);
router.get('/:id', roleController.getById);

export default router;
