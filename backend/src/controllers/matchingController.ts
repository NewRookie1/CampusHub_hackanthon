import { Request, Response, NextFunction } from 'express';
import { matchingService } from '../services/matchingService.js';
import { opportunityRepository } from '../repositories/opportunityRepository.js';
import { sendSuccess, sendPaginated } from '../utils/response.js';
import { AppError } from '../utils/AppError.js';

export const matchingController = {
  async matchResume(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
      const { resume_id, opportunity_id } = req.body;

      if (!resume_id || !opportunity_id) {
        throw new AppError('resume_id and opportunity_id are required', 400, 'VALIDATION_ERROR');
      }

      const result = await matchingService.matchResumeToOpportunity(
        resume_id,
        opportunity_id,
        req.user.userId
      );
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  },

  async getMyMatches(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
      const matches = await matchingService.getOpportunityMatches(req.user.userId);
      sendSuccess(res, matches);
    } catch (error) {
      next(error);
    }
  },

  async getBestOpportunities(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
      const { resume_id, limit } = req.query;

      if (!resume_id) {
        throw new AppError('resume_id query parameter is required', 400, 'VALIDATION_ERROR');
      }

      const results = await matchingService.findBestOpportunities(
        req.user.userId,
        resume_id as string,
        limit ? parseInt(limit as string) : 10
      );
      sendSuccess(res, results);
    } catch (error) {
      next(error);
    }
  },

  async listOpportunities(req: Request, res: Response, next: NextFunction) {
    try {
      const { type, category, location, isRemote, search, page, limit } = req.query;
      const result = await opportunityRepository.findMany({
        type: type as string,
        category: category as string,
        location: location as string,
        isRemote: isRemote === 'true' ? true : isRemote === 'false' ? false : undefined,
        search: search as string,
        page: page ? parseInt(page as string) : 1,
        limit: limit ? parseInt(limit as string) : 20,
      });
      sendPaginated(res, result.data, page ? parseInt(page as string) : 1, limit ? parseInt(limit as string) : 20, result.total);
    } catch (error) {
      next(error);
    }
  },

  async getOpportunity(req: Request, res: Response, next: NextFunction) {
    try {
      const opp = await opportunityRepository.findById(req.params.id);
      if (!opp) throw new AppError('Opportunity not found', 404, 'NOT_FOUND');
      sendSuccess(res, opp);
    } catch (error) {
      next(error);
    }
  },
};
