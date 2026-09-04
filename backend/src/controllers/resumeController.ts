import { Request, Response, NextFunction } from 'express';
import { resumeService } from '../services/resumeService.js';
import { sendSuccess } from '../utils/response.js';
import { AppError } from '../utils/AppError.js';

export const resumeController = {
  async upload(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
      if (!req.file) throw new AppError('No file uploaded', 400, 'NO_FILE');

      const resumeId = await resumeService.uploadResume(req.user.userId, req.file);
      sendSuccess(res, { resume_id: resumeId }, 201);
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const resume = await resumeService.getResumeById(req.params.id);
      sendSuccess(res, resume);
    } catch (error) {
      next(error);
    }
  },

  async getMyResumes(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
      const resumes = await resumeService.getUserResumes(req.user.userId);
      sendSuccess(res, resumes);
    } catch (error) {
      next(error);
    }
  },

  async getSkills(req: Request, res: Response, next: NextFunction) {
    try {
      const skills = await resumeService.getResumeSkills(req.params.id);
      sendSuccess(res, skills);
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
      await resumeService.deleteResume(req.params.id, req.user.userId);
      sendSuccess(res, { message: 'Resume deleted' });
    } catch (error) {
      next(error);
    }
  },
};
