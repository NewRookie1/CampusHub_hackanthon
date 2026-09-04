import { Request, Response, NextFunction } from 'express';
import { skillGraphService } from '../services/skillGraphService.js';
import { sendSuccess } from '../utils/response.js';
import { AppError } from '../utils/AppError.js';

export const skillGraphController = {
  async getGraph(req: Request, res: Response, next: NextFunction) {
    try {
      const { role_id, user_id } = req.query;

      if (!role_id) {
        throw new AppError('role_id is required', 400, 'VALIDATION_ERROR');
      }

      const graph = await skillGraphService.getGraph(role_id as string, user_id as string);
      sendSuccess(res, graph);
    } catch (error) {
      next(error);
    }
  },

  async generateGraph(req: Request, res: Response, next: NextFunction) {
    try {
      const { role_id, user_id } = req.body;

      if (!role_id) {
        throw new AppError('role_id is required', 400, 'VALIDATION_ERROR');
      }

      const graph = await skillGraphService.generateGraph(role_id, user_id);
      sendSuccess(res, graph);
    } catch (error) {
      next(error);
    }
  },
};
