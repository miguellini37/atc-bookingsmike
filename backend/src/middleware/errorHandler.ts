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
  // Always log full error details for debugging
  console.error('=== ERROR DETAILS ===');
  console.error('Name:', error.name);
  console.error('Message:', error.message);
  console.error('Stack:', error.stack);

  // Handle specific error types
  if (error.name === 'ValidationError') {
    sendBadRequest(res, error.message);
    return;
  }

  // Handle Prisma connection errors
  if (error.message?.includes('prisma') || error.message?.includes('database')) {
    console.error('Database connection error detected');
  }

  // Default to 500 Internal Server Error
  // In production, include error name to help debugging
  const message = process.env.NODE_ENV === 'development'
    ? error.message
    : `Internal server error: ${error.name}`;
  sendServerError(res, message);
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
