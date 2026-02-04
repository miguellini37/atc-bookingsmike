import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { sendUnauthorized } from '../utils/responses';
import { prisma } from '../utils/database';

/**
 * Middleware to verify Bearer token authentication (required)
 * Validates the API key from Authorization header
 */
export const requireAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      sendUnauthorized(res, 'Authorization token required');
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Find API key in database
    const apiKey = await prisma.apiKey.findUnique({
      where: { key: token },
    });

    if (!apiKey) {
      sendUnauthorized(res, 'Invalid API key');
      return;
    }

    // Attach API key to request
    req.apiKey = apiKey;
    next();
  } catch (error) {
    sendUnauthorized(res, 'Authentication failed');
  }
};

/**
 * Middleware to verify Bearer token authentication (optional)
 * Allows requests without authentication but validates if provided
 */
export const optionalAuth = async (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    // If no auth header, continue without authentication
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      next();
      return;
    }

    const token = authHeader.substring(7);

    // Find API key in database
    const apiKey = await prisma.apiKey.findUnique({
      where: { key: token },
    });

    if (apiKey) {
      req.apiKey = apiKey;
    }

    next();
  } catch (error) {
    // On error, continue without authentication
    next();
  }
};

/**
 * Middleware to verify cookie-based secret key authentication
 * Used for admin panel access
 */
export const requireSecretKey = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const cookieSecretKey = req.cookies?.secret_key;
  const envSecretKey = process.env.SECRET_KEY;

  if (!cookieSecretKey || cookieSecretKey !== envSecretKey) {
    sendUnauthorized(res, 'Invalid or missing secret key');
    return;
  }

  next();
};
