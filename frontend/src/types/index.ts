/**
 * Central export file for all types
 */

// Common types
export * from "./common.types";

// Authentication types
export * from "./auth.types";

// User types
export * from "./user.types";

// Event types
export * from "./event.types";

// Guest types
export * from "./guest.types";

// Budget types
export * from "./budget.types";

// Preferences types
export * from "./preferences.types";

// Actions types
export * from "./actions.types";

// Email types
export * from "./email.types";

// Seating chart types
// FR-21: The system shall provide an interactive seating chart interface.
// Phase 6 - 6.1.3 Fabric.JS Canvas Setup
export * from "./seating.types";

// Re-export commonly used type aliases for convenience
export type {
  UUID,
  ApiResponse,
  ApiError,
  PaginatedResponse,
  RequestState,
  Timestamps,
} from "./common.types";

// Re-export error classes from api-client
export type {
  ApiException,
  NetworkException,
  TimeoutException,
} from "../lib/api-client";

export type {
  UserRole,
  User,
  UserCreate,
  UserUpdate,
  UserSummary,
} from "./user.types";

export type {
  EventType,
  EventStatus,
  Event,
  EventCreate,
  EventUpdate,
  EventSummary,
  EventWithDetails,
} from "./event.types";

export { RsvpStatus } from "./guest.types";

export type {
  Guest,
  GuestCreate,
  GuestUpdate,
  GuestSummary,
  GuestBulkCreate,
  GuestImportResult,
  CSVImportPreview,
  CSVImportResult,
  DuplicateDetail,
  ImportErrorDetail,
} from "./guest.types";

export type {
  BudgetCategory,
  BudgetCategoryCreate,
  BudgetCategoryUpdate,
  Expense,
  ExpenseCreate,
  ExpenseUpdate,
  BudgetSummary,
} from "./budget.types";

export type {
  AuthSession,
  AuthState,
  UserLoginRequest,
  UserLoginResponse,
  UserRegisterRequest,
  UserRegisterResponse,
} from "./auth.types";
