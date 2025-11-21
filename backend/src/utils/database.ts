import { PrismaClient } from '@prisma/client';

/**
 * Prisma Client singleton instance
 * Prevents multiple instances in development with hot reload
 */
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

/**
 * Gracefully disconnect from database
 */
export const disconnectDatabase = async (): Promise<void> => {
  await prisma.$disconnect();
};

/**
 * Check if booking overlaps with existing bookings
 */
export const checkBookingOverlap = async (
  callsign: string,
  start: Date,
  end: Date,
  excludeId?: number
): Promise<boolean> => {
  const overlappingBooking = await prisma.booking.findFirst({
    where: {
      callsign,
      id: excludeId ? { not: excludeId } : undefined,
      OR: [
        // New booking starts during existing booking
        {
          AND: [{ start: { lte: start } }, { end: { gt: start } }],
        },
        // New booking ends during existing booking
        {
          AND: [{ start: { lt: end } }, { end: { gte: end } }],
        },
        // New booking completely contains existing booking
        {
          AND: [{ start: { gte: start } }, { end: { lte: end } }],
        },
      ],
    },
  });

  return !!overlappingBooking;
};
