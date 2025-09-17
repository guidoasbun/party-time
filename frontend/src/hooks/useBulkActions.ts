'use client'

import { useState, useCallback, useMemo, useEffect } from 'react'
import { UUID } from '@/types/common.types'
import { BulkSelectionState } from '@/types/actions.types'

export interface UseBulkActionsOptions {
  totalCount?: number
  onSelectionChange?: (selection: BulkSelectionState) => void
  initialSelection?: UUID[]
}

export interface UseBulkActionsReturn {
  selection: BulkSelectionState
  selectedIds: UUID[]
  selectedCount: number
  hasSelection: boolean
  isAllSelected: boolean
  isPartiallySelected: boolean

  // Selection actions
  selectItem: (id: UUID) => void
  deselectItem: (id: UUID) => void
  toggleItem: (id: UUID) => void
  selectAll: () => void
  deselectAll: () => void
  selectMultiple: (ids: UUID[]) => void
  deselectMultiple: (ids: UUID[]) => void

  // Utilities
  isSelected: (id: UUID) => boolean
  resetSelection: () => void
  setTotalCount: (count: number) => void
}

export function useBulkActions(
  options: UseBulkActionsOptions = {}
): UseBulkActionsReturn {
  const { totalCount = 0, onSelectionChange, initialSelection = [] } = options

  const [selection, setSelection] = useState<BulkSelectionState>(() => ({
    selectedIds: new Set(initialSelection),
    isSelectAll: false,
    totalCount
  }))

  // Derived values
  const selectedIds = useMemo(() => Array.from(selection.selectedIds), [selection.selectedIds])
  const selectedCount = selection.selectedIds.size
  const hasSelection = selectedCount > 0
  const isAllSelected = selection.isSelectAll || (selection.totalCount > 0 && selectedCount === selection.totalCount)
  const isPartiallySelected = hasSelection && !isAllSelected

  // Update selection and notify
  const updateSelection = useCallback(
    (updater: (prev: BulkSelectionState) => BulkSelectionState) => {
      setSelection(prev => {
        const newSelection = updater(prev)
        if (onSelectionChange) {
          onSelectionChange(newSelection)
        }
        return newSelection
      })
    },
    [onSelectionChange]
  )

  const selectItem = useCallback(
    (id: UUID) => {
      updateSelection(prev => ({
        ...prev,
        selectedIds: new Set([...prev.selectedIds, id]),
        isSelectAll: false
      }))
    },
    [updateSelection]
  )

  const deselectItem = useCallback(
    (id: UUID) => {
      updateSelection(prev => {
        const newSelectedIds = new Set(prev.selectedIds)
        newSelectedIds.delete(id)
        return {
          ...prev,
          selectedIds: newSelectedIds,
          isSelectAll: false
        }
      })
    },
    [updateSelection]
  )

  const toggleItem = useCallback(
    (id: UUID) => {
      updateSelection(prev => {
        const newSelectedIds = new Set(prev.selectedIds)
        if (newSelectedIds.has(id)) {
          newSelectedIds.delete(id)
        } else {
          newSelectedIds.add(id)
        }
        return {
          ...prev,
          selectedIds: newSelectedIds,
          isSelectAll: false
        }
      })
    },
    [updateSelection]
  )

  const selectAll = useCallback(() => {
    updateSelection(prev => ({
      ...prev,
      selectedIds: new Set(),
      isSelectAll: true
    }))
  }, [updateSelection])

  const deselectAll = useCallback(() => {
    updateSelection(prev => ({
      ...prev,
      selectedIds: new Set(),
      isSelectAll: false
    }))
  }, [updateSelection])

  const selectMultiple = useCallback(
    (ids: UUID[]) => {
      updateSelection(prev => ({
        ...prev,
        selectedIds: new Set([...prev.selectedIds, ...ids]),
        isSelectAll: false
      }))
    },
    [updateSelection]
  )

  const deselectMultiple = useCallback(
    (ids: UUID[]) => {
      updateSelection(prev => {
        const newSelectedIds = new Set(prev.selectedIds)
        ids.forEach(id => newSelectedIds.delete(id))
        return {
          ...prev,
          selectedIds: newSelectedIds,
          isSelectAll: false
        }
      })
    },
    [updateSelection]
  )

  const isSelected = useCallback(
    (id: UUID) => {
      return selection.isSelectAll || selection.selectedIds.has(id)
    },
    [selection.isSelectAll, selection.selectedIds]
  )

  const resetSelection = useCallback(() => {
    updateSelection(prev => ({
      ...prev,
      selectedIds: new Set(),
      isSelectAll: false
    }))
  }, [updateSelection])

  const setTotalCount = useCallback(
    (count: number) => {
      updateSelection(prev => ({
        ...prev,
        totalCount: count
      }))
    },
    [updateSelection]
  )

  // Call onSelectionChange for initial selection if provided
  useEffect(() => {
    if (onSelectionChange && initialSelection.length > 0) {
      onSelectionChange(selection)
    }
  }, []) // Only run on mount

  return {
    selection,
    selectedIds,
    selectedCount,
    hasSelection,
    isAllSelected,
    isPartiallySelected,

    // Selection actions
    selectItem,
    deselectItem,
    toggleItem,
    selectAll,
    deselectAll,
    selectMultiple,
    deselectMultiple,

    // Utilities
    isSelected,
    resetSelection,
    setTotalCount
  }
}