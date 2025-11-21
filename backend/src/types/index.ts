import { Request } from 'express';
import { ApiKey } from '@prisma/client';

/**
 * Extended Express Request with authenticated API key
 */
export interface AuthenticatedRequest extends Request {
  apiKey?: ApiKey;
}

/**
 * Standard API response format
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

/**
 * Booking filter options
 */
export interface BookingFilters {
  callsign?: string;
  division?: string;
  subdivision?: string;
  type?: string;
  startDate?: Date;
  endDate?: Date;
  order?: 'current' | 'past' | 'future';
}

/**
 * Environment variables type
 */
export interface EnvConfig {
  NODE_ENV: string;
  PORT: number;
  SECRET_KEY: string;
  DATABASE_URL: string;
  CORS_ORIGIN: string;
  LOG_LEVEL: string;
  SENTRY_DSN?: string;
}
