/**
 * Migration script to import bookings from old VATSIM ATC Bookings system
 *
 * Usage: npx tsx scripts/migrate.ts
 */

import { PrismaClient, BookingType } from '@prisma/client';
import { randomBytes } from 'crypto';

const prisma = new PrismaClient();

const OLD_API_URL = 'https://atc-bookings.vatsim.net/api/booking';
const OLD_API_TOKEN = '15f74e722b26b4a67bf00c13fd28b971';
const PLACEHOLDER_CID = '0000000';

interface OldBooking {
  id: number;
  cid: number;
  type: 'booking' | 'event' | 'exam' | 'mentoring' | 'training';
  callsign: string;
  start: string; // "YYYY-MM-DD HH:MM:SS"
  end: string;
  division: string;
  subdivision: string | null;
}

// Map old booking types to new enum
function mapBookingType(oldType: string): BookingType {
  switch (oldType) {
    case 'event':
      return BookingType.event;
    case 'exam':
      return BookingType.exam;
    case 'mentoring':
    case 'training':
      return BookingType.training;
    default:
      return BookingType.booking;
  }
}

// Convert old datetime format to ISO 8601
function convertDateTime(dt: string): Date {
  // "2026-02-05 00:00:00" -> Date
  return new Date(dt.replace(' ', 'T') + 'Z');
}

// Generate API key
function generateApiKey(): string {
  return randomBytes(32).toString('hex');
}

async function fetchOldBookings(): Promise<OldBooking[]> {
  console.log('Fetching bookings from old system...');

  const response = await fetch(OLD_API_URL, {
    headers: {
      'Authorization': `Bearer ${OLD_API_TOKEN}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch old bookings: ${response.status}`);
  }

  const data = await response.json() as OldBooking[];
  console.log(`Fetched ${data.length} bookings`);
  return data;
}

async function main() {
  try {
    // Fetch all bookings from old system
    const oldBookings = await fetchOldBookings();

    // Group bookings by organization (division/subdivision)
    const orgMap = new Map<string, OldBooking[]>();

    for (const booking of oldBookings) {
      const orgKey = booking.subdivision
        ? `${booking.division}/${booking.subdivision}`
        : booking.division;

      if (!orgMap.has(orgKey)) {
        orgMap.set(orgKey, []);
      }
      orgMap.get(orgKey)!.push(booking);
    }

    console.log(`\nFound ${orgMap.size} unique organizations`);

    // Create organizations and import bookings
    let totalImported = 0;
    let totalSkipped = 0;

    for (const [orgKey, bookings] of orgMap) {
      const [division, subdivision] = orgKey.includes('/')
        ? orgKey.split('/')
        : [orgKey, null];

      console.log(`\nProcessing: ${orgKey} (${bookings.length} bookings)`);

      // Check if organization already exists
      let apiKey = await prisma.apiKey.findFirst({
        where: {
          division,
          subdivision: subdivision || undefined,
        },
      });

      if (!apiKey) {
        // Create new organization
        const name = subdivision ? `${division} - ${subdivision}` : division;
        const key = generateApiKey();

        apiKey = await prisma.apiKey.create({
          data: {
            name,
            key,
            division,
            subdivision,
          },
        });

        // Add placeholder manager
        await prisma.orgMember.create({
          data: {
            cid: PLACEHOLDER_CID,
            apiKeyId: apiKey.id,
            role: 'admin',
          },
        });

        console.log(`  Created organization: ${name} (key: ${key.substring(0, 8)}...)`);
      } else {
        console.log(`  Organization already exists: ${apiKey.name}`);
      }

      // Import bookings
      for (const oldBooking of bookings) {
        const start = convertDateTime(oldBooking.start);
        const end = convertDateTime(oldBooking.end);

        // Skip past bookings
        if (end < new Date()) {
          totalSkipped++;
          continue;
        }

        // Check for duplicate (same callsign, start time, end time)
        const existing = await prisma.booking.findFirst({
          where: {
            callsign: oldBooking.callsign,
            start,
            end,
          },
        });

        if (existing) {
          console.log(`  Skipping duplicate: ${oldBooking.callsign}`);
          totalSkipped++;
          continue;
        }

        // Create booking
        await prisma.booking.create({
          data: {
            cid: oldBooking.cid.toString(),
            callsign: oldBooking.callsign,
            type: mapBookingType(oldBooking.type),
            start,
            end,
            division: oldBooking.division,
            subdivision: oldBooking.subdivision,
            apiKeyId: apiKey.id,
          },
        });

        totalImported++;
      }

      console.log(`  Imported ${bookings.length - totalSkipped} bookings`);
    }

    console.log(`\n========================================`);
    console.log(`Migration complete!`);
    console.log(`  Organizations created: ${orgMap.size}`);
    console.log(`  Bookings imported: ${totalImported}`);
    console.log(`  Bookings skipped (past/duplicate): ${totalSkipped}`);
    console.log(`========================================\n`);

  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
