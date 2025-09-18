'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import {
  EventActionType,
  EventActionPayload,
  ActionResult,
  UseEventActionsOptions,
  UseEventActionsReturn,
  EventActionState,
  UndoOperation,
  DEFAULT_ACTION_CONFIGS,
  ConfirmationConfig,
  SingleEventActionPayload,
  BulkEventActionPayload
} from '@/types/actions.types'
import { UUID } from '@/types/common.types'
import { Event, EventCreate, EventUpdate } from '@/types/event.types'
import {
  useCreateEvent,
  useUpdateEvent,
  useDeleteEvent,
  useDuplicateEvent,
  useArchiveEvent,
  eventKeys
} from '@/hooks/api/useEvents'
import { useToast } from '@/hooks/useToast'
import { useOptimisticUpdate } from '@/hooks/useOptimisticUpdate'
import { useConfirmation } from '@/hooks/useConfirmation'
import { useBulkActions } from '@/hooks/useBulkActions'

export function useEventActions(
  options: UseEventActionsOptions = {}
): UseEventActionsReturn {
  const {
    enableToasts = true,
    customToastMessages = {},
    enableOptimisticUpdates = true,
    enableUndo = true,
    undoTimeoutDefault = 5000,
    maxUndoHistory = 10,
    confirmationDefaults = {},
    onActionStart,
    onActionComplete,
    onActionError,
    onSelectionChange
  } = options

  const { toast, success, error: showError } = useToast()
  const { applyOptimisticUpdate, rollbackUpdate } = useOptimisticUpdate()
  const { showConfirmation: showConfirmationDialog } = useConfirmation({
    defaultConfig: confirmationDefaults
  })
  const bulkActions = useBulkActions({
    onSelectionChange
  })

  // State
  const [actionState, setActionState] = useState<EventActionState>({
    isCreating: false,
    isUpdating: false,
    isDeleting: false,
    isDuplicating: false,
    isArchiving: false,
    isBulkOperating: false,
    bulkSelection: { selectedIds: new Set(), isSelectAll: false, totalCount: 0 },
    undoHistory: [],
    canUndo: false,
    pendingConfirmation: null,
    lastActionResult: null
  })

  const pendingActionsRef = useRef<Set<string>>(new Set())

  // API mutations
  const createMutation = useCreateEvent()
  const updateMutation = useUpdateEvent()
  const deleteMutation = useDeleteEvent()
  const duplicateMutation = useDuplicateEvent()
  const archiveMutation = useArchiveEvent()

  // Cleanup expired undo operations
  useEffect(() => {
    const cleanup = () => {
      const now = Date.now()
      setActionState(prev => ({
        ...prev,
        undoHistory: prev.undoHistory.filter(op => op.expiresAt > now),
        canUndo: prev.undoHistory.some(op => op.expiresAt > now)
      }))
    }

    const interval = setInterval(cleanup, 1000)
    return () => clearInterval(interval)
  }, [])

  // Helper functions
  const getActionConfig = useCallback((action: EventActionType) => {
    const defaultConfig = DEFAULT_ACTION_CONFIGS[action]
    const customMessages = customToastMessages[action]

    return {
      ...defaultConfig,
      toastMessages: {
        ...defaultConfig.toastMessages,
        ...customMessages
      }
    }
  }, [customToastMessages])

  const showToast = useCallback((action: EventActionType, type: 'success' | 'error' | 'pending', customMessage?: string) => {
    if (!enableToasts) return

    const config = getActionConfig(action)
    const message = customMessage || config.toastMessages?.[type]

    if (message) {
      switch (type) {
        case 'success':
          success(message)
          break
        case 'error':
          showError(message)
          break
        case 'pending':
          toast({ description: message, variant: 'default' })
          break
      }
    }
  }, [enableToasts, getActionConfig, success, showError, toast])

  const addUndoOperation = useCallback((operation: Omit<UndoOperation, 'expiresAt'>) => {
    if (!enableUndo) return

    const expiresAt = Date.now() + undoTimeoutDefault
    const undoOp: UndoOperation = {
      ...operation,
      expiresAt
    }

    setActionState(prev => {
      const newHistory = [undoOp, ...prev.undoHistory].slice(0, maxUndoHistory)
      return {
        ...prev,
        undoHistory: newHistory,
        canUndo: true
      }
    })
  }, [enableUndo, undoTimeoutDefault, maxUndoHistory])

  const executeAction = useCallback(async <T>(
    action: EventActionType,
    payload: EventActionPayload,
    executor: () => Promise<T>
  ): Promise<ActionResult<T>> => {
    const actionId = `${action}-${Date.now()}`
    pendingActionsRef.current.add(actionId)

    try {
      if (onActionStart) {
        onActionStart(action, payload)
      }

      showToast(action, 'pending')

      const result = await executor()

      const actionResult: ActionResult<T> = {
        success: true,
        data: result
      }

      setActionState(prev => ({
        ...prev,
        lastActionResult: actionResult
      }))

      showToast(action, 'success')

      if (onActionComplete) {
        onActionComplete(action, actionResult)
      }

      return actionResult
    } catch (error) {
      const actionResult: ActionResult<T> = {
        success: false,
        error: error as Error
      }

      setActionState(prev => ({
        ...prev,
        lastActionResult: actionResult
      }))

      showToast(action, 'error', (error as Error).message)

      if (onActionError) {
        onActionError(action, error as Error)
      }

      throw error
    } finally {
      pendingActionsRef.current.delete(actionId)
    }
  }, [onActionStart, onActionComplete, onActionError, showToast])

  // Action handlers
  const createEvent = useCallback(async (data: EventCreate): Promise<ActionResult<Event>> => {
    setActionState(prev => ({ ...prev, isCreating: true }))

    try {
      return await executeAction('create', { eventId: 'new', data }, async () => {
        const result = await createMutation.mutateAsync(data)
        return result
      })
    } finally {
      setActionState(prev => ({ ...prev, isCreating: false }))
    }
  }, [createMutation, executeAction])

  const updateEvent = useCallback(async (eventId: UUID, data: EventUpdate): Promise<ActionResult<Event>> => {
    setActionState(prev => ({ ...prev, isUpdating: true }))

    try {
      return await executeAction('update', { eventId, data }, async () => {
        let optimisticUpdateId: string | undefined

        if (enableOptimisticUpdates) {
          optimisticUpdateId = applyOptimisticUpdate(
            [...eventKeys.detail(eventId)],
            (oldData: Event | undefined): Event => {
              if (!oldData) {
                throw new Error('Cannot apply optimistic update: no existing data')
              }
              return { ...oldData, ...data }
            }
          )
        }

        try {
          const result = await updateMutation.mutateAsync({ id: eventId, data })

          // Add undo operation
          if (enableUndo) {
            addUndoOperation({
              id: `update-${eventId}-${Date.now()}`,
              actionType: 'update',
              description: `Updated "${result.name}"`,
              undo: async () => {
                // This would need previous data to implement properly
                console.log('Undo update not implemented yet')
              }
            })
          }

          return result
        } catch (error) {
          if (optimisticUpdateId) {
            rollbackUpdate(optimisticUpdateId)
          }
          throw error
        }
      })
    } finally {
      setActionState(prev => ({ ...prev, isUpdating: false }))
    }
  }, [updateMutation, executeAction, enableOptimisticUpdates, enableUndo, applyOptimisticUpdate, rollbackUpdate, addUndoOperation])

  const deleteEvent = useCallback(async (eventId: UUID): Promise<ActionResult<void>> => {
    const config = getActionConfig('delete')

    if (config.requiresConfirmation && config.confirmation) {
      const confirmed = await showConfirmationDialog(config.confirmation)
      if (!confirmed) {
        return { success: false, error: new Error('Action cancelled by user') }
      }
    }

    setActionState(prev => ({ ...prev, isDeleting: true }))

    try {
      return await executeAction('delete', { eventId }, async () => {
        await deleteMutation.mutateAsync(eventId)
      })
    } finally {
      setActionState(prev => ({ ...prev, isDeleting: false }))
    }
  }, [deleteMutation, executeAction, getActionConfig, showConfirmationDialog])

  const duplicateEvent = useCallback(async (eventId: UUID): Promise<ActionResult<Event>> => {
    setActionState(prev => ({ ...prev, isDuplicating: true }))

    try {
      return await executeAction('duplicate', { eventId }, async () => {
        const result = await duplicateMutation.mutateAsync(eventId)
        return result
      })
    } finally {
      setActionState(prev => ({ ...prev, isDuplicating: false }))
    }
  }, [duplicateMutation, executeAction])

  const archiveEvent = useCallback(async (eventId: UUID): Promise<ActionResult<Event>> => {
    const config = getActionConfig('archive')

    if (config.requiresConfirmation && config.confirmation) {
      const confirmed = await showConfirmationDialog(config.confirmation)
      if (!confirmed) {
        return { success: false, error: new Error('Action cancelled by user') }
      }
    }

    setActionState(prev => ({ ...prev, isArchiving: true }))

    try {
      return await executeAction('archive', { eventId }, async () => {
        const result = await archiveMutation.mutateAsync(eventId)

        if (enableUndo) {
          addUndoOperation({
            id: `archive-${eventId}-${Date.now()}`,
            actionType: 'archive',
            description: `Archived "${result.name}"`,
            undo: async () => {
              // This would call unarchiveEvent
              console.log('Undo archive not implemented yet')
            }
          })
        }

        return result
      })
    } finally {
      setActionState(prev => ({ ...prev, isArchiving: false }))
    }
  }, [archiveMutation, executeAction, getActionConfig, showConfirmationDialog, enableUndo, addUndoOperation])

  const unarchiveEvent = useCallback(async (eventId: UUID): Promise<ActionResult<Event>> => {
    setActionState(prev => ({ ...prev, isArchiving: true }))

    try {
      return await executeAction('unarchive', { eventId }, async () => {
        // This would need an unarchive API endpoint
        throw new Error('Unarchive not implemented yet')
      })
    } finally {
      setActionState(prev => ({ ...prev, isArchiving: false }))
    }
  }, [executeAction])

  // Bulk operations
  const bulkDeleteEvents = useCallback(async (eventIds: UUID[]): Promise<ActionResult<void>> => {
    const config = getActionConfig('bulk_delete')

    if (config.requiresConfirmation && config.confirmation) {
      const confirmed = await showConfirmationDialog({
        ...config.confirmation,
        description: `Are you sure you want to delete ${eventIds.length} events? This action cannot be undone.`
      })
      if (!confirmed) {
        return { success: false, error: new Error('Action cancelled by user') }
      }
    }

    setActionState(prev => ({ ...prev, isBulkOperating: true }))

    try {
      return await executeAction('bulk_delete', { eventIds }, async () => {
        // Execute deletions in parallel
        await Promise.all(eventIds.map(id => deleteMutation.mutateAsync(id)))

        // Clear selection after successful deletion
        bulkActions.deselectAll()
      })
    } finally {
      setActionState(prev => ({ ...prev, isBulkOperating: false }))
    }
  }, [executeAction, getActionConfig, showConfirmationDialog, deleteMutation, bulkActions])

  const bulkArchiveEvents = useCallback(async (eventIds: UUID[]): Promise<ActionResult<Event[]>> => {
    const config = getActionConfig('bulk_archive')

    if (config.requiresConfirmation && config.confirmation) {
      const confirmed = await showConfirmationDialog({
        ...config.confirmation,
        description: `Are you sure you want to archive ${eventIds.length} events? You can restore them later.`
      })
      if (!confirmed) {
        return { success: false, error: new Error('Action cancelled by user') }
      }
    }

    setActionState(prev => ({ ...prev, isBulkOperating: true }))

    try {
      return await executeAction('bulk_archive', { eventIds }, async () => {
        // Execute archives in parallel
        const results = await Promise.all(eventIds.map(id => archiveMutation.mutateAsync(id)))

        // Clear selection after successful archiving
        bulkActions.deselectAll()

        return results
      })
    } finally {
      setActionState(prev => ({ ...prev, isBulkOperating: false }))
    }
  }, [executeAction, getActionConfig, showConfirmationDialog, archiveMutation, bulkActions])

  const bulkUpdateEvents = useCallback(async (eventIds: UUID[], data: Partial<EventUpdate>): Promise<ActionResult<Event[]>> => {
    setActionState(prev => ({ ...prev, isBulkOperating: true }))

    try {
      return await executeAction('bulk_update', { eventIds, data }, async () => {
        // Execute updates in parallel
        const results = await Promise.all(
          eventIds.map(id => updateMutation.mutateAsync({ id, data: data as EventUpdate }))
        )

        return results
      })
    } finally {
      setActionState(prev => ({ ...prev, isBulkOperating: false }))
    }
  }, [executeAction, updateMutation])

  // Undo operations
  const undoLastAction = useCallback(async (): Promise<void> => {
    const lastOperation = actionState.undoHistory[0]
    if (!lastOperation || lastOperation.expiresAt <= Date.now()) {
      return
    }

    try {
      await lastOperation.undo()

      // Remove the undone operation from history
      setActionState(prev => ({
        ...prev,
        undoHistory: prev.undoHistory.slice(1),
        canUndo: prev.undoHistory.length > 1
      }))

      success('Action undone successfully')
    } catch (error) {
      showError('Failed to undo action')
      console.error('Undo failed:', error)
    }
  }, [actionState.undoHistory, success, showError])

  const clearUndoHistory = useCallback(() => {
    setActionState(prev => ({
      ...prev,
      undoHistory: [],
      canUndo: false
    }))
  }, [])

  // Confirmation helpers
  const showConfirmation = useCallback((action: EventActionType, payload: EventActionPayload, config: ConfirmationConfig) => {
    setActionState(prev => ({
      ...prev,
      pendingConfirmation: { action, payload, config }
    }))
  }, [])

  const hideConfirmation = useCallback(() => {
    setActionState(prev => ({
      ...prev,
      pendingConfirmation: null
    }))
  }, [])

  const confirmAction = useCallback(async () => {
    const { pendingConfirmation } = actionState
    if (!pendingConfirmation) return

    hideConfirmation()

    const { action, payload } = pendingConfirmation
    const isSingleEvent = 'eventId' in payload

    if (isSingleEvent) {
      const singlePayload = payload as SingleEventActionPayload
      switch (action) {
        case 'delete':
          await deleteEvent(singlePayload.eventId)
          break
        case 'archive':
          await archiveEvent(singlePayload.eventId)
          break
        case 'update':
          if (singlePayload.data) {
            await updateEvent(singlePayload.eventId, singlePayload.data)
          }
          break
      }
    } else {
      const bulkPayload = payload as BulkEventActionPayload
      switch (action) {
        case 'bulk_delete':
          await bulkDeleteEvents(bulkPayload.eventIds)
          break
        case 'bulk_archive':
          await bulkArchiveEvents(bulkPayload.eventIds)
          break
        case 'bulk_update':
          if (bulkPayload.data) {
            await bulkUpdateEvents(bulkPayload.eventIds, bulkPayload.data)
          }
          break
      }
    }
  }, [actionState, hideConfirmation, deleteEvent, archiveEvent, updateEvent, bulkDeleteEvents, bulkArchiveEvents, bulkUpdateEvents])

  // Utility functions
  const resetState = useCallback(() => {
    setActionState({
      isCreating: false,
      isUpdating: false,
      isDeleting: false,
      isDuplicating: false,
      isArchiving: false,
      isBulkOperating: false,
      bulkSelection: { selectedIds: new Set(), isSelectAll: false, totalCount: 0 },
      undoHistory: [],
      canUndo: false,
      pendingConfirmation: null,
      lastActionResult: null
    })
    bulkActions.resetSelection()
  }, [bulkActions])

  const getSelectedEvents = useCallback(() => {
    return bulkActions.selectedIds
  }, [bulkActions.selectedIds])

  return {
    // State - merge action state with current bulk selection
    state: {
      ...actionState,
      bulkSelection: bulkActions.selection
    },

    // Single event actions
    createEvent,
    updateEvent,
    deleteEvent,
    duplicateEvent,
    archiveEvent,
    unarchiveEvent,

    // Bulk actions
    bulkDeleteEvents,
    bulkArchiveEvents,
    bulkUpdateEvents,

    // Undo operations
    undoLastAction,
    clearUndoHistory,

    // Selection helpers
    selectEvent: bulkActions.selectItem,
    deselectEvent: bulkActions.deselectItem,
    selectAllEvents: bulkActions.selectAll,
    deselectAllEvents: bulkActions.deselectAll,
    toggleEventSelection: bulkActions.toggleItem,
    setTotalCount: bulkActions.setTotalCount,

    // Confirmation helpers
    showConfirmation,
    hideConfirmation,
    confirmAction,

    // Utility functions
    resetState,
    getSelectedEvents,
    hasSelection: bulkActions.hasSelection
  }
}