import { Request, Response, NextFunction } from 'express';
import { roleRepository } from '../repositories/roleRepository.js';
import { skillRepository } from '../repositories/skillRepository.js';
import { sendSuccess } from '../utils/response.js';
import { AppError } from '../utils/AppError.js';

export const roleController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { category, search } = req.query;
      const roles = await roleRepository.findMany({
        category: category as string,
        search: search as string,
      });
      sendSuccess(res, roles);
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const role = await roleRepository.findById(req.params.id);
      if (!role) throw new AppError('Role not found', 404, 'NOT_FOUND');
      sendSuccess(res, role);
    } catch (error) {
      next(error);
    }
  },

  async listSkills(req: Request, res: Response, next: NextFunction) {
    try {
      const { category, search } = req.query;
      const skills = await skillRepository.findMany({
        category: category as string,
        search: search as string,
      });
      sendSuccess(res, skills);
    } catch (error) {
      next(error);
    }
  },
};
