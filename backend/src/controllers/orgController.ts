import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import { sendSuccess } from '../utils/responses';
import { prisma } from '../utils/database';

/**
 * Get the authenticated organization's info
 * GET /api/org/me
 */
export const getMyOrganization = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const apiKey = await prisma.apiKey.findUnique({
      where: { id: req.apiKey!.id },
      select: {
        id: true,
        name: true,
        division: true,
        subdivision: true,
        createdAt: true,
        _count: {
          select: { bookings: true },
        },
      },
    });

    return sendSuccess(res, apiKey);
  } catch (error) {
    console.error('Error fetching organization:', error);
    throw error;
  }
};

/**
 * Get bookings for the authenticated organization only
 * GET /api/org/bookings
 */
export const getMyBookings = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const bookings = await prisma.booking.findMany({
      where: {
        apiKeyId: req.apiKey!.id,
      },
      include: {
        apiKey: {
          select: {
            id: true,
            name: true,
            division: true,
            subdivision: true,
          },
        },
      },
      orderBy: { start: 'asc' },
    });

    return sendSuccess(res, bookings);
  } catch (error) {
    console.error('Error fetching organization bookings:', error);
    throw error;
  }
};
