'use client'

import { useCallback, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { OptimisticUpdate } from '@/types/actions.types'

export interface UseOptimisticUpdateOptions {
  onError?: (error: Error, update: OptimisticUpdate) => void
  onRollback?: (update: OptimisticUpdate) => void
}

export interface UseOptimisticUpdateReturn {
  applyOptimisticUpdate: <T>(
    queryKey: unknown[],
    updater: (oldData: T | undefined) => T,
    rollbackData?: T
  ) => string
  rollbackUpdate: (updateId: string) => void
  rollbackAll: () => void
  getPendingUpdates: () => OptimisticUpdate[]
}

export function useOptimisticUpdate(
  options: UseOptimisticUpdateOptions = {}
): UseOptimisticUpdateReturn {
  const queryClient = useQueryClient()
  const pendingUpdatesRef = useRef<Map<string, OptimisticUpdate>>(new Map())
  const { onError, onRollback } = options

  const applyOptimisticUpdate = useCallback(
    <T>(
      queryKey: unknown[],
      updater: (oldData: T | undefined) => T,
      rollbackData?: T
    ): string => {
      const updateId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

      try {
        // Get current data
        const previousData = queryClient.getQueryData<T>(queryKey)

        // Apply optimistic update
        const newData = updater(previousData)
        queryClient.setQueryData(queryKey, newData)

        // Store update for potential rollback
        const update: OptimisticUpdate = {
          id: updateId,
          queryKey,
          previousData: rollbackData ?? previousData,
          newData,
          timestamp: Date.now()
        }

        pendingUpdatesRef.current.set(updateId, update)

        return updateId
      } catch (error) {
        const update: OptimisticUpdate = {
          id: updateId,
          queryKey,
          previousData: rollbackData,
          newData: undefined,
          timestamp: Date.now()
        }

        if (onError) {
          onError(error as Error, update)
        }

        throw error
      }
    },
    [queryClient, onError]
  )

  const rollbackUpdate = useCallback(
    (updateId: string) => {
      const update = pendingUpdatesRef.current.get(updateId)
      if (!update) {
        console.warn(`No optimistic update found with id: ${updateId}`)
        return
      }

      try {
        // Restore previous data
        queryClient.setQueryData(update.queryKey, update.previousData)

        // Remove from pending updates
        pendingUpdatesRef.current.delete(updateId)

        if (onRollback) {
          onRollback(update)
        }
      } catch (error) {
        console.error('Failed to rollback optimistic update:', error)
      }
    },
    [queryClient, onRollback]
  )

  const rollbackAll = useCallback(() => {
    const updates = Array.from(pendingUpdatesRef.current.values())

    updates.forEach(update => {
      try {
        queryClient.setQueryData(update.queryKey, update.previousData)
        if (onRollback) {
          onRollback(update)
        }
      } catch (error) {
        console.error('Failed to rollback optimistic update:', error)
      }
    })

    pendingUpdatesRef.current.clear()
  }, [queryClient, onRollback])

  const getPendingUpdates = useCallback(() => {
    return Array.from(pendingUpdatesRef.current.values())
  }, [])

  return {
    applyOptimisticUpdate,
    rollbackUpdate,
    rollbackAll,
    getPendingUpdates
  }
}