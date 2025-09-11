/**
 * User model types
 */

import { UUID, Timestamps } from './common.types'

// User role enum matching backend
export enum UserRole {
  ADMIN = 'admin',
  PLANNER = 'planner', 
  GUEST = 'guest'
}

// Base user types
export interface UserBase {
  email: string
  first_name: string
  last_name: string
  phone?: string
  timezone: string
}

export interface UserCreate extends UserBase {
  role?: UserRole
}

export interface UserUpdate {
  first_name?: string
  last_name?: string
  phone?: string
  timezone?: string
  is_active?: boolean
}

// Full user model
export interface User extends UserBase, Timestamps {
  id: UUID
  role: UserRole
  is_active: boolean
  is_verified: boolean
  last_login?: string
}

// User profile types for display
export interface UserProfile extends User {
  full_name: string // computed field
  initials: string // computed field
  avatar_url?: string
}

// User preferences
export interface UserPreferences {
  theme: 'light' | 'dark' | 'system'
  language: string
  timezone: string
  email_notifications: {
    event_reminders: boolean
    rsvp_updates: boolean
    budget_alerts: boolean
    guest_updates: boolean
    vendor_updates: boolean
  }
  push_notifications: {
    enabled: boolean
    event_reminders: boolean
    deadline_alerts: boolean
  }
}

// User settings
export interface UserSettings extends UserPreferences {
  privacy: {
    profile_visibility: 'public' | 'private' | 'friends'
    show_email: boolean
    show_phone: boolean
  }
  security: {
    two_factor_enabled: boolean
    login_alerts: boolean
    session_timeout: number // minutes
  }
}

// User activity and stats
export interface UserActivity {
  id: UUID
  user_id: UUID
  action_type: string
  resource_type: string
  resource_id?: UUID
  description: string
  metadata?: Record<string, unknown>
  created_at: string
}

export interface UserStats {
  total_events: number
  active_events: number
  completed_events: number
  total_guests: number
  confirmed_guests: number
  total_budget: number
  total_expenses: number
  events_this_month: number
  events_this_year: number
}

// User session info
export interface UserSession {
  id: string
  user_id: UUID
  device_info: {
    browser: string
    os: string
    device_type: 'desktop' | 'mobile' | 'tablet'
    ip_address: string
    location?: string
  }
  created_at: string
  last_active: string
  is_current: boolean
}

// User contact and social info
export interface UserContact {
  email: string
  phone?: string
  address?: {
    street: string
    city: string
    state: string
    zip_code: string
    country: string
  }
  social_links?: {
    website?: string
    facebook?: string
    instagram?: string
    twitter?: string
    linkedin?: string
  }
}

// User invitation types
export interface UserInvitation {
  id: UUID
  email: string
  role: UserRole
  invited_by_user_id: UUID
  invited_by_name: string
  expires_at: string
  accepted_at?: string
  created_at: string
  status: 'pending' | 'accepted' | 'expired' | 'revoked'
}

// Form types for user management
export interface UserCreateFormData {
  email: string
  first_name: string
  last_name: string
  phone?: string
  role: UserRole
  send_invitation: boolean
}

export interface UserEditFormData {
  first_name: string
  last_name: string
  phone?: string
  timezone: string
  is_active: boolean
}

export interface UserPreferencesFormData extends UserPreferences {
  // Additional form-specific fields can be added here in the future
}

// User search and filtering
export interface UserSearchParams {
  query?: string
  role?: UserRole
  is_active?: boolean
  is_verified?: boolean
  created_after?: string
  created_before?: string
  last_login_after?: string
  last_login_before?: string
}

export interface UserListFilters {
  role: UserRole[]
  status: ('active' | 'inactive' | 'verified' | 'unverified')[]
  date_range: {
    start?: string
    end?: string
  }
}

// User summary for lists and cards
export interface UserSummary {
  id: UUID
  email: string
  first_name: string
  last_name: string
  full_name: string
  role: UserRole
  is_active: boolean
  is_verified: boolean
  avatar_url?: string
  last_login?: string
}

// Admin user management types
export interface AdminUserUpdate extends UserUpdate {
  role?: UserRole
  is_verified?: boolean
}

export interface UserPermissions {
  can_create_events: boolean
  can_edit_events: boolean
  can_delete_events: boolean
  can_manage_guests: boolean
  can_manage_budget: boolean
  can_manage_vendors: boolean
  can_view_analytics: boolean
  can_export_data: boolean
  can_manage_users: boolean
  can_manage_settings: boolean
}

// User context types
export interface UserContextType {
  currentUser: User | null
  preferences: UserPreferences
  settings: UserSettings
  stats: UserStats | null
  loading: boolean
  error: string | null
  
  // Actions
  updateProfile: (data: UserUpdate) => Promise<void>
  updatePreferences: (preferences: Partial<UserPreferences>) => Promise<void>
  updateSettings: (settings: Partial<UserSettings>) => Promise<void>
  refreshUserData: () => Promise<void>
  clearError: () => void
}