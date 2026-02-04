import { Request, Response, NextFunction } from 'express';
import { sendServerError, sendBadRequest } from '../utils/responses';

/**
 * Global error handling middleware
 * Catches all errors and sends appropriate responses
 */
export const errorHandler = (
  error: Error,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void => {
  console.error('Error:', error);

  // Log to Sentry in production
  if (process.env.SENTRY_DSN && process.env.NODE_ENV === 'production') {
    // TODO: Integrate Sentry SDK
    console.error('Sentry logging would happen here:', error);
  }

  // Handle specific error types
  if (error.name === 'ValidationError') {
    sendBadRequest(res, error.message);
    return;
  }

  // Default to 500 Internal Server Error
  sendServerError(res, process.env.NODE_ENV === 'development' ? error.message : undefined);
};

/**
 * 404 Not Found handler for undefined routes
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found`,
  });
};
