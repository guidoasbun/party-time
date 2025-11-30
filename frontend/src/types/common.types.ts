/**
 * Common types used across the application
 */

// UUID type alias for better clarity
export type UUID = string;

// Pagination types
export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
  [key: string]: unknown;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  has_next: boolean;
  has_previous: boolean;
}

// API Response types
export interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
  success?: boolean;
}

export interface ApiError {
  detail: string | string[];
  status_code: number;
  error_code?: string;
}

// Loading and request states
export interface RequestState {
  loading: boolean;
  error: string | null;
  success: boolean;
}

// Common enum-like types that mirror backend
export type SortOrder = "asc" | "desc";

export interface SortParams {
  sort_by?: string;
  sort_order?: SortOrder;
  [key: string]: unknown;
}

// Query params for list endpoints
export interface ListQueryParams extends PaginationParams, SortParams {
  search?: string;
  filter?: Record<string, unknown>;
  [key: string]: unknown;
}

// Timestamp types
export interface Timestamps {
  created_at: string; // ISO datetime string
  updated_at: string; // ISO datetime string
}

// File upload types
export interface FileUpload {
  file: File;
  progress?: number;
  status?: "pending" | "uploading" | "complete" | "error";
}

export interface UploadedFile {
  id: string;
  filename: string;
  url: string;
  size: number;
  mime_type: string;
  uploaded_at: string;
}

// Form field validation
export interface ValidationError {
  field: string;
  message: string;
}

export interface FormState<T> {
  data: T;
  errors: ValidationError[];
  isValid: boolean;
  isDirty: boolean;
  isSubmitting: boolean;
}

// Generic utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

// API endpoint paths
export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    REGISTER: "/api/v1/auth/register",
    LOGIN: "/api/v1/auth/login",
    LOGOUT: "/api/v1/auth/logout",
    ME: "/api/v1/auth/me",
    VERIFY_EMAIL: "/api/v1/auth/verify-email",
    RESEND_VERIFICATION: "/api/v1/auth/resend-verification",
    PASSWORD_RESET: "/api/v1/auth/password-reset",
    PASSWORD_RESET_CONFIRM: "/api/v1/auth/password-reset-confirm",
    PROFILE: "/api/v1/auth/profile",
    PROTECTED: "/api/v1/auth/protected",
  },
  // Event endpoints
  EVENTS: {
    LIST: "/api/v1/events",
    CREATE: "/api/v1/events",
    GET: (id: string) => `/api/v1/events/${id}`,
    UPDATE: (id: string) => `/api/v1/events/${id}`,
    DELETE: (id: string) => `/api/v1/events/${id}`,
    SUMMARY: (id: string) => `/api/v1/events/${id}/summary`,
  },
  // Guest endpoints
  GUESTS: {
    LIST: (eventId: string) => `/api/v1/events/${eventId}/guests`,
    CREATE: (eventId: string) => `/api/v1/events/${eventId}/guests`,
    BULK_CREATE: (eventId: string) => `/api/v1/events/${eventId}/guests/bulk`,
    BULK_DELETE: (eventId: string) =>
      `/api/v1/events/${eventId}/guests/bulk-delete`,
    BULK_UPDATE: (eventId: string) =>
      `/api/v1/events/${eventId}/guests/bulk-update`,
    SEARCH: (eventId: string) => `/api/v1/events/${eventId}/guests/search`,
    GET: (eventId: string, guestId: string) =>
      `/api/v1/events/${eventId}/guests/${guestId}`,
    UPDATE: (eventId: string, guestId: string) =>
      `/api/v1/events/${eventId}/guests/${guestId}`,
    DELETE: (eventId: string, guestId: string) =>
      `/api/v1/events/${eventId}/guests/${guestId}`,
    RSVP_VALIDATE: (token: string) =>
      `/api/v1/events/guests/rsvp/${token}/validate`,
    RSVP_DETAILS: (token: string) =>
      `/api/v1/events/guests/rsvp/${token}/event-details`,
    RSVP_SUBMIT: (token: string) => `/api/v1/events/guests/rsvp/${token}`,
    IMPORT_PREVIEW: (eventId: string) =>
      `/api/v1/events/${eventId}/guests/import-preview`,
    IMPORT_EXECUTE: (eventId: string) =>
      `/api/v1/events/${eventId}/guests/import-execute`,
    STATS: (eventId: string) => `/api/v1/events/${eventId}/guests/stats`,
    DIETARY_RESTRICTIONS: (eventId: string) =>
      `/api/v1/events/${eventId}/guests/dietary-restrictions`,
    // FR-6: The system shall display an RSVP submission page.
    // 5.1.3: RSVP Management Dashboard
    RSVP_TIMELINE: (eventId: string) =>
      `/api/v1/events/${eventId}/guests/rsvp-timeline`,
  },
  // Budget endpoints
  BUDGET: {
    CATEGORIES: (eventId: string) =>
      `/api/v1/events/${eventId}/budget/categories`,
    CREATE_CATEGORY: (eventId: string) =>
      `/api/v1/events/${eventId}/budget/categories`,
    GET_CATEGORY: (eventId: string, categoryId: string) =>
      `/api/v1/events/${eventId}/budget/categories/${categoryId}`,
    UPDATE_CATEGORY: (eventId: string, categoryId: string) =>
      `/api/v1/events/${eventId}/budget/categories/${categoryId}`,
    DELETE_CATEGORY: (eventId: string, categoryId: string) =>
      `/api/v1/events/${eventId}/budget/categories/${categoryId}`,
    EXPENSES: (eventId: string) => `/api/v1/events/${eventId}/budget/expenses`,
    CREATE_EXPENSE: (eventId: string) =>
      `/api/v1/events/${eventId}/budget/expenses`,
    GET_EXPENSE: (eventId: string, expenseId: string) =>
      `/api/v1/events/${eventId}/budget/expenses/${expenseId}`,
    UPDATE_EXPENSE: (eventId: string, expenseId: string) =>
      `/api/v1/events/${eventId}/budget/expenses/${expenseId}`,
    DELETE_EXPENSE: (eventId: string, expenseId: string) =>
      `/api/v1/events/${eventId}/budget/expenses/${expenseId}`,
    SUMMARY: (eventId: string) => `/api/v1/events/${eventId}/budget/summary`,
  },
  // RSVP endpoints (public - no authentication required)
  // FR-6: The system shall display an RSVP submission page.
  RSVP: {
    VALIDATE: (token: string) => `/api/v1/rsvp/${token}/validate`,
    EVENT_DETAILS: (token: string) => `/api/v1/rsvp/${token}/event-details`,
    SUBMIT: (token: string) => `/api/v1/rsvp/${token}/respond`,
    UPDATE_PREFERENCES: (token: string) => `/api/v1/rsvp/${token}/preferences`,
    UPDATE_PLUS_ONE: (token: string) => `/api/v1/rsvp/${token}/plus-one`,
  },
  // Seating chart endpoints
  // FR-21: The system shall provide an interactive seating chart interface
  /*
   * FR-21: The system shall provide an interactive seating chart interface.
   * Phase 6 - 6.1.3 Fabric.JS Canvas Setup
   */

  SEATING: {
    CREATE: (eventId: string) => `/api/v1/events/${eventId}/seating`,
    GET_CHART: (eventId: string) => `/api/v1/events/${eventId}/seating`,
    UPDATE_CHART: (eventId: string, chartId: string) =>
      `/api/v1/events/${eventId}/seating/${chartId}`,
    DELETE_CHART: (eventId: string, chartId: string) =>
      `/api/v1/events/${eventId}/seating/${chartId}`,
    CREATE_TABLE: (eventId: string, chartId: string) =>
      `/api/v1/events/${eventId}/seating/${chartId}/tables`,
    BULK_CREATE_TABLES: (eventId: string, chartId: string) =>
      `/api/v1/events/${eventId}/seating/${chartId}/tables/bulk`,
    GET_TABLE: (eventId: string, chartId: string, tableId: string) =>
      `/api/v1/events/${eventId}/seating/${chartId}/tables/${tableId}`,
    UPDATE_TABLE: (eventId: string, chartId: string, tableId: string) =>
      `/api/v1/events/${eventId}/seating/${chartId}/tables/${tableId}`,
    DELETE_TABLE: (eventId: string, chartId: string, tableId: string) =>
      `/api/v1/events/${eventId}/seating/${chartId}/tables/${tableId}`,
    ASSIGN_SEAT: (eventId: string, chartId: string, tableId: string) =>
      `/api/v1/events/${eventId}/seating/${chartId}/tables/${tableId}/seats`,
    UPDATE_SEAT: (eventId: string, chartId: string, seatId: string) =>
      `/api/v1/events/${eventId}/seating/${chartId}/seats/${seatId}`,
    DELETE_SEAT: (eventId: string, chartId: string, seatId: string) =>
      `/api/v1/events/${eventId}/seating/${chartId}/seats/${seatId}`,
    AUTO_ASSIGN: (eventId: string, chartId: string) =>
      `/api/v1/events/${eventId}/seating/${chartId}/auto-assign`,
    STATISTICS: (eventId: string, chartId: string) =>
      `/api/v1/events/${eventId}/seating/${chartId}/statistics`,
  },
  // Venue endpoints (Phase 7.1.1: Google Places API Integration)
  // FR-8: The system shall provide a venue search interface.
  // Phase 7.1.1: Google Places API Integration
  VENUES: {
    SEARCH: "/api/v1/venues/search",
    GET_DETAILS: (placeId: string) => `/api/v1/venues/${placeId}`,
    GET_PHOTOS: (placeId: string) => `/api/v1/venues/${placeId}/photos`,
    // Event venues
    LIST: (eventId: string) => `/api/v1/venues/events/${eventId}/venues`,
    ADD: (eventId: string) => `/api/v1/venues/events/${eventId}/venues`,
    GET: (eventId: string, venueId: string) =>
      `/api/v1/venues/events/${eventId}/venues/${venueId}`,
    UPDATE: (eventId: string, venueId: string) =>
      `/api/v1/venues/events/${eventId}/venues/${venueId}`,
    DELETE: (eventId: string, venueId: string) =>
      `/api/v1/venues/events/${eventId}/venues/${venueId}`,
    REORDER: (eventId: string) =>
      `/api/v1/venues/events/${eventId}/venues/reorder`,
  },
} as const;

// Rate limit error type
// FR-6: The system shall display an RSVP submission page. 5.1.1
export interface RateLimitError extends ApiError {
  retry_after?: number;
  reset_at?: string;
}
