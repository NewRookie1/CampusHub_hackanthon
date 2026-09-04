import { Router } from 'express';
import multer from 'multer';
import { resumeController } from '../controllers/resumeController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

router.post('/upload', authenticate, upload.single('resume'), resumeController.upload);
router.get('/my', authenticate, resumeController.getMyResumes);
router.get('/:id', authenticate, resumeController.getById);
router.get('/:id/skills', authenticate, resumeController.getSkills);
router.delete('/:id', authenticate, resumeController.delete);

export default router;
