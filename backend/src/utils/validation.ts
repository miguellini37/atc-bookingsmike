import { z } from 'zod';
import { BookingType } from '@prisma/client';

/**
 * Validates ATC callsign format
 * Must end with: _DEL, _GND, _TWR, _APP, _DEP, _CTR, _FSS
 */
const callsignSuffixes = ['_DEL', '_GND', '_TWR', '_APP', '_DEP', '_CTR', '_FSS'];

export const isValidCallsign = (callsign: string): boolean => {
  return callsignSuffixes.some((suffix) => callsign.toUpperCase().endsWith(suffix));
};

/**
 * Booking validation schema
 */
export const createBookingSchema = z.object({
  cid: z.string().min(1, 'CID is required').regex(/^\d{1,10}$/, 'CID must be a valid numeric VATSIM CID'),
  callsign: z
    .string()
    .min(1, 'Callsign is required')
    .refine(isValidCallsign, {
      message: 'Callsign must end with: _DEL, _GND, _TWR, _APP, _DEP, _CTR, or _FSS',
    }),
  type: z.nativeEnum(BookingType).default(BookingType.booking),
  start: z.string().datetime('Invalid start date format'),
  end: z.string().datetime('Invalid end date format'),
  division: z.string().min(1, 'Division is required'),
  subdivision: z.string().optional(),
});

export const updateBookingSchema = createBookingSchema.partial();

/**
 * API key validation schema
 * API keys are issued to FIRs/vARTCCs/divisions, not individual controllers
 */
export const createApiKeySchema = z.object({
  name: z.string().min(1, 'Organization name is required'),
  division: z.string().min(1, 'Division is required'),
  subdivision: z.string().optional(),
  portalEnabled: z.boolean().optional(),
});

export const updateApiKeySchema = createApiKeySchema.partial();

/**
 * Authentication schema
 */
export const authSchema = z.object({
  secretKey: z.string().min(1, 'Secret key is required'),
});

/**
 * Booking query filters schema
 */
export const bookingFiltersSchema = z.object({
  callsign: z.string().optional(),
  division: z.string().optional(),
  subdivision: z.string().optional(),
  type: z.nativeEnum(BookingType).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  order: z.enum(['current', 'past', 'future']).optional(),
});

/**
 * Validate booking time overlap
 */
export const validateBookingTimes = (start: Date, end: Date): string | null => {
  if (start >= end) {
    return 'End time must be after start time';
  }

  const now = new Date();
  if (end < now) {
    return 'Booking end time cannot be in the past';
  }

  return null;
};

/**
 * Convert Zod errors to validation error format
 */
export const formatZodErrors = (error: z.ZodError): Record<string, string[]> => {
  const formatted: Record<string, string[]> = {};

  error.errors.forEach((err) => {
    const field = err.path.join('.');
    if (!formatted[field]) {
      formatted[field] = [];
    }
    formatted[field].push(err.message);
  });

  return formatted;
};
