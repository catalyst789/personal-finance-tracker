import { Request, Response, NextFunction } from 'express';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  // eslint-disable-line @typescript-eslint/no-unused-vars
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  res.status(status).json({
    success: false,
    error: message,
    details: err.details || undefined,
  });
} 