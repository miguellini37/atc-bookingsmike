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

export default api;
