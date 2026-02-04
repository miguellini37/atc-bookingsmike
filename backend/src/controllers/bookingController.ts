import { Response } from 'express';
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
  createBookingSchema,
  updateBookingSchema,
  formatZodErrors,
  validateBookingTimes,
  bookingFiltersSchema,
} from '../utils/validation';
import { prisma, checkBookingOverlap } from '../utils/database';
import { Prisma } from '@prisma/client';

/**
 * Get all bookings with optional filtering
 * GET /api/bookings
 */
export const getBookings = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    // Validate query parameters
    const filterResult = bookingFiltersSchema.safeParse(req.query);

    if (!filterResult.success) {
      return sendValidationError(res, formatZodErrors(filterResult.error));
    }

    const filters = filterResult.data;
    const where: Prisma.BookingWhereInput = {};

    // Apply filters
    if (filters.callsign) {
      where.callsign = { contains: filters.callsign };
    }
    if (filters.division) {
      where.division = filters.division;
    }
    if (filters.subdivision) {
      where.subdivision = filters.subdivision;
    }
    if (filters.type) {
      where.type = filters.type;
    }

    // Time-based filtering
    const now = new Date();
    if (filters.order === 'current') {
      where.start = { lte: now };
      where.end = { gte: now };
    } else if (filters.order === 'past') {
      where.end = { lt: now };
    } else if (filters.order === 'future') {
      where.start = { gt: now };
    }

    // Date range filtering
    if (filters.startDate) {
      where.start = { ...(where.start as object), gte: new Date(filters.startDate) };
    }
    if (filters.endDate) {
      where.end = { ...(where.end as object), lte: new Date(filters.endDate) };
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
 * Get a single booking by ID
 * GET /api/bookings/:id
 */
export const getBookingById = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return sendBadRequest(res, 'Invalid booking ID');
    }

    const booking = await prisma.booking.findUnique({
      where: { id },
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

    if (!booking) {
      return sendNotFound(res, 'Booking not found');
    }

    return sendSuccess(res, booking);
  } catch (error) {
    console.error('Error fetching booking:', error);
    throw error;
  }
};

/**
 * Create a new booking
 * POST /api/bookings
 */
export const createBooking = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    // Validate request body
    const validationResult = createBookingSchema.safeParse(req.body);

    if (!validationResult.success) {
      return sendValidationError(res, formatZodErrors(validationResult.error));
    }

    const data = validationResult.data;
    const start = new Date(data.start);
    const end = new Date(data.end);

    // Validate booking times
    const timeError = validateBookingTimes(start, end);
    if (timeError) {
      return sendValidationError(res, { time: [timeError] });
    }

    // Check for overlapping bookings
    const hasOverlap = await checkBookingOverlap(data.callsign, start, end);
    if (hasOverlap) {
      return sendValidationError(res, {
        booking: ['This callsign already has a booking during this time period'],
      });
    }

    // Create booking
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
 * Update an existing booking
 * PUT /api/bookings/:id
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

    // Check if booking exists and belongs to the API key
    const existingBooking = await prisma.booking.findUnique({
      where: { id },
    });

    if (!existingBooking) {
      return sendNotFound(res, 'Booking not found');
    }

    if (existingBooking.apiKeyId !== req.apiKey!.id) {
      return sendBadRequest(res, 'You can only update your own bookings');
    }

    // Validate request body
    const validationResult = updateBookingSchema.safeParse(req.body);

    if (!validationResult.success) {
      return sendValidationError(res, formatZodErrors(validationResult.error));
    }

    const data = validationResult.data;

    // Validate booking times if provided
    if (data.start || data.end) {
      const start = data.start ? new Date(data.start) : existingBooking.start;
      const end = data.end ? new Date(data.end) : existingBooking.end;

      const timeError = validateBookingTimes(start, end);
      if (timeError) {
        return sendValidationError(res, { time: [timeError] });
      }

      // Check for overlapping bookings
      const callsign = data.callsign || existingBooking.callsign;
      const hasOverlap = await checkBookingOverlap(callsign, start, end, id);
      if (hasOverlap) {
        return sendValidationError(res, {
          booking: ['This callsign already has a booking during this time period'],
        });
      }
    }

    // Update booking
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
 * DELETE /api/bookings/:id
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

    // Check if booking exists and belongs to the API key
    const existingBooking = await prisma.booking.findUnique({
      where: { id },
    });

    if (!existingBooking) {
      return sendNotFound(res, 'Booking not found');
    }

    if (existingBooking.apiKeyId !== req.apiKey!.id) {
      return sendBadRequest(res, 'You can only delete your own bookings');
    }

    // Delete booking
    await prisma.booking.delete({
      where: { id },
    });

    return sendNoContent(res);
  } catch (error) {
    console.error('Error deleting booking:', error);
    throw error;
  }
};
