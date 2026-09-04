import { Response } from 'express';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

export function sendSuccess<T>(res: Response, data: T, statusCode: number = 200): void {
  const response: ApiResponse<T> = { success: true, data };
  res.status(statusCode).json(response);
}

export function sendError(res: Response, code: string, message: string, statusCode: number = 500): void {
  const response: ApiResponse = { success: false, error: { code, message } };
  res.status(statusCode).json(response);
}

export function sendPaginated<T>(res: Response, data: T[], page: number, limit: number, total: number): void {
  const response: ApiResponse<T[]> = {
    success: true,
    data,
    meta: { page, limit, total },
  };
  res.status(200).json(response);
}
