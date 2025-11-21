# Sample Data Guide

This guide explains the sample data included with the ATC Booking System and how to use it.

## Quick Start

### Option 1: Automated Setup (Recommended)

```bash
cd backend
./setup-dev.sh
```

This will:
1. Install dependencies
2. Generate Prisma client
3. Run database migrations
4. Seed the database with sample data

### Option 2: Manual Setup

```bash
cd backend

# Install dependencies
npm install

# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed database
npm run db:seed
```

## What Gets Created

### 👥 10 Sample Controllers

| Name | Division | Subdivision | CID |
|------|----------|-------------|-----|
| John Smith | USA | ZNY | 1234567 |
| Sarah Johnson | USA | ZLA | 2345678 |
| Mike Williams | EUR | GBR | 3456789 |
| Emma Davis | EUR | FRA | 4567890 |
| James Wilson | EUR | GER | 5678901 |
| Lisa Anderson | USA | ZDC | 6789012 |
| David Martinez | USA | ZOB | 7890123 |
| Jennifer Taylor | EUR | SCA | 8901234 |
| Robert Brown | USA | ZAU | 9012345 |
| Maria Garcia | EUR | ITA | 0123456 |

Each controller gets a unique API key automatically generated.

### 📅 Sample Bookings

#### 🟢 Active Now (4 bookings)
These bookings are happening RIGHT NOW when you load the page:

- **KJFK_TWR** - John Smith (USA/ZNY)
  - Started 1 hour ago, ends in 2 hours
  - Type: Standard Booking

- **EGLL_APP** - Mike Williams (EUR/GBR)
  - Started 30 minutes ago, ends in 3 hours
  - Type: Standard Booking

- **LFPG_CTR** - Emma Davis (EUR/FRA)
  - Started 2 hours ago, ends in 1 hour
  - Type: Event

- **EDDF_TWR** - James Wilson (EUR/GER)
  - Started 1.5 hours ago, ends in 1.5 hours
  - Type: Standard Booking

#### 🔵 Coming Up Next (10+ bookings)
These bookings will start soon:

**In the next hour:**
- KLAX_DEP - Sarah Johnson (in 30 minutes)
- EGKK_TWR - Mike Williams (in 1 hour)

**In the next 3 hours:**
- KJFK_DEP - John Smith (Training session)
- EHAM_APP - Robert Brown

**Later today:**
- LEMD_CTR - Maria Garcia (Event)
- LOWW_TWR - Jennifer Taylor
- KORD_GND - Robert Brown
- EGSS_APP - Mike Williams (Exam)

**Tomorrow and beyond:**
- EDDM_TWR, LPPT_APP, KATL_TWR, KBOS_APP, and more!

#### ⚫ Recently Completed (8 bookings)
Past bookings for reference:

- KJFK_GND - Ended 2 hours ago
- EGLL_TWR - Ended 3 hours ago
- LFPG_APP - Ended 4 hours ago
- KLAX_TWR - Ended 6 hours ago (Event)
- And 4 more...

### 📊 Booking Types Distribution

- **Standard Bookings:** 18 (majority)
- **Events:** 4 (highlighted in red)
- **Training:** 3 (highlighted in purple)
- **Exams:** 2 (highlighted in orange)

### 🌍 Geographic Distribution

**USA Division:**
- Major airports: KJFK, KLAX, KORD, KATL, KBOS, KMIA, KDEN, KSFO
- Subdivisions: ZNY, ZLA, ZDC, ZOB, ZAU

**EUR Division:**
- Major airports: EGLL, EGKK, EGSS, LFPG, EDDF, EDDM, EHAM, LEMD, LOWW, LPPT
- Subdivisions: GBR, FRA, GER, SCA, ITA

## Using Sample API Keys

After seeding, you'll see API keys printed in the console. Example:

```
🔑 Sample API Keys:
   John Smith: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6...
   Sarah Johnson: b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7...
   Mike Williams: c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8...
```

### Testing the API

Use these API keys to test the API endpoints:

```bash
# Get all bookings (no auth required)
curl http://localhost:3000/api/bookings

# Create a new booking (requires API key)
curl -X POST http://localhost:3000/api/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY_HERE" \
  -d '{
    "cid": "1234567",
    "callsign": "KJFK_GND",
    "type": "booking",
    "start": "2024-12-20T14:00:00Z",
    "end": "2024-12-20T18:00:00Z",
    "division": "USA",
    "subdivision": "ZNY"
  }'
```

## Viewing the Data

### Option 1: Frontend UI (Best for visualization)

1. Start the backend:
   ```bash
   cd backend
   npm run dev
   ```

2. Start the frontend:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. Visit http://localhost:5173

You'll see:
- **Active Now** section with 4 controllers currently online
- **Coming Up Next** with upcoming bookings
- **Recently Completed** showing past sessions

### Option 2: Prisma Studio (Database GUI)

```bash
cd backend
npm run db:studio
```

Opens a web-based GUI at http://localhost:5555 where you can:
- View all tables
- Edit data directly
- Add/delete records
- Run queries

### Option 3: API Endpoints

```bash
# Get all bookings
curl http://localhost:3000/api/bookings

# Get active bookings only
curl http://localhost:3000/api/bookings?order=current

# Get upcoming bookings
curl http://localhost:3000/api/bookings?order=future

# Get past bookings
curl http://localhost:3000/api/bookings?order=past
```

## Resetting Sample Data

To clear and recreate sample data:

```bash
cd backend
npm run db:seed
```

This will:
1. Delete all existing bookings
2. Delete all existing API keys
3. Create fresh sample data

## Customizing Sample Data

Edit `backend/prisma/seed.ts` to customize:

### Add More Controllers

```typescript
const controllers = [
  { cid: '1234567', name: 'Your Name', division: 'EUR', subdivision: 'GBR' },
  // Add more controllers here
];
```

### Add More Bookings

```typescript
const bookingTemplates = [
  {
    callsign: 'EGLL_TWR',
    type: BookingType.booking,
    start: addHours(1),
    end: addHours(4),
    controllerIndex: 0
  },
  // Add more bookings here
];
```

### Change Timing

```typescript
// Create a booking that starts in 2 hours
start: addHours(2)

// Create a booking that started 1 hour ago
start: subtractHours(1)

// Make it last 3 hours
end: addHours(5)  // If start is addHours(2)
```

## Sample Callsigns Reference

### Tower (TWR)
- KJFK_TWR, KLAX_TWR, EGLL_TWR, LFPG_TWR, EDDF_TWR, etc.

### Approach/Departure (APP/DEP)
- KJFK_APP, KJFK_DEP, EGLL_APP, LFPG_APP, EHAM_APP, etc.

### Ground (GND)
- KJFK_GND, KORD_GND

### Center (CTR)
- LFPG_CTR, KDEN_CTR, EDDF_CTR

### Delivery (DEL)
- Any airport can have _DEL

## Booking Type Examples

### Standard Booking
Regular ATC session
```json
{ "type": "booking" }
```

### Event
Special event coverage
```json
{ "type": "event" }
```

### Training
Training session
```json
{ "type": "training" }
```

### Exam
Rating exam
```json
{ "type": "exam" }
```

## Timeline Visualization

```
-6h    -4h    -2h    NOW    +2h    +4h    +6h    +8h    +10h

        ⚫⚫⚫⚫⚫⚫⚫⚫    🟢🟢🟢🟢    🔵🔵🔵🔵🔵🔵🔵🔵🔵🔵🔵
        Completed     Active     Upcoming
```

## Tips

### See Active Bookings Immediately
The seed script creates 4 active bookings that are happening RIGHT NOW, so you'll see the "Active Now" section populated immediately.

### Test the Countdown Timers
Active bookings have different end times (1-3 hours from now), so you can see the live countdown timers in action.

### Explore Different Views
- Filter by division: USA vs EUR
- Filter by type: booking, event, exam, training
- Sort by time: current, past, future

### Admin Panel Access
To access the admin panel:
1. Go to http://localhost:5173/login
2. Enter your `SECRET_KEY` from `.env` file
3. Create/manage API keys

## Troubleshooting

### "Table does not exist" Error
Run migrations first:
```bash
npm run db:migrate
```

### "Connection refused" Error
Make sure your database is running and DATABASE_URL in `.env` is correct.

### Want to Start Fresh?
```bash
# Reset database completely
npx prisma migrate reset

# This will:
# 1. Drop all tables
# 2. Recreate tables
# 3. Run seed automatically
```

### Seed Script Won't Run
Make sure tsx is installed:
```bash
npm install tsx --save-dev
```

## Next Steps

1. ✅ Seed the database
2. ✅ Start backend and frontend
3. ✅ View the beautiful UI with sample data
4. ✅ Test creating new bookings via API
5. ✅ Explore Prisma Studio
6. ✅ Customize sample data to your needs
7. ✅ Deploy to production when ready!

---

**Enjoy your fully populated ATC booking system!** 🎉
