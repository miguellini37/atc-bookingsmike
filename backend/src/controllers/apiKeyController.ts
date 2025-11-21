import { Response } from 'express';
import { randomBytes } from 'crypto';
import { AuthenticatedRequest } from '../types';
import {
  sendSuccess,
  sendCreated,
  sendNoContent,
  sendNotFound,
  sendValidationError,
  sendBadRequest,
} from '../utils/responses';
import {
  createApiKeySchema,
  updateApiKeySchema,
  formatZodErrors,
  authSchema,
} from '../utils/validation';
import { prisma } from '../utils/database';

/**
 * Generate a random API key
 */
const generateApiKey = (): string => {
  return randomBytes(32).toString('hex');
};

/**
 * Authenticate with secret key and set cookie
 * POST /api/auth/secret-key
 */
export const authenticateSecretKey = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const validationResult = authSchema.safeParse(req.body);

    if (!validationResult.success) {
      return sendValidationError(res, formatZodErrors(validationResult.error));
    }

    const { secretKey } = validationResult.data;

    if (secretKey !== process.env.SECRET_KEY) {
      return sendBadRequest(res, 'Invalid secret key');
    }

    // Set secure cookie
    res.cookie('secret_key', secretKey, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    return sendSuccess(res, { authenticated: true });
  } catch (error) {
    console.error('Error authenticating secret key:', error);
    throw error;
  }
};

/**
 * Logout and clear secret key cookie
 * POST /api/auth/logout
 */
export const logout = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  res.clearCookie('secret_key');
  return sendSuccess(res, { loggedOut: true });
};

/**
 * Get all API keys
 * GET /api/keys
 */
export const getApiKeys = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const apiKeys = await prisma.apiKey.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { bookings: true },
        },
      },
    });

    return sendSuccess(res, apiKeys);
  } catch (error) {
    console.error('Error fetching API keys:', error);
    throw error;
  }
};

/**
 * Get a single API key by ID
 * GET /api/keys/:id
 */
export const getApiKeyById = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return sendBadRequest(res, 'Invalid API key ID');
    }

    const apiKey = await prisma.apiKey.findUnique({
      where: { id },
      include: {
        _count: {
          select: { bookings: true },
        },
      },
    });

    if (!apiKey) {
      return sendNotFound(res, 'API key not found');
    }

    return sendSuccess(res, apiKey);
  } catch (error) {
    console.error('Error fetching API key:', error);
    throw error;
  }
};

/**
 * Create a new API key
 * POST /api/keys
 */
export const createApiKey = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const validationResult = createApiKeySchema.safeParse(req.body);

    if (!validationResult.success) {
      return sendValidationError(res, formatZodErrors(validationResult.error));
    }

    const data = validationResult.data;

    // Generate unique API key
    const key = generateApiKey();

    const apiKey = await prisma.apiKey.create({
      data: {
        cid: data.cid,
        name: data.name,
        key,
        division: data.division,
        subdivision: data.subdivision,
      },
    });

    return sendCreated(res, apiKey);
  } catch (error) {
    console.error('Error creating API key:', error);
    throw error;
  }
};

/**
 * Update an existing API key
 * PUT /api/keys/:id
 */
export const updateApiKey = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return sendBadRequest(res, 'Invalid API key ID');
    }

    const existingApiKey = await prisma.apiKey.findUnique({
      where: { id },
    });

    if (!existingApiKey) {
      return sendNotFound(res, 'API key not found');
    }

    const validationResult = updateApiKeySchema.safeParse(req.body);

    if (!validationResult.success) {
      return sendValidationError(res, formatZodErrors(validationResult.error));
    }

    const data = validationResult.data;

    const apiKey = await prisma.apiKey.update({
      where: { id },
      data: {
        ...(data.cid && { cid: data.cid }),
        ...(data.name && { name: data.name }),
        ...(data.division && { division: data.division }),
        ...(data.subdivision !== undefined && { subdivision: data.subdivision }),
      },
    });

    return sendSuccess(res, apiKey);
  } catch (error) {
    console.error('Error updating API key:', error);
    throw error;
  }
};

/**
 * Delete an API key
 * DELETE /api/keys/:id
 */
export const deleteApiKey = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return sendBadRequest(res, 'Invalid API key ID');
    }

    const existingApiKey = await prisma.apiKey.findUnique({
      where: { id },
    });

    if (!existingApiKey) {
      return sendNotFound(res, 'API key not found');
    }

    // Delete API key (bookings will be cascade deleted)
    await prisma.apiKey.delete({
      where: { id },
    });

    return sendNoContent(res);
  } catch (error) {
    console.error('Error deleting API key:', error);
    throw error;
  }
};
