# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ATC Booking System - a full-stack TypeScript application for managing Air Traffic Control position bookings. Modernized from PHP/Lumen to TypeScript/React/Express.

## Tech Stack

- **Backend**: TypeScript, Express.js, Prisma ORM, MySQL 8.0, Zod validation
- **Frontend**: React 18, Vite, TanStack Query, React Router v6, Tailwind CSS, React Big Calendar
- **DevOps**: Docker, Docker Compose, Nginx, GitHub Actions

## Common Commands

### Backend (from `backend/`)
```bash
npm run dev              # Dev server with hot reload
npm run build            # Compile TypeScript
npm run db:migrate       # Run Prisma migrations
npm run db:generate      # Generate Prisma client
npm run db:studio        # Visual DB explorer
npm test                 # Run Vitest tests
npm run lint             # ESLint
npm run format           # Prettier
```

### Frontend (from `frontend/`)
```bash
npm run dev              # Vite dev server (port 5173)
npm run build            # TypeScript check + production build
npm run lint             # ESLint (warnings as errors)
npm run format           # Prettier
```

### Docker (from root)
```bash
docker-compose up -d     # Start all services
docker-compose down      # Stop all services
docker-compose exec backend npx prisma migrate deploy  # Run migrations in container
```

## Architecture

### Backend Structure (`backend/src/`)
- **controllers/**: Request handlers (booking.controller.ts, apiKey.controller.ts)
- **middleware/**: Authentication (Bearer token for API, secret key cookie for admin)
- **routes/**: API endpoint definitions
- **utils/**: database.ts (Prisma client), responses.ts (standardized responses), validation.ts (Zod schemas)

### Frontend Structure (`frontend/src/`)
- **pages/**: HomePage (public calendar), AdminPage (API key management), LoginPage
- **components/**: Layout, ApiKeyForm, ApiKeyList
- **lib/api.ts**: Axios client with Bearer token interceptor

### Database Models (Prisma)
- **ApiKey**: id, name, key, createdAt → has many Bookings (cascade delete)
- **Booking**: id, callsign, startTime, endTime, type (enum: booking/event/exam/training), apiKeyId

### Authentication
- **API routes**: Bearer token in Authorization header, validated against ApiKey table
- **Admin panel**: Secret key stored as HTTP-only cookie
- **GET /bookings**: Public read access, authenticated write

### API Response Format
```json
{
  "success": true/false,
  "data": {},
  "message": "optional",
  "errors": {"field": ["messages"]}
}
```

## Business Rules

- Callsigns must end with: _DEL, _GND, _TWR, _APP, _DEP, _CTR, or _FSS
- Bookings cannot overlap for the same callsign
- Booking types have color coding: Standard (blue), Event (red), Exam (orange), Training (purple)

## Environment Variables

Key variables in `.env`:
- `DATABASE_URL`: MySQL connection string for Prisma
- `SECRET_KEY`: Admin panel authentication
- `CORS_ORIGIN`: Allowed frontend origin
- `PORT`: Backend port (default 3000)

## API Endpoints

- `GET /health` - Health check
- `GET /bookings` - List bookings (optional auth, supports filtering)
- `POST /bookings` - Create booking (requires auth)
- `DELETE /bookings/:id` - Delete booking (requires auth)
- `POST /api-keys` - Create API key (admin only)
- `GET /api-keys` - List API keys (admin only)
- `DELETE /api-keys/:id` - Delete API key (admin only)
- `POST /auth/login` - Admin login
- `POST /auth/logout` - Admin logout
- `GET /auth/check` - Check admin auth status
