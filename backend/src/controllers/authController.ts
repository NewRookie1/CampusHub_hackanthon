import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { userRepository } from '../repositories/userRepository.js';
import { sendSuccess } from '../utils/response.js';
import { AppError } from '../utils/AppError.js';
import { appConfig } from '../config/index.js';

export const authController = {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, firstName, lastName } = req.body;

      if (!email || !password || !firstName || !lastName) {
        throw new AppError('Email, password, firstName, and lastName are required', 400, 'VALIDATION_ERROR');
      }

      if (password.length < 8) {
        throw new AppError('Password must be at least 8 characters', 400, 'VALIDATION_ERROR');
      }

      const existing = await userRepository.findByEmail(email);
      if (existing) {
        throw new AppError('Email already registered', 409, 'CONFLICT');
      }

      const passwordHash = await bcrypt.hash(password, 12);
      const user = await userRepository.create({
        email,
        passwordHash,
        firstName,
        lastName,
        role: 'STUDENT',
      });

      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        appConfig.jwt.secret,
        { expiresIn: appConfig.jwt.expiresIn }
      );

      sendSuccess(res, {
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
      }, 201);
    } catch (error) {
      next(error);
    }
  },

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        throw new AppError('Email and password are required', 400, 'VALIDATION_ERROR');
      }

      const user = await userRepository.findByEmail(email);
      if (!user) {
        throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
      }

      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) {
        throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
      }

      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        appConfig.jwt.secret,
        { expiresIn: appConfig.jwt.expiresIn }
      );

      sendSuccess(res, {
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  async me(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
      const user = await userRepository.findById(req.user.userId);
      if (!user) throw new AppError('User not found', 404, 'NOT_FOUND');

      sendSuccess(res, {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        avatarUrl: user.avatarUrl,
      });
    } catch (error) {
      next(error);
    }
  },
};
