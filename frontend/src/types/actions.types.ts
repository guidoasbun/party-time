/**
 * Action types for event operations
 */

import { UUID } from './common.types'
import { Event, EventCreate, EventUpdate } from './event.types'

// Action types
export type EventActionType =
  | 'create'
  | 'update'
  | 'delete'
  | 'duplicate'
  | 'archive'
  | 'unarchive'
  | 'bulk_delete'
  | 'bulk_archive'
  | 'bulk_update'

// Action result states
export type ActionStatus = 'idle' | 'pending' | 'success' | 'error'

// Confirmation dialog configuration
export interface ConfirmationConfig {
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  variant?: 'default' | 'destructive' | 'warning'
  icon?: 'warning' | 'danger' | 'info' | 'question'
}

// Action configuration
export interface ActionConfig {
  requiresConfirmation?: boolean
  confirmation?: ConfirmationConfig
  showToast?: boolean
  toastMessages?: {
    success?: string
    error?: string
    pending?: string
  }
  optimistic?: boolean
  undoable?: boolean
  undoTimeout?: number // ms
}

// Event action definitions
export interface EventAction {
  type: EventActionType
  config: ActionConfig
}

// Single event action payload
export interface SingleEventActionPayload {
  eventId: UUID
  data?: EventUpdate
}

// Bulk action payload
export interface BulkEventActionPayload {
  eventIds: UUID[]
  data?: Partial<EventUpdate>
}

// Action payload union
export type EventActionPayload = SingleEventActionPayload | BulkEventActionPayload

// Action result
export interface ActionResult<T = unknown> {
  success: boolean
  data?: T
  error?: Error
  rollback?: () => void
}

// Optimistic update data
export interface OptimisticUpdate {
  id: string
  queryKey: unknown[]
  previousData: unknown
  newData: unknown
  timestamp: number
}

// Undo operation
export interface UndoOperation {
  id: string
  actionType: EventActionType
  description: string
  undo: () => Promise<void>
  expiresAt: number
}

// Bulk selection state
export interface BulkSelectionState {
  selectedIds: Set<UUID>
  isSelectAll: boolean
  totalCount: number
}

// Event action handlers
export interface EventActionHandlers {
  // Single event actions
  createEvent: (data: EventCreate) => Promise<ActionResult<Event>>
  updateEvent: (eventId: UUID, data: EventUpdate) => Promise<ActionResult<Event>>
  deleteEvent: (eventId: UUID) => Promise<ActionResult<void>>
  duplicateEvent: (eventId: UUID) => Promise<ActionResult<Event>>
  archiveEvent: (eventId: UUID) => Promise<ActionResult<Event>>
  unarchiveEvent: (eventId: UUID) => Promise<ActionResult<Event>>

  // Bulk actions
  bulkDeleteEvents: (eventIds: UUID[]) => Promise<ActionResult<void>>
  bulkArchiveEvents: (eventIds: UUID[]) => Promise<ActionResult<Event[]>>
  bulkUpdateEvents: (eventIds: UUID[], data: Partial<EventUpdate>) => Promise<ActionResult<Event[]>>

  // Undo operations
  undoLastAction: () => Promise<void>
  clearUndoHistory: () => void
}

// Event action state
export interface EventActionState {
  // Loading states
  isCreating: boolean
  isUpdating: boolean
  isDeleting: boolean
  isDuplicating: boolean
  isArchiving: boolean
  isBulkOperating: boolean

  // Selection state
  bulkSelection: BulkSelectionState

  // Undo state
  undoHistory: UndoOperation[]
  canUndo: boolean

  // Confirmation state
  pendingConfirmation: {
    action: EventActionType
    payload: EventActionPayload
    config: ConfirmationConfig
  } | null

  // Last action result
  lastActionResult: ActionResult | null
}

// Event action hooks return type
export interface UseEventActionsReturn extends EventActionHandlers {
  state: EventActionState

  // Selection helpers
  selectEvent: (eventId: UUID) => void
  deselectEvent: (eventId: UUID) => void
  selectAllEvents: () => void
  deselectAllEvents: () => void
  toggleEventSelection: (eventId: UUID) => void
  setTotalCount: (count: number) => void

  // Confirmation helpers
  showConfirmation: (action: EventActionType, payload: EventActionPayload, config: ConfirmationConfig) => void
  hideConfirmation: () => void
  confirmAction: () => Promise<void>

  // Utility functions
  resetState: () => void
  getSelectedEvents: () => UUID[]
  hasSelection: boolean
}

// Hook options
export interface UseEventActionsOptions {
  // Toast configuration
  enableToasts?: boolean
  customToastMessages?: Partial<Record<EventActionType, ActionConfig['toastMessages']>>

  // Optimistic updates
  enableOptimisticUpdates?: boolean

  // Undo functionality
  enableUndo?: boolean
  undoTimeoutDefault?: number
  maxUndoHistory?: number

  // Confirmation defaults
  confirmationDefaults?: Partial<ConfirmationConfig>

  // Callbacks
  onActionStart?: (action: EventActionType, payload: EventActionPayload) => void
  onActionComplete?: (action: EventActionType, result: ActionResult) => void
  onActionError?: (action: EventActionType, error: Error) => void
  onSelectionChange?: (selection: BulkSelectionState) => void
}

// Confirmation dialog props
export interface ConfirmDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  variant?: 'default' | 'destructive' | 'warning'
  icon?: 'warning' | 'danger' | 'info' | 'question'
  isLoading?: boolean
}

// Default action configurations
export const DEFAULT_ACTION_CONFIGS: Record<EventActionType, ActionConfig> = {
  create: {
    showToast: true,
    toastMessages: {
      success: 'Event created successfully',
      error: 'Failed to create event',
      pending: 'Creating event...'
    },
    optimistic: false,
    undoable: false
  },
  update: {
    showToast: true,
    toastMessages: {
      success: 'Event updated successfully',
      error: 'Failed to update event',
      pending: 'Updating event...'
    },
    optimistic: true,
    undoable: true,
    undoTimeout: 5000
  },
  delete: {
    requiresConfirmation: true,
    confirmation: {
      title: 'Delete Event',
      description: 'Are you sure you want to delete this event? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'destructive',
      icon: 'danger'
    },
    showToast: true,
    toastMessages: {
      success: 'Event deleted successfully',
      error: 'Failed to delete event',
      pending: 'Deleting event...'
    },
    optimistic: false,
    undoable: false
  },
  duplicate: {
    showToast: true,
    toastMessages: {
      success: 'Event duplicated successfully',
      error: 'Failed to duplicate event',
      pending: 'Duplicating event...'
    },
    optimistic: false,
    undoable: false
  },
  archive: {
    requiresConfirmation: true,
    confirmation: {
      title: 'Archive Event',
      description: 'Are you sure you want to archive this event? You can restore it later.',
      confirmText: 'Archive',
      cancelText: 'Cancel',
      variant: 'warning',
      icon: 'warning'
    },
    showToast: true,
    toastMessages: {
      success: 'Event archived successfully',
      error: 'Failed to archive event',
      pending: 'Archiving event...'
    },
    optimistic: true,
    undoable: true,
    undoTimeout: 10000
  },
  unarchive: {
    showToast: true,
    toastMessages: {
      success: 'Event restored successfully',
      error: 'Failed to restore event',
      pending: 'Restoring event...'
    },
    optimistic: true,
    undoable: true,
    undoTimeout: 5000
  },
  bulk_delete: {
    requiresConfirmation: true,
    confirmation: {
      title: 'Delete Events',
      description: 'Are you sure you want to delete the selected events? This action cannot be undone.',
      confirmText: 'Delete All',
      cancelText: 'Cancel',
      variant: 'destructive',
      icon: 'danger'
    },
    showToast: true,
    toastMessages: {
      success: 'Events deleted successfully',
      error: 'Failed to delete some events',
      pending: 'Deleting events...'
    },
    optimistic: false,
    undoable: false
  },
  bulk_archive: {
    requiresConfirmation: true,
    confirmation: {
      title: 'Archive Events',
      description: 'Are you sure you want to archive the selected events? You can restore them later.',
      confirmText: 'Archive All',
      cancelText: 'Cancel',
      variant: 'warning',
      icon: 'warning'
    },
    showToast: true,
    toastMessages: {
      success: 'Events archived successfully',
      error: 'Failed to archive some events',
      pending: 'Archiving events...'
    },
    optimistic: true,
    undoable: true,
    undoTimeout: 10000
  },
  bulk_update: {
    showToast: true,
    toastMessages: {
      success: 'Events updated successfully',
      error: 'Failed to update some events',
      pending: 'Updating events...'
    },
    optimistic: true,
    undoable: true,
    undoTimeout: 5000
  }
}