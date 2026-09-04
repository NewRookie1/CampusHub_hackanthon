import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { appConfig } from '../config/index.js';
import { UnauthorizedError } from '../utils/AppError.js';

export interface AuthPayload {
  userId: string;
  email: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return next(new UnauthorizedError('Missing or invalid authorization header'));
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, appConfig.jwt.secret) as AuthPayload;
    req.user = decoded;
    next();
  } catch {
    next(new UnauthorizedError('Invalid or expired token'));
  }
}

export function authorize(...roles: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new UnauthorizedError());
    }
    if (roles.length > 0 && !roles.includes(req.user.role)) {
      return next(new UnauthorizedError('Insufficient permissions'));
    }
    next();
  };
}
