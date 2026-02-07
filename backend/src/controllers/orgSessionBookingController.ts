import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import {
  sendSuccess,
  sendCreated,
  sendNoContent,
  sendNotFound,
  sendBadRequest,
  sendForbidden,
  sendValidationError,
} from '../utils/responses';
import {
  createBookingSchema,
  updateBookingSchema,
  formatZodErrors,
  validateBookingTimes,
} from '../utils/validation';
import { prisma, checkBookingOverlap } from '../utils/database';
import { Prisma } from '@prisma/client';

/**
 * Get bookings for the current organization
 * GET /org/session/bookings
 * Admin/manager: all org bookings. Member: own bookings only (by CID)
 */
export const getBookings = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const { role, cid } = req.orgSession!;
    const where: Prisma.BookingWhereInput = { apiKeyId: req.apiKey!.id };

    // Members can only see their own bookings
    if (role === 'member') {
      where.cid = cid;
    }

    const bookings = await prisma.booking.findMany({
      where,
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
    console.error('Error fetching bookings:', error);
    throw error;
  }
};

/**
 * Create a booking
 * POST /org/session/bookings
 * Member: force CID to session CID. Admin/manager: any CID
 */
export const createBooking = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const { role, cid: sessionCid } = req.orgSession!;

    // Force CID for members
    if (role === 'member') {
      req.body.cid = sessionCid;
    }

    const validationResult = createBookingSchema.safeParse(req.body);

    if (!validationResult.success) {
      return sendValidationError(res, formatZodErrors(validationResult.error));
    }

    const data = validationResult.data;
    const start = new Date(data.start);
    const end = new Date(data.end);

    const timeError = validateBookingTimes(start, end);
    if (timeError) {
      return sendValidationError(res, { time: [timeError] });
    }

    const hasOverlap = await checkBookingOverlap(data.callsign, start, end);
    if (hasOverlap) {
      return sendValidationError(res, {
        booking: ['This callsign already has a booking during this time period'],
      });
    }

    const booking = await prisma.booking.create({
      data: {
        cid: data.cid,
        callsign: data.callsign.toUpperCase(),
        type: data.type,
        start,
        end,
        division: data.division,
        subdivision: data.subdivision,
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
    });

    return sendCreated(res, booking);
  } catch (error) {
    console.error('Error creating booking:', error);
    throw error;
  }
};

/**
 * Update a booking
 * PUT /org/session/bookings/:id
 * Member: only own bookings (by CID). Admin/manager: any
 */
export const updateBooking = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return sendBadRequest(res, 'Invalid booking ID');
    }

    const existingBooking = await prisma.booking.findUnique({
      where: { id },
    });

    if (!existingBooking) {
      return sendNotFound(res, 'Booking not found');
    }

    if (existingBooking.apiKeyId !== req.apiKey!.id) {
      return sendNotFound(res, 'Booking not found');
    }

    const { role, cid: sessionCid } = req.orgSession!;

    // Members can only update their own bookings
    if (role === 'member' && existingBooking.cid !== sessionCid) {
      return sendForbidden(res, 'You can only update your own bookings');
    }

    const validationResult = updateBookingSchema.safeParse(req.body);

    if (!validationResult.success) {
      return sendValidationError(res, formatZodErrors(validationResult.error));
    }

    const data = validationResult.data;

    // Members cannot change the CID
    if (role === 'member' && data.cid && data.cid !== sessionCid) {
      return sendForbidden(res, 'You cannot change the booking CID');
    }

    if (data.start || data.end) {
      const start = data.start ? new Date(data.start) : existingBooking.start;
      const end = data.end ? new Date(data.end) : existingBooking.end;

      const timeError = validateBookingTimes(start, end);
      if (timeError) {
        return sendValidationError(res, { time: [timeError] });
      }

      const callsign = data.callsign || existingBooking.callsign;
      const hasOverlap = await checkBookingOverlap(callsign, start, end, id);
      if (hasOverlap) {
        return sendValidationError(res, {
          booking: ['This callsign already has a booking during this time period'],
        });
      }
    }

    const booking = await prisma.booking.update({
      where: { id },
      data: {
        ...(data.cid && { cid: data.cid }),
        ...(data.callsign && { callsign: data.callsign.toUpperCase() }),
        ...(data.type && { type: data.type }),
        ...(data.start && { start: new Date(data.start) }),
        ...(data.end && { end: new Date(data.end) }),
        ...(data.division && { division: data.division }),
        ...(data.subdivision !== undefined && { subdivision: data.subdivision }),
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
    });

    return sendSuccess(res, booking);
  } catch (error) {
    console.error('Error updating booking:', error);
    throw error;
  }
};

/**
 * Delete a booking
 * DELETE /org/session/bookings/:id
 * Member: only own bookings (by CID). Admin/manager: any
 */
export const deleteBooking = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return sendBadRequest(res, 'Invalid booking ID');
    }

    const existingBooking = await prisma.booking.findUnique({
      where: { id },
    });

    if (!existingBooking) {
      return sendNotFound(res, 'Booking not found');
    }

    if (existingBooking.apiKeyId !== req.apiKey!.id) {
      return sendNotFound(res, 'Booking not found');
    }

    const { role, cid: sessionCid } = req.orgSession!;

    // Members can only delete their own bookings
    if (role === 'member' && existingBooking.cid !== sessionCid) {
      return sendForbidden(res, 'You can only delete your own bookings');
    }

    await prisma.booking.delete({
      where: { id },
    });

    return sendNoContent(res);
  } catch (error) {
    console.error('Error deleting booking:', error);
    throw error;
  }
};
