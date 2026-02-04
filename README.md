# VATSIM ATC Booking System - Modern Edition

A completely modernized booking management system for VATSIM Air Traffic Control positions, rebuilt from the ground up with modern technologies and best practices.

## Overview

This is a full-stack application that allows VATSIM controllers to book ATC positions and manage their bookings through a clean, modern interface. The system features:

- **Public booking calendar** with visual indicators for different booking types
- **RESTful API** for programmatic booking management
- **Admin panel** for API key management
- **Real-time validation** and overlap detection
- **Type-safe** codebase with TypeScript throughout

## Technology Stack

### Backend
- **TypeScript** - Type-safe JavaScript
- **Node.js 20+** - Runtime environment
- **Express** - Web framework
- **Prisma** - Modern ORM with type safety
- **MySQL** - Relational database
- **Zod** - Runtime validation
- **JWT-style Bearer tokens** - API authentication

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Lightning-fast build tool
- **React Router** - Client-side routing
- **TanStack Query** - Server state management
- **React Big Calendar** - Calendar visualization
- **Tailwind CSS** - Utility-first styling
- **React Hook Form** - Form management

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Nginx** - Frontend web server
- **ESLint** - Code linting
- **Prettier** - Code formatting

## Architecture

```
.
├── backend/              # TypeScript + Express API
│   ├── src/
│   │   ├── controllers/  # Request handlers
│   │   ├── middleware/   # Authentication & error handling
│   │   ├── routes/       # API route definitions
│   │   ├── types/        # TypeScript type definitions
│   │   └── utils/        # Utilities (validation, database, responses)
│   ├── prisma/           # Database schema & migrations
│   └── Dockerfile
│
├── frontend/             # React + TypeScript SPA
│   ├── src/
│   │   ├── components/   # Reusable React components
│   │   ├── pages/        # Page components
│   │   ├── lib/          # API client & utilities
│   │   └── types/        # TypeScript types
│   ├── nginx.conf        # Nginx configuration
│   └── Dockerfile
│
└── docker-compose.yml    # Full stack orchestration
```

## Features

### Booking Management
- ✅ Create, read, update, and delete bookings
- ✅ Four booking types: Standard, Event, Exam, Training
- ✅ Automatic overlap detection per callsign
- ✅ Callsign validation (must end with _DEL, _GND, _TWR, _APP, _DEP, _CTR, _FSS)
- ✅ Time-based filtering (current, past, future)
- ✅ Visual calendar with color-coded booking types

### API Key Management
- ✅ Secure admin panel with secret key authentication
- ✅ Create and manage API keys for different users/divisions
- ✅ Associate bookings with API keys
- ✅ Track booking counts per API key
- ✅ Cascade deletion of related bookings

### Security
- ✅ Bearer token authentication for API
- ✅ Cookie-based authentication for admin panel
- ✅ CORS configuration
- ✅ Helmet security headers
- ✅ Input validation and sanitization
- ✅ SQL injection protection via Prisma

## Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 20+ (for local development)

### Production Deployment with Docker

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd atc-bookingsmike
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your settings
   ```

3. **Start the stack**
   ```bash
   docker-compose up -d
   ```

4. **Access the application**
   - Frontend: http://localhost
   - Backend API: http://localhost:3000
   - Health check: http://localhost:3000/health

### Railway Deployment (Recommended)

Railway provides the easiest deployment experience with automatic builds and managed MySQL.

1. **Create Railway Account**
   - Sign up at [railway.app](https://railway.app)

2. **Create New Project**
   - Click "New Project" > "Deploy from GitHub repo"
   - Connect your GitHub account and select this repository

3. **Add MySQL Database**
   - In your project, click "New" > "Database" > "MySQL"
   - Railway automatically creates `DATABASE_URL` environment variable

4. **Configure Environment Variables**
   - Go to your service settings > Variables
   - Add the following:
     ```
     NODE_ENV=production
     SECRET_KEY=<generate-a-secure-random-string>
     ```

5. **Deploy**
   - Railway automatically detects the config and deploys
   - First deployment runs database migrations automatically

6. **Access Your App**
   - Click on your service to see the deployment URL
   - Your app will be at: `https://your-project.up.railway.app`

**Railway Features Used:**
- Automatic builds with Nixpacks
- Managed MySQL database
- Automatic HTTPS
- Health checks at `/health`
- Automatic restarts on failure

### Local Development

#### Backend Development

```bash
cd backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with database connection

# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Start development server
npm run dev
```

#### Frontend Development

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will be available at http://localhost:5173 and will proxy API requests to the backend.

## API Documentation

### Authentication

**Bearer Token (API):**
```http
Authorization: Bearer <api-key>
```

**Secret Key (Admin Panel):**
Set via cookie after authenticating at `/api/auth/secret-key`

### Endpoints

#### Bookings

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/bookings` | Optional | List all bookings (with filters) |
| GET | `/api/bookings/:id` | Required | Get single booking |
| POST | `/api/bookings` | Required | Create booking |
| PUT | `/api/bookings/:id` | Required | Update booking |
| DELETE | `/api/bookings/:id` | Required | Delete booking |

**Query Parameters for GET /api/bookings:**
- `callsign` - Filter by callsign (partial match)
- `division` - Filter by division
- `subdivision` - Filter by subdivision
- `type` - Filter by booking type (booking, event, exam, training)
- `order` - Time filter (current, past, future)
- `startDate` - Filter by start date (ISO 8601)
- `endDate` - Filter by end date (ISO 8601)

**Create/Update Booking Body:**
```json
{
  "cid": "1234567",
  "callsign": "KJFK_TWR",
  "type": "booking",
  "start": "2024-01-15T14:00:00Z",
  "end": "2024-01-15T16:00:00Z",
  "division": "USA",
  "subdivision": "ZNY"
}
```

#### API Keys (Admin)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/secret-key` | None | Authenticate with secret key |
| POST | `/api/auth/logout` | None | Clear authentication cookie |
| GET | `/api/keys` | Secret Key | List all API keys |
| GET | `/api/keys/:id` | Secret Key | Get single API key |
| POST | `/api/keys` | Secret Key | Create API key |
| PUT | `/api/keys/:id` | Secret Key | Update API key |
| DELETE | `/api/keys/:id` | Secret Key | Delete API key |

**Create/Update API Key Body:**
```json
{
  "cid": "1234567",
  "name": "John Doe",
  "division": "EUR",
  "subdivision": "GBR"
}
```

### Response Format

**Success Response:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional message"
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error description",
  "errors": {
    "field": ["Validation error message"]
  }
}
```

## Database Schema

### API Keys
```prisma
model ApiKey {
  id          Int       @id @default(autoincrement())
  cid         String
  name        String
  key         String    @unique
  division    String
  subdivision String?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  bookings    Booking[]
}
```

### Bookings
```prisma
model Booking {
  id          Int         @id @default(autoincrement())
  apiKeyId    Int
  cid         String
  callsign    String
  type        BookingType @default(booking)
  start       DateTime
  end         DateTime
  division    String
  subdivision String?
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  apiKey      ApiKey      @relation(...)
}
```

## Environment Variables

### Backend (.env)
```env
NODE_ENV=development
PORT=3000
DATABASE_URL=mysql://user:password@localhost:3306/atc_bookings
SECRET_KEY=your-admin-secret-key
CORS_ORIGIN=http://localhost:5173
LOG_LEVEL=info
```

### Docker Compose (.env)
```env
NODE_ENV=production
DB_ROOT_PASSWORD=rootpassword
DB_DATABASE=atc_bookings
DB_USER=atc_user
DB_PASSWORD=atc_password
DB_PORT=3306
BACKEND_PORT=3000
FRONTEND_PORT=80
SECRET_KEY=your-secret-key
CORS_ORIGIN=http://localhost
```

## Development

### Code Quality

```bash
# Backend
cd backend
npm run lint        # Check code style
npm run format      # Format code with Prettier

# Frontend
cd frontend
npm run lint        # Check code style
npm run format      # Format code with Prettier
```

### Database Management

```bash
cd backend

# Create a new migration
npm run db:migrate

# View database in browser
npm run db:studio

# Reset database (caution!)
npx prisma migrate reset
```

## Migration from Old Version

The original PHP/Laravel Lumen application has been completely rewritten. The database schema remains compatible, so existing data can be migrated:

1. Export data from existing MySQL database
2. Update environment variables to point to new database
3. Run Prisma migrations: `npm run db:migrate`
4. Import existing data

**Key differences:**
- New technology stack (TypeScript instead of PHP)
- Modern frontend with React
- Better type safety throughout
- Improved code organization and readability
- Modern development tooling

## License

MIT

## Credits

Built for the VATSIM network community. Modernized edition created with TypeScript, React, and Express
