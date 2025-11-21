import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import { sendSuccess, sendUnauthorized } from '../utils/responses';
import { prisma } from '../utils/database';
import { randomBytes } from 'crypto';
import { BookingType } from '@prisma/client';

/**
 * Generate a random API key
 */
const generateApiKey = (): string => {
  return randomBytes(32).toString('hex');
};

/**
 * Seed database with sample data
 * POST /api/admin/seed
 * Requires secret key authentication
 */
export const seedDatabase = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    // Verify secret key
    const secretKey = req.cookies?.secret_key || req.headers['x-secret-key'];
    if (!secretKey || secretKey !== process.env.SECRET_KEY) {
      return sendUnauthorized(res, 'Invalid secret key');
    }

    console.log('🌱 Starting database seeding via API...');

    // Clear existing data
    await prisma.booking.deleteMany();
    await prisma.apiKey.deleteMany();

    // Sample controller data
    const controllers = [
      { cid: '1234567', name: 'John Smith', division: 'USA', subdivision: 'ZNY' },
      { cid: '2345678', name: 'Sarah Johnson', division: 'USA', subdivision: 'ZLA' },
      { cid: '3456789', name: 'Mike Williams', division: 'EUR', subdivision: 'GBR' },
      { cid: '4567890', name: 'Emma Davis', division: 'EUR', subdivision: 'FRA' },
      { cid: '5678901', name: 'James Wilson', division: 'EUR', subdivision: 'GER' },
      { cid: '6789012', name: 'Lisa Anderson', division: 'USA', subdivision: 'ZDC' },
      { cid: '7890123', name: 'David Martinez', division: 'USA', subdivision: 'ZOB' },
      { cid: '8901234', name: 'Jennifer Taylor', division: 'EUR', subdivision: 'SCA' },
      { cid: '9012345', name: 'Robert Brown', division: 'USA', subdivision: 'ZAU' },
      { cid: '0123456', name: 'Maria Garcia', division: 'EUR', subdivision: 'ITA' },
    ];

    // Create API keys
    const apiKeys = [];
    for (const controller of controllers) {
      const apiKey = await prisma.apiKey.create({
        data: {
          cid: controller.cid,
          name: controller.name,
          key: generateApiKey(),
          division: controller.division,
          subdivision: controller.subdivision || '',
        },
      });
      apiKeys.push(apiKey);
    }

    // Helper functions for time
    const now = new Date();
    const addHours = (hours: number) => new Date(now.getTime() + hours * 60 * 60 * 1000);
    const subtractHours = (hours: number) =>
      new Date(now.getTime() - hours * 60 * 60 * 1000);

    // Sample bookings
    const bookingTemplates = [
      // Active bookings (happening now)
      {
        callsign: 'KJFK_TWR',
        type: BookingType.booking,
        start: subtractHours(1),
        end: addHours(2),
        controllerIndex: 0,
      },
      {
        callsign: 'EGLL_APP',
        type: BookingType.booking,
        start: subtractHours(0.5),
        end: addHours(3),
        controllerIndex: 2,
      },
      {
        callsign: 'LFPG_CTR',
        type: BookingType.event,
        start: subtractHours(2),
        end: addHours(1),
        controllerIndex: 3,
      },
      {
        callsign: 'EDDF_TWR',
        type: BookingType.booking,
        start: subtractHours(1.5),
        end: addHours(1.5),
        controllerIndex: 4,
      },

      // Upcoming bookings
      {
        callsign: 'KLAX_DEP',
        type: BookingType.booking,
        start: addHours(0.5),
        end: addHours(3.5),
        controllerIndex: 1,
      },
      {
        callsign: 'EGKK_TWR',
        type: BookingType.booking,
        start: addHours(1),
        end: addHours(4),
        controllerIndex: 2,
      },
      {
        callsign: 'KJFK_DEP',
        type: BookingType.training,
        start: addHours(2),
        end: addHours(5),
        controllerIndex: 0,
      },
      {
        callsign: 'EHAM_APP',
        type: BookingType.booking,
        start: addHours(3),
        end: addHours(6),
        controllerIndex: 8,
      },
      {
        callsign: 'LEMD_CTR',
        type: BookingType.event,
        start: addHours(4),
        end: addHours(8),
        controllerIndex: 9,
      },
      {
        callsign: 'LOWW_TWR',
        type: BookingType.booking,
        start: addHours(5),
        end: addHours(7),
        controllerIndex: 7,
      },
      {
        callsign: 'KORD_GND',
        type: BookingType.booking,
        start: addHours(6),
        end: addHours(9),
        controllerIndex: 8,
      },
      {
        callsign: 'EGSS_APP',
        type: BookingType.exam,
        start: addHours(8),
        end: addHours(10),
        controllerIndex: 2,
      },

      // Recently completed
      {
        callsign: 'KJFK_GND',
        type: BookingType.booking,
        start: subtractHours(5),
        end: subtractHours(2),
        controllerIndex: 5,
      },
      {
        callsign: 'EGLL_TWR',
        type: BookingType.booking,
        start: subtractHours(6),
        end: subtractHours(3),
        controllerIndex: 2,
      },
      {
        callsign: 'LFPG_APP',
        type: BookingType.booking,
        start: subtractHours(8),
        end: subtractHours(4),
        controllerIndex: 3,
      },
      {
        callsign: 'KLAX_TWR',
        type: BookingType.event,
        start: subtractHours(10),
        end: subtractHours(6),
        controllerIndex: 1,
      },
    ];

    // Create bookings
    let activeCount = 0;
    let upcomingCount = 0;
    let completedCount = 0;

    for (const template of bookingTemplates) {
      const controller = controllers[template.controllerIndex];
      const apiKey = apiKeys[template.controllerIndex];

      await prisma.booking.create({
        data: {
          apiKeyId: apiKey.id,
          cid: controller.cid,
          callsign: template.callsign,
          type: template.type,
          start: template.start,
          end: template.end,
          division: controller.division,
          subdivision: controller.subdivision || '',
        },
      });

      if (template.start < now && template.end > now) {
        activeCount++;
      } else if (template.start > now) {
        upcomingCount++;
      } else {
        completedCount++;
      }
    }

    console.log('✅ Database seeded successfully!');

    return sendSuccess(res, {
      message: 'Database seeded successfully',
      summary: {
        controllers: apiKeys.length,
        totalBookings: bookingTemplates.length,
        activeBookings: activeCount,
        upcomingBookings: upcomingCount,
        completedBookings: completedCount,
      },
      sampleApiKeys: apiKeys.slice(0, 3).map((key, idx) => ({
        name: controllers[idx].name,
        key: key.key,
      })),
    });
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
};
