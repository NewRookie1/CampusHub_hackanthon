import { Request, Response, NextFunction } from 'express';
import { plannerService } from '../services/plannerService.js';
import { sendSuccess } from '../utils/response.js';
import { AppError } from '../utils/AppError.js';

export const plannerController = {
  async generate(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
      const {
        target_role,
        role_id,
        available_days,
        hours_per_day,
        start_date,
        priorities,
        include_interview_prep,
      } = req.body;

      if (!target_role || !available_days || !hours_per_day) {
        throw new AppError(
          'target_role, available_days, and hours_per_day are required',
          400,
          'VALIDATION_ERROR'
        );
      }

      const schedule = await plannerService.generateSchedule({
        userId: req.user.userId,
        targetRole: target_role,
        roleId: role_id,
        availableDays: available_days,
        hoursPerDay: hours_per_day,
        startDate: start_date,
        priorities,
        includeInterviewPrep: include_interview_prep,
      });

      sendSuccess(res, schedule, 201);
    } catch (error) {
      next(error);
    }
  },

  async getSchedule(req: Request, res: Response, next: NextFunction) {
    try {
      const schedule = await plannerService.getSchedule(req.params.id);
      sendSuccess(res, schedule);
    } catch (error) {
      next(error);
    }
  },

  async getMySchedules(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
      const schedules = await plannerService.getUserSchedules(req.user.userId);
      sendSuccess(res, schedules);
    } catch (error) {
      next(error);
    }
  },

  async updateProgress(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
      const { schedule_id, day, topic_id, completed } = req.body;

      const dayNum = typeof day === 'string' ? parseInt(day, 10) : day;
      if (!schedule_id || dayNum === undefined || dayNum === null || isNaN(dayNum) || !topic_id || completed === undefined) {
        throw new AppError(
          'schedule_id, day, topic_id, and completed are required',
          400,
          'VALIDATION_ERROR'
        );
      }

      const result = await plannerService.updateProgress(schedule_id, dayNum, topic_id, completed);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  },
};
