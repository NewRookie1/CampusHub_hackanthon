import { Request, Response, NextFunction } from 'express';
import { skillGapService } from '../services/skillGapService.js';
import { sendSuccess } from '../utils/response.js';
import { AppError } from '../utils/AppError.js';

export const skillGapController = {
  async analyze(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
      const { resume_id, target_role, role_id } = req.body;

      if (!resume_id || !target_role) {
        throw new AppError('resume_id and target_role are required', 400, 'VALIDATION_ERROR');
      }

      const analysis = await skillGapService.analyzeSkillGap(
        resume_id,
        target_role,
        role_id,
        req.user.userId
      );

      sendSuccess(res, {
        target_role: analysis.targetRole,
        existing_skills: analysis.existingSkills.map(s => ({
          id: s.id, name: s.name, category: s.category, proficiency: s.proficiency,
        })),
        missing_skills: analysis.missingSkills.map(s => ({
          id: s.id, name: s.name, category: s.category, proficiency: s.proficiency,
        })),
        weak_skills: analysis.weakSkills.map(s => ({
          id: s.id, name: s.name, category: s.category, proficiency: s.proficiency,
        })),
        priority_skills: analysis.prioritySkills.map(s => ({
          id: s.id, name: s.name, category: s.category, proficiency: s.proficiency,
        })),
        coverage_score: analysis.coverageScore,
        recommendations: analysis.recommendations,
      });
    } catch (error) {
      next(error);
    }
  },

  async history(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
      const history = await skillGapService.getHistory(req.user.userId);
      sendSuccess(res, history);
    } catch (error) {
      next(error);
    }
  },

  async compare(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
      const { resume_id, role_ids } = req.body;

      if (!resume_id || !role_ids?.length) {
        throw new AppError('resume_id and role_ids are required', 400, 'VALIDATION_ERROR');
      }

      const comparisons = await skillGapService.getComparison(resume_id, role_ids);
      sendSuccess(res, comparisons);
    } catch (error) {
      next(error);
    }
  },
};
