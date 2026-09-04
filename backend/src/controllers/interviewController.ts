import { Request, Response, NextFunction } from 'express';
import { aiHrService } from '../services/aiHrService.js';
import { sendSuccess } from '../utils/response.js';
import { AppError } from '../utils/AppError.js';

export const interviewController = {
  async startSession(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
      const { role_id, stage, difficulty, num_questions } = req.body;

      const session = await aiHrService.startSession(req.user.userId, {
        roleId: role_id,
        stage,
        difficulty,
        numQuestions: num_questions,
      });

      sendSuccess(res, session, 201);
    } catch (error) {
      next(error);
    }
  },

  async evaluateAnswer(req: Request, res: Response, next: NextFunction) {
    try {
      const { session_id, question_id, answer } = req.body;

      if (!session_id || !question_id || !answer) {
        throw new AppError('session_id, question_id, and answer are required', 400, 'VALIDATION_ERROR');
      }

      const result = await aiHrService.evaluateAnswer(session_id, question_id, answer);
      sendSuccess(res, {
        evaluation: result.evaluation,
        next_question: result.nextQuestion,
        session_complete: result.sessionComplete,
        current_score: result.currentScore,
      });
    } catch (error) {
      next(error);
    }
  },

  async getSession(req: Request, res: Response, next: NextFunction) {
    try {
      const session = await aiHrService.getSession(req.params.id);
      sendSuccess(res, session);
    } catch (error) {
      next(error);
    }
  },

  async getMySessions(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
      const sessions = await aiHrService.getUserSessions(req.user.userId);
      sendSuccess(res, sessions);
    } catch (error) {
      next(error);
    }
  },

  async abandonSession(req: Request, res: Response, next: NextFunction) {
    try {
      await aiHrService.abandonSession(req.params.id);
      sendSuccess(res, { message: 'Session abandoned' });
    } catch (error) {
      next(error);
    }
  },
};
