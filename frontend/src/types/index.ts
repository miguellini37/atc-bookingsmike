export enum BookingType {
  BOOKING = 'booking',
  EVENT = 'event',
  EXAM = 'exam',
  TRAINING = 'training',
}

export interface ApiKey {
  id: number;
  name: string;
  key: string;
  division: string;
  subdivision: string | null;
  portalEnabled: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    bookings: number;
  };
}

export interface Booking {
  id: number;
  apiKeyId: number;
  cid: string;
  callsign: string;
  type: BookingType;
  start: string;
  end: string;
  division: string;
  subdivision: string | null;
  createdAt: string;
  updatedAt: string;
  apiKey?: {
    id: number;
    name: string;
    division: string;
    subdivision: string | null;
  };
}

export interface CreateBookingData {
  cid: string;
  callsign: string;
  type: BookingType;
  start: string;
  end: string;
  division: string;
  subdivision?: string;
}

export interface UpdateBookingData extends Partial<CreateBookingData> {}

export interface CreateApiKeyData {
  name: string;
  division: string;
  subdivision?: string;
  portalEnabled?: boolean;
}

export interface UpdateApiKeyData extends Partial<CreateApiKeyData> {}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface BookingFilters {
  callsign?: string;
  division?: string;
  subdivision?: string;
  type?: BookingType;
  startDate?: string;
  endDate?: string;
  order?: 'current' | 'past' | 'future';
}
