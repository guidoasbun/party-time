/**
 * Tests for useOptimisticUpdate hook
 */

import { renderHook, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import { useOptimisticUpdate } from '../useOptimisticUpdate'

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

interface TestData {
  id: string
  name: string
  count: number
}

const mockData: TestData = {
  id: 'test-1',
  name: 'Test Item',
  count: 0
}

describe('useOptimisticUpdate', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('applyOptimisticUpdate', () => {
    it('should apply optimistic update and return update ID', () => {
      const wrapper = createWrapper()
      const { result } = renderHook(() => useOptimisticUpdate(), { wrapper })

      let updateId: string = ''

      act(() => {
        updateId = result.current.applyOptimisticUpdate<TestData>(
          ['test', 'data'],
          (oldData) => {
            if (!oldData) return mockData
            return { ...oldData, count: oldData.count + 1 }
          }
        )
      })

      expect(updateId).toBeTruthy()
      expect(typeof updateId).toBe('string')
    })

    it('should store previous data for rollback', () => {
      const wrapper = createWrapper()
      const { result } = renderHook(() => useOptimisticUpdate(), { wrapper })

      // Set initial data in query cache
      const queryClient = new QueryClient()
      queryClient.setQueryData(['test', 'data'], mockData)

      let updateId: string = ''

      act(() => {
        updateId = result.current.applyOptimisticUpdate<TestData>(
          ['test', 'data'],
          (oldData) => {
            if (!oldData) return mockData
            return { ...oldData, count: oldData.count + 1 }
          }
        )
      })

      const pendingUpdates = result.current.getPendingUpdates()
      expect(pendingUpdates).toHaveLength(1)
      expect(pendingUpdates[0].id).toBe(updateId)
    })

    it('should handle custom rollback data', () => {
      const wrapper = createWrapper()
      const { result } = renderHook(() => useOptimisticUpdate(), { wrapper })

      const customRollbackData = { id: 'custom', name: 'Custom', count: 99 }

      let updateId: string = ''

      act(() => {
        updateId = result.current.applyOptimisticUpdate<TestData>(
          ['test', 'data'],
          () => ({ ...mockData, count: 10 }),
          customRollbackData
        )
      })

      const pendingUpdates = result.current.getPendingUpdates()
      expect(pendingUpdates[0].previousData).toEqual(customRollbackData)
    })

    it('should call onError callback when updater throws', () => {
      const onError = jest.fn()

      const wrapper = createWrapper()
      const { result } = renderHook(() => useOptimisticUpdate({ onError }), { wrapper })

      expect(() => {
        act(() => {
          result.current.applyOptimisticUpdate<TestData>(
            ['test', 'data'],
            () => {
              throw new Error('Update failed')
            }
          )
        })
      }).toThrow('Update failed')

      expect(onError).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          queryKey: ['test', 'data']
        })
      )
    })
  })

  describe('rollbackUpdate', () => {
    it('should rollback a specific update', () => {
      const wrapper = createWrapper()
      const { result } = renderHook(() => useOptimisticUpdate(), { wrapper })

      let updateId: string = ''

      // Apply optimistic update
      act(() => {
        updateId = result.current.applyOptimisticUpdate<TestData>(
          ['test', 'data'],
          () => ({ ...mockData, count: 10 })
        )
      })

      expect(result.current.getPendingUpdates()).toHaveLength(1)

      // Rollback the update
      act(() => {
        result.current.rollbackUpdate(updateId)
      })

      expect(result.current.getPendingUpdates()).toHaveLength(0)
    })

    it('should warn when rolling back non-existent update', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation()

      const wrapper = createWrapper()
      const { result } = renderHook(() => useOptimisticUpdate(), { wrapper })

      act(() => {
        result.current.rollbackUpdate('non-existent-id')
      })

      expect(consoleSpy).toHaveBeenCalledWith('No optimistic update found with id: non-existent-id')

      consoleSpy.mockRestore()
    })

    it('should call onRollback callback', () => {
      const onRollback = jest.fn()

      const wrapper = createWrapper()
      const { result } = renderHook(() => useOptimisticUpdate({ onRollback }), { wrapper })

      let updateId: string = ''

      // Apply optimistic update
      act(() => {
        updateId = result.current.applyOptimisticUpdate<TestData>(
          ['test', 'data'],
          () => ({ ...mockData, count: 10 })
        )
      })

      // Rollback the update
      act(() => {
        result.current.rollbackUpdate(updateId)
      })

      expect(onRollback).toHaveBeenCalledWith(
        expect.objectContaining({
          id: updateId,
          queryKey: ['test', 'data']
        })
      )
    })

    it('should handle rollback errors gracefully', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()

      const wrapper = createWrapper()
      const { result } = renderHook(() => useOptimisticUpdate(), { wrapper })

      let updateId: string = ''

      // Apply optimistic update
      act(() => {
        updateId = result.current.applyOptimisticUpdate<TestData>(
          ['test', 'data'],
          () => ({ ...mockData, count: 10 })
        )
      })

      // Mock QueryClient.setQueryData to throw
      const originalError = console.error
      console.error = jest.fn()

      act(() => {
        result.current.rollbackUpdate(updateId)
      })

      consoleErrorSpy.mockRestore()
    })
  })

  describe('rollbackAll', () => {
    it('should rollback all pending updates', () => {
      const wrapper = createWrapper()
      const { result } = renderHook(() => useOptimisticUpdate(), { wrapper })

      // Apply multiple optimistic updates
      act(() => {
        result.current.applyOptimisticUpdate<TestData>(['test', 'data1'], () => mockData)
        result.current.applyOptimisticUpdate<TestData>(['test', 'data2'], () => mockData)
        result.current.applyOptimisticUpdate<TestData>(['test', 'data3'], () => mockData)
      })

      expect(result.current.getPendingUpdates()).toHaveLength(3)

      // Rollback all updates
      act(() => {
        result.current.rollbackAll()
      })

      expect(result.current.getPendingUpdates()).toHaveLength(0)
    })

    it('should call onRollback for each update', () => {
      const onRollback = jest.fn()

      const wrapper = createWrapper()
      const { result } = renderHook(() => useOptimisticUpdate({ onRollback }), { wrapper })

      // Apply multiple optimistic updates
      act(() => {
        result.current.applyOptimisticUpdate<TestData>(['test', 'data1'], () => mockData)
        result.current.applyOptimisticUpdate<TestData>(['test', 'data2'], () => mockData)
      })

      // Rollback all updates
      act(() => {
        result.current.rollbackAll()
      })

      expect(onRollback).toHaveBeenCalledTimes(2)
    })

    it('should handle rollback errors for individual updates', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()

      const wrapper = createWrapper()
      const { result } = renderHook(() => useOptimisticUpdate(), { wrapper })

      // Apply multiple optimistic updates
      act(() => {
        result.current.applyOptimisticUpdate<TestData>(['test', 'data1'], () => mockData)
        result.current.applyOptimisticUpdate<TestData>(['test', 'data2'], () => mockData)
      })

      // Rollback all updates (some may fail)
      act(() => {
        result.current.rollbackAll()
      })

      // Should clear all updates even if some fail
      expect(result.current.getPendingUpdates()).toHaveLength(0)

      consoleErrorSpy.mockRestore()
    })
  })

  describe('getPendingUpdates', () => {
    it('should return empty array initially', () => {
      const wrapper = createWrapper()
      const { result } = renderHook(() => useOptimisticUpdate(), { wrapper })

      expect(result.current.getPendingUpdates()).toEqual([])
    })

    it('should return all pending updates', () => {
      const wrapper = createWrapper()
      const { result } = renderHook(() => useOptimisticUpdate(), { wrapper })

      // Apply multiple updates
      act(() => {
        result.current.applyOptimisticUpdate<TestData>(['test', 'data1'], () => mockData)
        result.current.applyOptimisticUpdate<TestData>(['test', 'data2'], () => mockData)
      })

      const pendingUpdates = result.current.getPendingUpdates()
      expect(pendingUpdates).toHaveLength(2)
      expect(pendingUpdates[0]).toMatchObject({
        queryKey: ['test', 'data1'],
        newData: mockData
      })
      expect(pendingUpdates[1]).toMatchObject({
        queryKey: ['test', 'data2'],
        newData: mockData
      })
    })

    it('should include timestamp in updates', () => {
      const wrapper = createWrapper()
      const { result } = renderHook(() => useOptimisticUpdate(), { wrapper })

      const beforeTime = Date.now()

      act(() => {
        result.current.applyOptimisticUpdate<TestData>(['test', 'data'], () => mockData)
      })

      const afterTime = Date.now()
      const pendingUpdates = result.current.getPendingUpdates()

      expect(pendingUpdates[0].timestamp).toBeGreaterThanOrEqual(beforeTime)
      expect(pendingUpdates[0].timestamp).toBeLessThanOrEqual(afterTime)
    })
  })

  describe('multiple updates on same query', () => {
    it('should track multiple updates on the same query key', () => {
      const wrapper = createWrapper()
      const { result } = renderHook(() => useOptimisticUpdate(), { wrapper })

      // Apply multiple updates to same query
      act(() => {
        result.current.applyOptimisticUpdate<TestData>(
          ['test', 'data'],
          (oldData) => ({ ...mockData, count: 1 })
        )
        result.current.applyOptimisticUpdate<TestData>(
          ['test', 'data'],
          (oldData) => ({ ...mockData, count: 2 })
        )
      })

      const pendingUpdates = result.current.getPendingUpdates()
      expect(pendingUpdates).toHaveLength(2)
      expect(pendingUpdates.every(update =>
        JSON.stringify(update.queryKey) === JSON.stringify(['test', 'data'])
      )).toBe(true)
    })

    it('should rollback individual updates independently', () => {
      const wrapper = createWrapper()
      const { result } = renderHook(() => useOptimisticUpdate(), { wrapper })

      let firstUpdateId: string = ''
      let secondUpdateId: string = ''

      // Apply multiple updates to same query
      act(() => {
        firstUpdateId = result.current.applyOptimisticUpdate<TestData>(
          ['test', 'data'],
          () => ({ ...mockData, count: 1 })
        )
        secondUpdateId = result.current.applyOptimisticUpdate<TestData>(
          ['test', 'data'],
          () => ({ ...mockData, count: 2 })
        )
      })

      expect(result.current.getPendingUpdates()).toHaveLength(2)

      // Rollback only the first update
      act(() => {
        result.current.rollbackUpdate(firstUpdateId)
      })

      const remainingUpdates = result.current.getPendingUpdates()
      expect(remainingUpdates).toHaveLength(1)
      expect(remainingUpdates[0].id).toBe(secondUpdateId)
    })
  })
})