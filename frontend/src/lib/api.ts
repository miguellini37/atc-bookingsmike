import axios, { AxiosError } from 'axios';
import type {
  Booking,
  ApiKey,
  CreateBookingData,
  UpdateBookingData,
  CreateApiKeyData,
  UpdateApiKeyData,
  ApiResponse,
  BookingFilters,
} from '../types';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Handle API errors consistently
 */
export const handleApiError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiResponse>;
    return axiosError.response?.data?.message || 'An error occurred';
  }
  return 'An unexpected error occurred';
};

/**
 * Set Bearer token for authenticated requests
 */
export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

// Authentication
export const authApi = {
  authenticateSecretKey: async (secretKey: string) => {
    const response = await api.post<ApiResponse<{ authenticated: boolean }>>(
      '/auth/secret-key',
      { secretKey }
    );
    return response.data;
  },

  logout: async () => {
    const response = await api.post<ApiResponse<{ loggedOut: boolean }>>('/auth/logout');
    return response.data;
  },
};

// Bookings
export const bookingsApi = {
  getAll: async (filters?: BookingFilters) => {
    const response = await api.get<ApiResponse<Booking[]>>('/bookings', {
      params: filters,
    });
    return response.data.data || [];
  },

  getById: async (id: number) => {
    const response = await api.get<ApiResponse<Booking>>(`/bookings/${id}`);
    return response.data.data!;
  },

  create: async (data: CreateBookingData) => {
    const response = await api.post<ApiResponse<Booking>>('/bookings', data);
    return response.data.data!;
  },

  update: async (id: number, data: UpdateBookingData) => {
    const response = await api.put<ApiResponse<Booking>>(`/bookings/${id}`, data);
    return response.data.data!;
  },

  delete: async (id: number) => {
    await api.delete(`/bookings/${id}`);
  },
};

// API Keys
export const apiKeysApi = {
  getAll: async () => {
    const response = await api.get<ApiResponse<ApiKey[]>>('/keys');
    return response.data.data || [];
  },

  getById: async (id: number) => {
    const response = await api.get<ApiResponse<ApiKey>>(`/keys/${id}`);
    return response.data.data!;
  },

  create: async (data: CreateApiKeyData) => {
    const response = await api.post<ApiResponse<ApiKey>>('/keys', data);
    return response.data.data!;
  },

  update: async (id: number, data: UpdateApiKeyData) => {
    const response = await api.put<ApiResponse<ApiKey>>(`/keys/${id}`, data);
    return response.data.data!;
  },

  delete: async (id: number) => {
    await api.delete(`/keys/${id}`);
  },
};

// Organization Portal (for org managers using Bearer token)
export const orgApi = {
  getMyOrganization: async () => {
    const response = await api.get<ApiResponse<ApiKey>>('/org/me');
    return response.data.data!;
  },

  getMyBookings: async () => {
    const response = await api.get<ApiResponse<Booking[]>>('/org/bookings');
    return response.data.data || [];
  },
};

// VATSIM OAuth session-based auth
export interface OrgSession {
  cid: string;
  name: string;
  currentOrg: ApiKey | null;
  organizations: Array<{
    id: number;
    name: string;
    division: string;
    subdivision: string | null;
    role: string;
  }>;
}

export const vatsimAuthApi = {
  // Redirect happens via window.location, not API call
  getLoginUrl: () => '/api/oauth/vatsim',

  getSession: async () => {
    const response = await api.get<ApiResponse<OrgSession>>('/oauth/session');
    return response.data.data!;
  },

  switchOrganization: async (orgId: number) => {
    const response = await api.post<ApiResponse<{ switched: boolean }>>('/oauth/session/org', { orgId });
    return response.data;
  },

  logout: async () => {
    const response = await api.post<ApiResponse<{ loggedOut: boolean }>>('/oauth/logout');
    return response.data;
  },
};

// Session-based org portal (for VATSIM OAuth users)
export const orgSessionApi = {
  getMyOrganization: async () => {
    const response = await api.get<ApiResponse<ApiKey>>('/org/session/me');
    return response.data.data!;
  },

  getMyBookings: async () => {
    const response = await api.get<ApiResponse<Booking[]>>('/org/session/bookings');
    return response.data.data || [];
  },

  // Session-based member management
  getMembers: async () => {
    const response = await api.get<ApiResponse<OrgMember[]>>('/org/session/members');
    return response.data.data || [];
  },

  addMember: async (data: { cid: string; role?: string }) => {
    const response = await api.post<ApiResponse<OrgMember>>('/org/session/members', data);
    return response.data.data!;
  },

  updateMember: async (id: number, data: { role: string }) => {
    const response = await api.put<ApiResponse<OrgMember>>(`/org/session/members/${id}`, data);
    return response.data.data!;
  },

  removeMember: async (id: number) => {
    await api.delete(`/org/session/members/${id}`);
  },

  syncRoster: async () => {
    const response = await api.post<ApiResponse<{ added: number; existing: number; total: number }>>('/org/session/members/sync');
    return response.data;
  },

  // Session-based booking CRUD
  createBooking: async (data: CreateBookingData) => {
    const response = await api.post<ApiResponse<Booking>>('/org/session/bookings', data);
    return response.data.data!;
  },

  updateBooking: async (id: number, data: UpdateBookingData) => {
    const response = await api.put<ApiResponse<Booking>>(`/org/session/bookings/${id}`, data);
    return response.data.data!;
  },

  deleteBooking: async (id: number) => {
    await api.delete(`/org/session/bookings/${id}`);
  },
};

// Organization member management (admin only)
export interface OrgMember {
  id: number;
  cid: string;
  apiKeyId: number;
  role: string;
  createdAt: string;
  updatedAt: string;
  apiKey?: {
    id: number;
    name: string;
    division: string;
    subdivision: string | null;
  };
}

export const orgMembersApi = {
  getAll: async () => {
    const response = await api.get<ApiResponse<OrgMember[]>>('/org-members/all');
    return response.data.data || [];
  },

  getByOrg: async (orgId: number) => {
    const response = await api.get<ApiResponse<OrgMember[]>>('/org-members', {
      params: { orgId },
    });
    return response.data.data || [];
  },

  add: async (data: { cid: string; apiKeyId: number; role?: string }) => {
    const response = await api.post<ApiResponse<OrgMember>>('/org-members', data);
    return response.data.data!;
  },

  update: async (id: number, data: { role: string }) => {
    const response = await api.put<ApiResponse<OrgMember>>(`/org-members/${id}`, data);
    return response.data.data!;
  },

  remove: async (id: number) => {
    await api.delete(`/org-members/${id}`);
  },
};

export default api;
