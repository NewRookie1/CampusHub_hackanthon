import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError.js';
import { sendError } from '../utils/response.js';
import { ZodError } from 'zod';

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof AppError) {
    sendError(res, err.code, err.message, err.statusCode);
    return;
  }

  if (err instanceof ZodError) {
    const message = err.errors.map(e => `${e.path.join('.')}: ${e.message}`).join('; ');
    sendError(res, 'VALIDATION_ERROR', message, 400);
    return;
  }

  console.error('Unhandled error:', err);
  sendError(res, 'INTERNAL_ERROR', 'An unexpected error occurred', 500);
}
