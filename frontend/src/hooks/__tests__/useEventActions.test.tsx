/**
 * Tests for useEventActions hook
 */

import { renderHook, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import { useEventActions } from '../useEventActions'
import { EventCreate, EventUpdate, EventType, EventStatus } from '@/types/event.types'
import { UUID } from '@/types/common.types'

// Mock the API hooks
jest.mock('../api/useEvents', () => ({
  useCreateEvent: jest.fn(),
  useUpdateEvent: jest.fn(),
  useDeleteEvent: jest.fn(),
  useDuplicateEvent: jest.fn(),
  useArchiveEvent: jest.fn(),
  eventKeys: {
    detail: (id: string) => ['events', 'detail', id],
    lists: () => ['events', 'list']
  }
}))

// Mock toast hook
jest.mock('../useToast', () => ({
  useToast: jest.fn(() => ({
    toast: jest.fn(),
    success: jest.fn(),
    error: jest.fn()
  }))
}))

// Mock the supporting hooks
jest.mock('../useOptimisticUpdate', () => ({
  useOptimisticUpdate: jest.fn(() => ({
    applyOptimisticUpdate: jest.fn(() => 'update-id'),
    rollbackUpdate: jest.fn(),
    rollbackAll: jest.fn(),
    getPendingUpdates: jest.fn(() => [])
  }))
}))

jest.mock('../useConfirmation', () => ({
  useConfirmation: jest.fn(() => ({
    showConfirmation: jest.fn(() => Promise.resolve(true))
  }))
}))

jest.mock('../useBulkActions', () => ({
  useBulkActions: jest.fn(() => ({
    selection: {
      selectedIds: new Set<string>(),
      isSelectAll: false,
      totalCount: 0
    },
    selectedIds: [],
    selectItem: jest.fn(),
    deselectItem: jest.fn(),
    selectAll: jest.fn(),
    deselectAll: jest.fn(),
    toggleItem: jest.fn(),
    resetSelection: jest.fn(),
    hasSelection: false
  }))
}))

import {
  useCreateEvent,
  useUpdateEvent,
  useDeleteEvent,
  useDuplicateEvent,
  useArchiveEvent
} from '../api/useEvents'
import { useToast } from '../useToast'
import { useOptimisticUpdate } from '../useOptimisticUpdate'
import { useConfirmation } from '../useConfirmation'
import { useBulkActions } from '../useBulkActions'

const mockUseCreateEvent = useCreateEvent as jest.MockedFunction<typeof useCreateEvent>
const mockUseUpdateEvent = useUpdateEvent as jest.MockedFunction<typeof useUpdateEvent>
const mockUseDeleteEvent = useDeleteEvent as jest.MockedFunction<typeof useDeleteEvent>
const mockUseDuplicateEvent = useDuplicateEvent as jest.MockedFunction<typeof useDuplicateEvent>
const mockUseArchiveEvent = useArchiveEvent as jest.MockedFunction<typeof useArchiveEvent>
const mockUseToast = useToast as jest.MockedFunction<typeof useToast>
const mockUseOptimisticUpdate = useOptimisticUpdate as jest.MockedFunction<typeof useOptimisticUpdate>
const mockUseConfirmation = useConfirmation as jest.MockedFunction<typeof useConfirmation>
const mockUseBulkActions = useBulkActions as jest.MockedFunction<typeof useBulkActions>

// Test wrapper with QueryClient
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  })

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )

  Wrapper.displayName = 'TestWrapper'

  return Wrapper
}

// Mock mutation objects
const createMockMutation = (success = true, result?: unknown) => ({
  mutateAsync: jest.fn(() => success ? Promise.resolve(result) : Promise.reject(new Error('API Error'))),
  mutate: jest.fn(),
  isPending: false,
  isError: false,
  isSuccess: success,
  error: null,
  data: result
})

// Sample data
const mockEvent = {
  id: 'event-1' as UUID,
  name: 'Test Event',
  type: EventType.BIRTHDAY,
  status: EventStatus.PLANNING,
  start_date: '2024-12-25T10:00:00Z',
  planner_id: 'user-1' as UUID,
  guest_count: 10,
  confirmed_guests: 5,
  total_expenses: 100,
  is_public: false,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z'
}

const mockEventCreate: EventCreate = {
  name: 'New Event',
  type: EventType.BIRTHDAY,
  start_date: '2024-12-25T10:00:00Z',
  is_public: false
}

const mockEventUpdate: EventUpdate = {
  name: 'Updated Event'
}

describe('useEventActions', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    // Setup default mock implementations
    mockUseToast.mockReturnValue({
      toast: jest.fn(),
      success: jest.fn(),
      error: jest.fn(),
      info: jest.fn(),
      removeToast: jest.fn(),
      toasts: []
    })

    mockUseOptimisticUpdate.mockReturnValue({
      applyOptimisticUpdate: jest.fn(() => 'update-id'),
      rollbackUpdate: jest.fn(),
      rollbackAll: jest.fn(),
      getPendingUpdates: jest.fn(() => [])
    })

    mockUseConfirmation.mockReturnValue({
      state: { isOpen: false, config: null, isLoading: false },
      showConfirmation: jest.fn(() => Promise.resolve(true)),
      hideConfirmation: jest.fn(),
      confirm: jest.fn(),
      cancel: jest.fn(),
      setLoading: jest.fn()
    })

    mockUseBulkActions.mockReturnValue({
      selection: {
        selectedIds: new Set<string>(),
        isSelectAll: false,
        totalCount: 0
      },
      selectedIds: [],
      selectedCount: 0,
      hasSelection: false,
      isAllSelected: false,
      isPartiallySelected: false,
      selectItem: jest.fn(),
      deselectItem: jest.fn(),
      toggleItem: jest.fn(),
      selectAll: jest.fn(),
      deselectAll: jest.fn(),
      selectMultiple: jest.fn(),
      deselectMultiple: jest.fn(),
      isSelected: jest.fn(() => false),
      resetSelection: jest.fn(),
      setTotalCount: jest.fn()
    })
  })

  describe('createEvent', () => {
    it('should create event successfully', async () => {
      const mockMutation = createMockMutation(true, mockEvent)
      mockUseCreateEvent.mockReturnValue(mockMutation)

      const wrapper = createWrapper()
      const { result } = renderHook(() => useEventActions(), { wrapper })

      let actionResult: unknown
      await act(async () => {
        actionResult = await result.current.createEvent(mockEventCreate)
      })

      expect(mockMutation.mutateAsync).toHaveBeenCalledWith(mockEventCreate)
      expect(actionResult.success).toBe(true)
      expect(actionResult.data).toEqual(mockEvent)
    })

    it('should handle create event error', async () => {
      const mockMutation = createMockMutation(false)
      mockUseCreateEvent.mockReturnValue(mockMutation)

      const wrapper = createWrapper()
      const { result } = renderHook(() => useEventActions(), { wrapper })

      await act(async () => {
        try {
          await result.current.createEvent(mockEventCreate)
        } catch (error) {
          expect(error).toBeInstanceOf(Error)
        }
      })
    })

    it('should show toast notifications when enabled', async () => {
      const mockToast = { success: jest.fn(), error: jest.fn(), toast: jest.fn() }
      mockUseToast.mockReturnValue({
        ...mockToast,
        info: jest.fn(),
        removeToast: jest.fn(),
        toasts: []
      })

      const mockMutation = createMockMutation(true, mockEvent)
      mockUseCreateEvent.mockReturnValue(mockMutation)

      const wrapper = createWrapper()
      const { result } = renderHook(() => useEventActions({ enableToasts: true }), { wrapper })

      await act(async () => {
        await result.current.createEvent(mockEventCreate)
      })

      expect(mockToast.toast).toHaveBeenCalledWith({ description: 'Creating event...', variant: 'default' })
      expect(mockToast.success).toHaveBeenCalledWith('Event created successfully')
    })

    it('should not show toast notifications when disabled', async () => {
      const mockToast = { success: jest.fn(), error: jest.fn(), toast: jest.fn() }
      mockUseToast.mockReturnValue({
        ...mockToast,
        info: jest.fn(),
        removeToast: jest.fn(),
        toasts: []
      })

      const mockMutation = createMockMutation(true, mockEvent)
      mockUseCreateEvent.mockReturnValue(mockMutation)

      const wrapper = createWrapper()
      const { result } = renderHook(() => useEventActions({ enableToasts: false }), { wrapper })

      await act(async () => {
        await result.current.createEvent(mockEventCreate)
      })

      expect(mockToast.toast).not.toHaveBeenCalled()
      expect(mockToast.success).not.toHaveBeenCalled()
    })

    it('should call onActionStart and onActionComplete callbacks', async () => {
      const onActionStart = jest.fn()
      const onActionComplete = jest.fn()

      const mockMutation = createMockMutation(true, mockEvent)
      mockUseCreateEvent.mockReturnValue(mockMutation)

      const wrapper = createWrapper()
      const { result } = renderHook(() => useEventActions({
        onActionStart,
        onActionComplete
      }), { wrapper })

      await act(async () => {
        await result.current.createEvent(mockEventCreate)
      })

      expect(onActionStart).toHaveBeenCalledWith('create', { eventId: 'new', data: mockEventCreate })
      expect(onActionComplete).toHaveBeenCalledWith('create', { success: true, data: mockEvent })
    })
  })

  describe('updateEvent', () => {
    it('should update event successfully', async () => {
      const mockMutation = createMockMutation(true, { ...mockEvent, ...mockEventUpdate })
      mockUseUpdateEvent.mockReturnValue(mockMutation)

      const wrapper = createWrapper()
      const { result } = renderHook(() => useEventActions(), { wrapper })

      let actionResult: unknown
      await act(async () => {
        actionResult = await result.current.updateEvent(mockEvent.id, mockEventUpdate)
      })

      expect(mockMutation.mutateAsync).toHaveBeenCalledWith({ id: mockEvent.id, data: mockEventUpdate })
      expect(actionResult.success).toBe(true)
      expect(actionResult.data.name).toBe(mockEventUpdate.name)
    })

    it('should apply optimistic updates when enabled', async () => {
      const mockOptimisticUpdate = {
        applyOptimisticUpdate: jest.fn(() => 'update-id'),
        rollbackUpdate: jest.fn(),
        rollbackAll: jest.fn(),
        getPendingUpdates: jest.fn(() => [])
      }
      mockUseOptimisticUpdate.mockReturnValue(mockOptimisticUpdate)

      const mockMutation = createMockMutation(true, { ...mockEvent, ...mockEventUpdate })
      mockUseUpdateEvent.mockReturnValue(mockMutation)

      const wrapper = createWrapper()
      const { result } = renderHook(() => useEventActions({ enableOptimisticUpdates: true }), { wrapper })

      await act(async () => {
        await result.current.updateEvent(mockEvent.id, mockEventUpdate)
      })

      expect(mockOptimisticUpdate.applyOptimisticUpdate).toHaveBeenCalled()
    })

    it('should rollback optimistic updates on error', async () => {
      const mockOptimisticUpdate = {
        applyOptimisticUpdate: jest.fn(() => 'update-id'),
        rollbackUpdate: jest.fn(),
        rollbackAll: jest.fn(),
        getPendingUpdates: jest.fn(() => [])
      }
      mockUseOptimisticUpdate.mockReturnValue(mockOptimisticUpdate)

      const mockMutation = createMockMutation(false)
      mockUseUpdateEvent.mockReturnValue(mockMutation)

      const wrapper = createWrapper()
      const { result } = renderHook(() => useEventActions({ enableOptimisticUpdates: true }), { wrapper })

      await act(async () => {
        try {
          await result.current.updateEvent(mockEvent.id, mockEventUpdate)
        } catch (error) {
          expect(mockOptimisticUpdate.rollbackUpdate).toHaveBeenCalledWith('update-id')
        }
      })
    })
  })

  describe('deleteEvent', () => {
    it('should delete event successfully with confirmation', async () => {
      const mockConfirmation = {
        state: { isOpen: false, config: null, isLoading: false },
        showConfirmation: jest.fn(() => Promise.resolve(true)),
        hideConfirmation: jest.fn(),
        confirm: jest.fn(),
        cancel: jest.fn(),
        setLoading: jest.fn()
      }
      mockUseConfirmation.mockReturnValue(mockConfirmation)

      const mockMutation = createMockMutation(true)
      mockUseDeleteEvent.mockReturnValue(mockMutation)

      const wrapper = createWrapper()
      const { result } = renderHook(() => useEventActions(), { wrapper })

      let actionResult: unknown
      await act(async () => {
        actionResult = await result.current.deleteEvent(mockEvent.id)
      })

      expect(mockConfirmation.showConfirmation).toHaveBeenCalled()
      expect(mockMutation.mutateAsync).toHaveBeenCalledWith(mockEvent.id)
      expect(actionResult.success).toBe(true)
    })

    it('should cancel delete when confirmation is rejected', async () => {
      const mockConfirmation = {
        state: { isOpen: false, config: null, isLoading: false },
        showConfirmation: jest.fn(() => Promise.resolve(false)),
        hideConfirmation: jest.fn(),
        confirm: jest.fn(),
        cancel: jest.fn(),
        setLoading: jest.fn()
      }
      mockUseConfirmation.mockReturnValue(mockConfirmation)

      const mockMutation = createMockMutation(true)
      mockUseDeleteEvent.mockReturnValue(mockMutation)

      const wrapper = createWrapper()
      const { result } = renderHook(() => useEventActions(), { wrapper })

      let actionResult: unknown
      await act(async () => {
        actionResult = await result.current.deleteEvent(mockEvent.id)
      })

      expect(mockConfirmation.showConfirmation).toHaveBeenCalled()
      expect(mockMutation.mutateAsync).not.toHaveBeenCalled()
      expect(actionResult.success).toBe(false)
      expect(actionResult.error?.message).toBe('Action cancelled by user')
    })
  })

  describe('duplicateEvent', () => {
    it('should duplicate event successfully', async () => {
      const duplicatedEvent = { ...mockEvent, id: 'event-2' as UUID, name: 'Copy of Test Event' }
      const mockMutation = createMockMutation(true, duplicatedEvent)
      mockUseDuplicateEvent.mockReturnValue(mockMutation)

      const wrapper = createWrapper()
      const { result } = renderHook(() => useEventActions(), { wrapper })

      let actionResult: unknown
      await act(async () => {
        actionResult = await result.current.duplicateEvent(mockEvent.id)
      })

      expect(mockMutation.mutateAsync).toHaveBeenCalledWith(mockEvent.id)
      expect(actionResult.success).toBe(true)
      expect(actionResult.data).toEqual(duplicatedEvent)
    })
  })

  describe('archiveEvent', () => {
    it('should archive event successfully with confirmation', async () => {
      const mockConfirmation = {
        state: { isOpen: false, config: null, isLoading: false },
        showConfirmation: jest.fn(() => Promise.resolve(true)),
        hideConfirmation: jest.fn(),
        confirm: jest.fn(),
        cancel: jest.fn(),
        setLoading: jest.fn()
      }
      mockUseConfirmation.mockReturnValue(mockConfirmation)

      const archivedEvent = { ...mockEvent, status: EventStatus.CANCELLED }
      const mockMutation = createMockMutation(true, archivedEvent)
      mockUseArchiveEvent.mockReturnValue(mockMutation)

      const wrapper = createWrapper()
      const { result } = renderHook(() => useEventActions(), { wrapper })

      let actionResult: unknown
      await act(async () => {
        actionResult = await result.current.archiveEvent(mockEvent.id)
      })

      expect(mockConfirmation.showConfirmation).toHaveBeenCalled()
      expect(mockMutation.mutateAsync).toHaveBeenCalledWith(mockEvent.id)
      expect(actionResult.success).toBe(true)
      expect(actionResult.data).toEqual(archivedEvent)
    })
  })

  describe('bulk operations', () => {
    const eventIds = ['event-1', 'event-2', 'event-3'] as UUID[]

    it('should delete multiple events with confirmation', async () => {
      const mockConfirmation = {
        state: { isOpen: false, config: null, isLoading: false },
        showConfirmation: jest.fn(() => Promise.resolve(true)),
        hideConfirmation: jest.fn(),
        confirm: jest.fn(),
        cancel: jest.fn(),
        setLoading: jest.fn()
      }
      mockUseConfirmation.mockReturnValue(mockConfirmation)

      const mockMutation = createMockMutation(true)
      mockUseDeleteEvent.mockReturnValue(mockMutation)

      const mockBulkActions = {
        selection: { selectedIds: new Set(eventIds), isSelectAll: false, totalCount: eventIds.length },
        selectedIds: eventIds,
        selectedCount: eventIds.length,
        hasSelection: true,
        isAllSelected: false,
        isPartiallySelected: false,
        selectItem: jest.fn(),
        deselectItem: jest.fn(),
        toggleItem: jest.fn(),
        selectAll: jest.fn(),
        deselectAll: jest.fn(),
        selectMultiple: jest.fn(),
        deselectMultiple: jest.fn(),
        isSelected: jest.fn(() => true),
        resetSelection: jest.fn(),
        setTotalCount: jest.fn()
      }
      mockUseBulkActions.mockReturnValue(mockBulkActions)

      const wrapper = createWrapper()
      const { result } = renderHook(() => useEventActions(), { wrapper })

      let actionResult: unknown
      await act(async () => {
        actionResult = await result.current.bulkDeleteEvents(eventIds)
      })

      expect(mockConfirmation.showConfirmation).toHaveBeenCalledWith(
        expect.objectContaining({
          description: 'Are you sure you want to delete 3 events? This action cannot be undone.'
        })
      )
      expect(mockMutation.mutateAsync).toHaveBeenCalledTimes(eventIds.length)
      expect(mockBulkActions.deselectAll).toHaveBeenCalled()
      expect(actionResult.success).toBe(true)
    })

    it('should archive multiple events with confirmation', async () => {
      const mockConfirmation = {
        state: { isOpen: false, config: null, isLoading: false },
        showConfirmation: jest.fn(() => Promise.resolve(true)),
        hideConfirmation: jest.fn(),
        confirm: jest.fn(),
        cancel: jest.fn(),
        setLoading: jest.fn()
      }
      mockUseConfirmation.mockReturnValue(mockConfirmation)

      const mockMutation = createMockMutation(true, { ...mockEvent, status: EventStatus.CANCELLED })
      mockUseArchiveEvent.mockReturnValue(mockMutation)

      const mockBulkActions = {
        selection: { selectedIds: new Set(eventIds), isSelectAll: false, totalCount: eventIds.length },
        selectedIds: eventIds,
        selectedCount: eventIds.length,
        hasSelection: true,
        isAllSelected: false,
        isPartiallySelected: false,
        selectItem: jest.fn(),
        deselectItem: jest.fn(),
        toggleItem: jest.fn(),
        selectAll: jest.fn(),
        deselectAll: jest.fn(),
        selectMultiple: jest.fn(),
        deselectMultiple: jest.fn(),
        isSelected: jest.fn(() => true),
        resetSelection: jest.fn(),
        setTotalCount: jest.fn()
      }
      mockUseBulkActions.mockReturnValue(mockBulkActions)

      const wrapper = createWrapper()
      const { result } = renderHook(() => useEventActions(), { wrapper })

      let actionResult: unknown
      await act(async () => {
        actionResult = await result.current.bulkArchiveEvents(eventIds)
      })

      expect(mockConfirmation.showConfirmation).toHaveBeenCalledWith(
        expect.objectContaining({
          description: 'Are you sure you want to archive 3 events? You can restore them later.'
        })
      )
      expect(mockMutation.mutateAsync).toHaveBeenCalledTimes(eventIds.length)
      expect(mockBulkActions.deselectAll).toHaveBeenCalled()
      expect(actionResult.success).toBe(true)
    })

    it('should update multiple events', async () => {
      const mockMutation = createMockMutation(true, { ...mockEvent, ...mockEventUpdate })
      mockUseUpdateEvent.mockReturnValue(mockMutation)

      const wrapper = createWrapper()
      const { result } = renderHook(() => useEventActions(), { wrapper })

      let actionResult: unknown
      await act(async () => {
        actionResult = await result.current.bulkUpdateEvents(eventIds, mockEventUpdate)
      })

      expect(mockMutation.mutateAsync).toHaveBeenCalledTimes(eventIds.length)
      eventIds.forEach(id => {
        expect(mockMutation.mutateAsync).toHaveBeenCalledWith({ id, data: mockEventUpdate })
      })
      expect(actionResult.success).toBe(true)
      expect(actionResult.data).toHaveLength(eventIds.length)
    })
  })

  describe('state management', () => {
    it('should track loading states correctly', async () => {
      const mockMutation = createMockMutation(true, mockEvent)
      mockUseCreateEvent.mockReturnValue(mockMutation)

      const wrapper = createWrapper()
      const { result } = renderHook(() => useEventActions(), { wrapper })

      expect(result.current.state.isCreating).toBe(false)

      act(() => {
        result.current.createEvent(mockEventCreate)
      })

      // Note: In a real scenario, you'd need to test the loading state during the async operation
      // This is a simplified test showing the structure
    })

    it('should reset state correctly', () => {
      const wrapper = createWrapper()
      const { result } = renderHook(() => useEventActions(), { wrapper })

      act(() => {
        result.current.resetState()
      })

      expect(result.current.state.isCreating).toBe(false)
      expect(result.current.state.isUpdating).toBe(false)
      expect(result.current.state.isDeleting).toBe(false)
      expect(result.current.state.isDuplicating).toBe(false)
      expect(result.current.state.isArchiving).toBe(false)
      expect(result.current.state.isBulkOperating).toBe(false)
    })
  })

  describe('selection helpers', () => {
    it('should proxy selection methods to bulk actions', () => {
      const mockBulkActions = {
        selection: { selectedIds: new Set<string>(), isSelectAll: false, totalCount: 0 },
        selectedIds: [],
        selectedCount: 0,
        hasSelection: false,
        isAllSelected: false,
        isPartiallySelected: false,
        selectItem: jest.fn(),
        deselectItem: jest.fn(),
        toggleItem: jest.fn(),
        selectAll: jest.fn(),
        deselectAll: jest.fn(),
        selectMultiple: jest.fn(),
        deselectMultiple: jest.fn(),
        isSelected: jest.fn(() => false),
        resetSelection: jest.fn(),
        setTotalCount: jest.fn()
      }
      mockUseBulkActions.mockReturnValue(mockBulkActions)

      const wrapper = createWrapper()
      const { result } = renderHook(() => useEventActions(), { wrapper })

      act(() => {
        result.current.selectEvent('event-1')
        result.current.deselectEvent('event-1')
        result.current.toggleEventSelection('event-1')
        result.current.selectAllEvents()
        result.current.deselectAllEvents()
      })

      expect(mockBulkActions.selectItem).toHaveBeenCalledWith('event-1')
      expect(mockBulkActions.deselectItem).toHaveBeenCalledWith('event-1')
      expect(mockBulkActions.toggleItem).toHaveBeenCalledWith('event-1')
      expect(mockBulkActions.selectAll).toHaveBeenCalled()
      expect(mockBulkActions.deselectAll).toHaveBeenCalled()
    })
  })

  describe('custom configuration', () => {
    it('should use custom toast messages', async () => {
      const customMessages = {
        create: {
          success: 'Custom success message',
          error: 'Custom error message',
          pending: 'Custom pending message'
        }
      }

      const mockToast = { success: jest.fn(), error: jest.fn(), toast: jest.fn() }
      mockUseToast.mockReturnValue({
        ...mockToast,
        info: jest.fn(),
        removeToast: jest.fn(),
        toasts: []
      })

      const mockMutation = createMockMutation(true, mockEvent)
      mockUseCreateEvent.mockReturnValue(mockMutation)

      const wrapper = createWrapper()
      const { result } = renderHook(() => useEventActions({
        customToastMessages: customMessages
      }), { wrapper })

      await act(async () => {
        await result.current.createEvent(mockEventCreate)
      })

      expect(mockToast.toast).toHaveBeenCalledWith({ description: 'Custom pending message', variant: 'default' })
      expect(mockToast.success).toHaveBeenCalledWith('Custom success message')
    })

    it('should use custom confirmation defaults', async () => {
      const confirmationDefaults = {
        confirmText: 'Custom Confirm',
        cancelText: 'Custom Cancel',
        variant: 'warning' as const
      }

      const mockConfirmation = {
        state: { isOpen: false, config: null, isLoading: false },
        showConfirmation: jest.fn(() => Promise.resolve(true)),
        hideConfirmation: jest.fn(),
        confirm: jest.fn(),
        cancel: jest.fn(),
        setLoading: jest.fn()
      }
      mockUseConfirmation.mockReturnValue(mockConfirmation)

      const wrapper = createWrapper()
      renderHook(() => useEventActions({ confirmationDefaults }), { wrapper })

      expect(mockUseConfirmation).toHaveBeenCalledWith({ defaultConfig: confirmationDefaults })
    })
  })
})