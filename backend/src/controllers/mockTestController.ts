import { Request, Response, NextFunction } from 'express';
import { mockTestService } from '../services/mockTestService.js';
import { sendSuccess } from '../utils/response.js';
import { AppError } from '../utils/AppError.js';
import { EXAM_TYPES } from '../schemas/mockTest.js';

export const mockTestController = {
  async getExamTypes(_req: Request, res: Response, next: NextFunction) {
    try {
      const types = Object.entries(EXAM_TYPES).map(([key, config]) => ({
        id: key,
        name: config.name,
        fullName: config.fullName,
        subjects: config.subjects,
        questionTypes: config.questionTypes,
        defaultTime: config.defaultTime,
        totalMarks: config.totalMarks,
        sections: config.sections,
      }));
      sendSuccess(res, types);
    } catch (error) {
      next(error);
    }
  },

  async startTest(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
      const { exam_type, subject, difficulty, num_questions, time_limit_minutes } = req.body;

      if (!exam_type || !subject) {
        throw new AppError('exam_type and subject are required', 400, 'VALIDATION_ERROR');
      }

      const session = await mockTestService.startTest(req.user.userId, {
        examType: exam_type,
        subject,
        difficulty,
        numQuestions: num_questions,
        timeLimitMinutes: time_limit_minutes,
      });

      sendSuccess(res, session, 201);
    } catch (error) {
      next(error);
    }
  },

  async startAttempt(req: Request, res: Response, next: NextFunction) {
    try {
      const session = await mockTestService.startAttempt(req.params.id);
      sendSuccess(res, session);
    } catch (error) {
      next(error);
    }
  },

  async submitAnswer(req: Request, res: Response, next: NextFunction) {
    try {
      const { test_id, question_index, answer, time_taken_seconds } = req.body;

      if (!test_id || question_index === undefined || !answer) {
        throw new AppError('test_id, question_index, and answer are required', 400, 'VALIDATION_ERROR');
      }

      const result = await mockTestService.submitAnswer(test_id, question_index, answer, time_taken_seconds);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  },

  async completeTest(req: Request, res: Response, next: NextFunction) {
    try {
      const { test_id } = req.body;
      if (!test_id) throw new AppError('test_id is required', 400, 'VALIDATION_ERROR');

      const evaluation = await mockTestService.completeTest(test_id);
      sendSuccess(res, evaluation);
    } catch (error) {
      next(error);
    }
  },

  async getTest(req: Request, res: Response, next: NextFunction) {
    try {
      const test = await mockTestService.getTest(req.params.id);
      sendSuccess(res, test);
    } catch (error) {
      next(error);
    }
  },

  async getMyTests(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
      const tests = await mockTestService.getUserTests(req.user.userId);
      sendSuccess(res, tests);
    } catch (error) {
      next(error);
    }
  },

  async getTestResults(req: Request, res: Response, next: NextFunction) {
    try {
      const results = await mockTestService.getTestResults(req.params.id);
      sendSuccess(res, results);
    } catch (error) {
      next(error);
    }
  },

  async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
      const stats = await mockTestService.getStats(req.user.userId);
      sendSuccess(res, stats);
    } catch (error) {
      next(error);
    }
  },

  async abandonTest(req: Request, res: Response, next: NextFunction) {
    try {
      await mockTestService.abandonTest(req.params.id);
      sendSuccess(res, { message: 'Test abandoned' });
    } catch (error) {
      next(error);
    }
  },

  async deleteTest(req: Request, res: Response, next: NextFunction) {
    try {
      await mockTestService.deleteTest(req.params.id);
      sendSuccess(res, { message: 'Test deleted' });
    } catch (error) {
      next(error);
    }
  },
};
