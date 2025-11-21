import { PrismaClient, BookingType } from '@prisma/client';
import { randomBytes } from 'crypto';

const prisma = new PrismaClient();

// Helper to generate random API key
const generateApiKey = (): string => {
  return randomBytes(32).toString('hex');
};

// Helper to get date/time
const now = new Date();
const addHours = (hours: number) => new Date(now.getTime() + hours * 60 * 60 * 1000);
const subtractHours = (hours: number) => new Date(now.getTime() - hours * 60 * 60 * 1000);

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

// Sample bookings data with various callsigns
const bookingTemplates = [
  // Active bookings (happening now)
  { callsign: 'KJFK_TWR', type: BookingType.booking, start: subtractHours(1), end: addHours(2), controllerIndex: 0 },
  { callsign: 'EGLL_APP', type: BookingType.booking, start: subtractHours(0.5), end: addHours(3), controllerIndex: 2 },
  { callsign: 'LFPG_CTR', type: BookingType.event, start: subtractHours(2), end: addHours(1), controllerIndex: 3 },
  { callsign: 'EDDF_TWR', type: BookingType.booking, start: subtractHours(1.5), end: addHours(1.5), controllerIndex: 4 },

  // Upcoming bookings (starting soon)
  { callsign: 'KLAX_DEP', type: BookingType.booking, start: addHours(0.5), end: addHours(3.5), controllerIndex: 1 },
  { callsign: 'EGKK_TWR', type: BookingType.booking, start: addHours(1), end: addHours(4), controllerIndex: 2 },
  { callsign: 'KJFK_DEP', type: BookingType.training, start: addHours(2), end: addHours(5), controllerIndex: 0 },
  { callsign: 'EHAM_APP', type: BookingType.booking, start: addHours(3), end: addHours(6), controllerIndex: 8 },
  { callsign: 'LEMD_CTR', type: BookingType.event, start: addHours(4), end: addHours(8), controllerIndex: 9 },
  { callsign: 'LOWW_TWR', type: BookingType.booking, start: addHours(5), end: addHours(7), controllerIndex: 7 },
  { callsign: 'KORD_GND', type: BookingType.booking, start: addHours(6), end: addHours(9), controllerIndex: 8 },
  { callsign: 'EGSS_APP', type: BookingType.exam, start: addHours(8), end: addHours(10), controllerIndex: 2 },
  { callsign: 'EDDM_TWR', type: BookingType.booking, start: addHours(10), end: addHours(13), controllerIndex: 4 },
  { callsign: 'LPPT_APP', type: BookingType.booking, start: addHours(12), end: addHours(15), controllerIndex: 9 },

  // More future bookings
  { callsign: 'KATL_TWR', type: BookingType.booking, start: addHours(24), end: addHours(27), controllerIndex: 5 },
  { callsign: 'KBOS_APP', type: BookingType.event, start: addHours(26), end: addHours(30), controllerIndex: 6 },
  { callsign: 'KMIA_DEP', type: BookingType.booking, start: addHours(30), end: addHours(33), controllerIndex: 1 },
  { callsign: 'KDEN_CTR', type: BookingType.booking, start: addHours(36), end: addHours(40), controllerIndex: 8 },
  { callsign: 'KSFO_TWR', type: BookingType.training, start: addHours(48), end: addHours(51), controllerIndex: 1 },

  // Recently completed bookings
  { callsign: 'KJFK_GND', type: BookingType.booking, start: subtractHours(5), end: subtractHours(2), controllerIndex: 5 },
  { callsign: 'EGLL_TWR', type: BookingType.booking, start: subtractHours(6), end: subtractHours(3), controllerIndex: 2 },
  { callsign: 'LFPG_APP', type: BookingType.booking, start: subtractHours(8), end: subtractHours(4), controllerIndex: 3 },
  { callsign: 'KLAX_TWR', type: BookingType.event, start: subtractHours(10), end: subtractHours(6), controllerIndex: 1 },
  { callsign: 'EHAM_TWR', type: BookingType.booking, start: subtractHours(12), end: subtractHours(8), controllerIndex: 8 },
  { callsign: 'EDDF_APP', type: BookingType.exam, start: subtractHours(14), end: subtractHours(10), controllerIndex: 4 },
  { callsign: 'KJFK_APP', type: BookingType.booking, start: subtractHours(18), end: subtractHours(14), controllerIndex: 0 },
  { callsign: 'EGKK_APP', type: BookingType.training, start: subtractHours(24), end: subtractHours(20), controllerIndex: 2 },
];

async function seed() {
  console.log('🌱 Starting database seeding...');

  // Clear existing data
  console.log('🗑️  Clearing existing data...');
  await prisma.booking.deleteMany();
  await prisma.apiKey.deleteMany();

  // Create API keys for controllers
  console.log('👥 Creating API keys for controllers...');
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
    console.log(`   ✓ Created API key for ${controller.name}`);
  }

  // Create bookings
  console.log('📅 Creating sample bookings...');
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

    // Count booking types
    if (template.start < now && template.end > now) {
      activeCount++;
      console.log(`   ✓ Created ACTIVE booking: ${template.callsign} (${controller.name})`);
    } else if (template.start > now) {
      upcomingCount++;
      console.log(`   ✓ Created UPCOMING booking: ${template.callsign} (${controller.name})`);
    } else {
      completedCount++;
      console.log(`   ✓ Created COMPLETED booking: ${template.callsign} (${controller.name})`);
    }
  }

  console.log('');
  console.log('✨ Seeding complete!');
  console.log('');
  console.log('📊 Summary:');
  console.log(`   Controllers created: ${apiKeys.length}`);
  console.log(`   Total bookings: ${bookingTemplates.length}`);
  console.log(`   🟢 Active now: ${activeCount}`);
  console.log(`   🔵 Upcoming: ${upcomingCount}`);
  console.log(`   ⚫ Completed: ${completedCount}`);
  console.log('');
  console.log('🔑 Sample API Keys:');
  apiKeys.slice(0, 3).forEach((key, index) => {
    console.log(`   ${controllers[index].name}: ${key.key}`);
  });
  console.log('');
  console.log('🌐 Your booking system is now populated with sample data!');
  console.log('   Visit the frontend to see the bookings in action.');
}

seed()
  .catch((error) => {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
