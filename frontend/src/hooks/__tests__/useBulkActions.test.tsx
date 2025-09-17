/**
 * Tests for useBulkActions hook
 */

import { renderHook, act } from '@testing-library/react'
import { useBulkActions } from '../useBulkActions'

describe('useBulkActions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('initial state', () => {
    it('should initialize with empty selection', () => {
      const { result } = renderHook(() => useBulkActions())

      expect(result.current.selection.selectedIds.size).toBe(0)
      expect(result.current.selection.isSelectAll).toBe(false)
      expect(result.current.selection.totalCount).toBe(0)
      expect(result.current.selectedIds).toEqual([])
      expect(result.current.selectedCount).toBe(0)
      expect(result.current.hasSelection).toBe(false)
      expect(result.current.isAllSelected).toBe(false)
      expect(result.current.isPartiallySelected).toBe(false)
    })

    it('should initialize with provided totalCount', () => {
      const { result } = renderHook(() => useBulkActions({ totalCount: 10 }))

      expect(result.current.selection.totalCount).toBe(10)
    })

    it('should initialize with initial selection', () => {
      const initialSelection = ['id-1', 'id-2']
      const { result } = renderHook(() => useBulkActions({
        initialSelection,
        totalCount: 5
      }))

      expect(result.current.selectedIds).toEqual(initialSelection)
      expect(result.current.selectedCount).toBe(2)
      expect(result.current.hasSelection).toBe(true)
      expect(result.current.isAllSelected).toBe(false)
      expect(result.current.isPartiallySelected).toBe(true)
    })

    it('should call onSelectionChange with initial selection', () => {
      const onSelectionChange = jest.fn()
      const initialSelection = ['id-1', 'id-2']

      renderHook(() => useBulkActions({
        initialSelection,
        totalCount: 5,
        onSelectionChange
      }))

      expect(onSelectionChange).toHaveBeenCalledWith({
        selectedIds: new Set(initialSelection),
        isSelectAll: false,
        totalCount: 5
      })
    })
  })

  describe('selectItem', () => {
    it('should select a single item', () => {
      const { result } = renderHook(() => useBulkActions({ totalCount: 5 }))

      act(() => {
        result.current.selectItem('id-1')
      })

      expect(result.current.selectedIds).toEqual(['id-1'])
      expect(result.current.selectedCount).toBe(1)
      expect(result.current.hasSelection).toBe(true)
      expect(result.current.isSelected('id-1')).toBe(true)
      expect(result.current.isSelected('id-2')).toBe(false)
    })

    it('should not duplicate items when selecting twice', () => {
      const { result } = renderHook(() => useBulkActions({ totalCount: 5 }))

      act(() => {
        result.current.selectItem('id-1')
        result.current.selectItem('id-1')
      })

      expect(result.current.selectedIds).toEqual(['id-1'])
      expect(result.current.selectedCount).toBe(1)
    })

    it('should clear selectAll flag when selecting individual item', () => {
      const { result } = renderHook(() => useBulkActions({ totalCount: 5 }))

      act(() => {
        result.current.selectAll()
      })

      expect(result.current.selection.isSelectAll).toBe(true)

      act(() => {
        result.current.selectItem('id-1')
      })

      expect(result.current.selection.isSelectAll).toBe(false)
    })

    it('should call onSelectionChange callback', () => {
      const onSelectionChange = jest.fn()
      const { result } = renderHook(() => useBulkActions({
        totalCount: 5,
        onSelectionChange
      }))

      act(() => {
        result.current.selectItem('id-1')
      })

      expect(onSelectionChange).toHaveBeenCalledWith({
        selectedIds: new Set(['id-1']),
        isSelectAll: false,
        totalCount: 5
      })
    })
  })

  describe('deselectItem', () => {
    it('should deselect a selected item', () => {
      const { result } = renderHook(() => useBulkActions({
        initialSelection: ['id-1', 'id-2'],
        totalCount: 5
      }))

      act(() => {
        result.current.deselectItem('id-1')
      })

      expect(result.current.selectedIds).toEqual(['id-2'])
      expect(result.current.selectedCount).toBe(1)
      expect(result.current.isSelected('id-1')).toBe(false)
      expect(result.current.isSelected('id-2')).toBe(true)
    })

    it('should handle deselecting non-selected item', () => {
      const { result } = renderHook(() => useBulkActions({
        initialSelection: ['id-1'],
        totalCount: 5
      }))

      act(() => {
        result.current.deselectItem('id-2')
      })

      expect(result.current.selectedIds).toEqual(['id-1'])
      expect(result.current.selectedCount).toBe(1)
    })

    it('should clear selectAll flag when deselecting item', () => {
      const { result } = renderHook(() => useBulkActions({ totalCount: 5 }))

      act(() => {
        result.current.selectAll()
      })

      expect(result.current.selection.isSelectAll).toBe(true)

      act(() => {
        result.current.deselectItem('id-1')
      })

      expect(result.current.selection.isSelectAll).toBe(false)
    })
  })

  describe('toggleItem', () => {
    it('should select unselected item', () => {
      const { result } = renderHook(() => useBulkActions({ totalCount: 5 }))

      act(() => {
        result.current.toggleItem('id-1')
      })

      expect(result.current.selectedIds).toEqual(['id-1'])
      expect(result.current.isSelected('id-1')).toBe(true)
    })

    it('should deselect selected item', () => {
      const { result } = renderHook(() => useBulkActions({
        initialSelection: ['id-1'],
        totalCount: 5
      }))

      act(() => {
        result.current.toggleItem('id-1')
      })

      expect(result.current.selectedIds).toEqual([])
      expect(result.current.isSelected('id-1')).toBe(false)
    })

    it('should clear selectAll flag when toggling', () => {
      const { result } = renderHook(() => useBulkActions({ totalCount: 5 }))

      act(() => {
        result.current.selectAll()
      })

      expect(result.current.selection.isSelectAll).toBe(true)

      act(() => {
        result.current.toggleItem('id-1')
      })

      expect(result.current.selection.isSelectAll).toBe(false)
    })
  })

  describe('selectAll', () => {
    it('should set selectAll flag and clear individual selections', () => {
      const { result } = renderHook(() => useBulkActions({
        initialSelection: ['id-1', 'id-2'],
        totalCount: 5
      }))

      act(() => {
        result.current.selectAll()
      })

      expect(result.current.selection.isSelectAll).toBe(true)
      expect(result.current.selection.selectedIds.size).toBe(0)
      expect(result.current.isAllSelected).toBe(true)
    })

    it('should indicate all items are selected when selectAll is true', () => {
      const { result } = renderHook(() => useBulkActions({ totalCount: 5 }))

      act(() => {
        result.current.selectAll()
      })

      expect(result.current.isSelected('id-1')).toBe(true)
      expect(result.current.isSelected('id-2')).toBe(true)
      expect(result.current.isSelected('any-id')).toBe(true)
    })
  })

  describe('deselectAll', () => {
    it('should clear all selections', () => {
      const { result } = renderHook(() => useBulkActions({
        initialSelection: ['id-1', 'id-2'],
        totalCount: 5
      }))

      act(() => {
        result.current.deselectAll()
      })

      expect(result.current.selectedIds).toEqual([])
      expect(result.current.selectedCount).toBe(0)
      expect(result.current.hasSelection).toBe(false)
      expect(result.current.isAllSelected).toBe(false)
      expect(result.current.selection.isSelectAll).toBe(false)
    })

    it('should clear selectAll flag', () => {
      const { result } = renderHook(() => useBulkActions({ totalCount: 5 }))

      act(() => {
        result.current.selectAll()
      })

      expect(result.current.selection.isSelectAll).toBe(true)

      act(() => {
        result.current.deselectAll()
      })

      expect(result.current.selection.isSelectAll).toBe(false)
    })
  })

  describe('selectMultiple', () => {
    it('should select multiple items at once', () => {
      const { result } = renderHook(() => useBulkActions({ totalCount: 5 }))

      act(() => {
        result.current.selectMultiple(['id-1', 'id-2', 'id-3'])
      })

      expect(result.current.selectedIds).toEqual(['id-1', 'id-2', 'id-3'])
      expect(result.current.selectedCount).toBe(3)
      expect(result.current.isPartiallySelected).toBe(true)
    })

    it('should add to existing selection', () => {
      const { result } = renderHook(() => useBulkActions({
        initialSelection: ['id-1'],
        totalCount: 5
      }))

      act(() => {
        result.current.selectMultiple(['id-2', 'id-3'])
      })

      expect(result.current.selectedIds).toContain('id-1')
      expect(result.current.selectedIds).toContain('id-2')
      expect(result.current.selectedIds).toContain('id-3')
      expect(result.current.selectedCount).toBe(3)
    })

    it('should not duplicate existing items', () => {
      const { result } = renderHook(() => useBulkActions({
        initialSelection: ['id-1'],
        totalCount: 5
      }))

      act(() => {
        result.current.selectMultiple(['id-1', 'id-2'])
      })

      expect(result.current.selectedCount).toBe(2)
    })
  })

  describe('deselectMultiple', () => {
    it('should deselect multiple items at once', () => {
      const { result } = renderHook(() => useBulkActions({
        initialSelection: ['id-1', 'id-2', 'id-3', 'id-4'],
        totalCount: 5
      }))

      act(() => {
        result.current.deselectMultiple(['id-2', 'id-3'])
      })

      expect(result.current.selectedIds).toEqual(['id-1', 'id-4'])
      expect(result.current.selectedCount).toBe(2)
    })

    it('should handle deselecting non-selected items', () => {
      const { result } = renderHook(() => useBulkActions({
        initialSelection: ['id-1'],
        totalCount: 5
      }))

      act(() => {
        result.current.deselectMultiple(['id-2', 'id-3'])
      })

      expect(result.current.selectedIds).toEqual(['id-1'])
      expect(result.current.selectedCount).toBe(1)
    })
  })

  describe('computed properties', () => {
    it('should correctly calculate isAllSelected', () => {
      const { result } = renderHook(() => useBulkActions({ totalCount: 3 }))

      expect(result.current.isAllSelected).toBe(false)

      act(() => {
        result.current.selectMultiple(['id-1', 'id-2', 'id-3'])
      })

      expect(result.current.isAllSelected).toBe(true)

      act(() => {
        result.current.selectAll()
      })

      expect(result.current.isAllSelected).toBe(true)
    })

    it('should correctly calculate isPartiallySelected', () => {
      const { result } = renderHook(() => useBulkActions({ totalCount: 5 }))

      expect(result.current.isPartiallySelected).toBe(false)

      act(() => {
        result.current.selectItem('id-1')
      })

      expect(result.current.isPartiallySelected).toBe(true)

      act(() => {
        result.current.selectMultiple(['id-2', 'id-3', 'id-4', 'id-5'])
      })

      expect(result.current.isPartiallySelected).toBe(false)
      expect(result.current.isAllSelected).toBe(true)
    })

    it('should correctly calculate hasSelection', () => {
      const { result } = renderHook(() => useBulkActions({ totalCount: 5 }))

      expect(result.current.hasSelection).toBe(false)

      act(() => {
        result.current.selectItem('id-1')
      })

      expect(result.current.hasSelection).toBe(true)

      act(() => {
        result.current.deselectAll()
      })

      expect(result.current.hasSelection).toBe(false)
    })
  })

  describe('resetSelection', () => {
    it('should reset selection to initial state', () => {
      const { result } = renderHook(() => useBulkActions({
        initialSelection: ['id-1', 'id-2'],
        totalCount: 5
      }))

      act(() => {
        result.current.selectAll()
      })

      expect(result.current.selection.isSelectAll).toBe(true)

      act(() => {
        result.current.resetSelection()
      })

      expect(result.current.selectedIds).toEqual([])
      expect(result.current.selectedCount).toBe(0)
      expect(result.current.hasSelection).toBe(false)
      expect(result.current.selection.isSelectAll).toBe(false)
    })
  })

  describe('setTotalCount', () => {
    it('should update total count', () => {
      const { result } = renderHook(() => useBulkActions({ totalCount: 5 }))

      expect(result.current.selection.totalCount).toBe(5)

      act(() => {
        result.current.setTotalCount(10)
      })

      expect(result.current.selection.totalCount).toBe(10)
    })

    it('should affect isAllSelected calculation', () => {
      const { result } = renderHook(() => useBulkActions({ totalCount: 2 }))

      act(() => {
        result.current.selectMultiple(['id-1', 'id-2'])
      })

      expect(result.current.isAllSelected).toBe(true)

      act(() => {
        result.current.setTotalCount(3)
      })

      expect(result.current.isAllSelected).toBe(false)
      expect(result.current.isPartiallySelected).toBe(true)
    })
  })

  describe('onSelectionChange callback', () => {
    it('should be called on every selection change', () => {
      const onSelectionChange = jest.fn()
      const { result } = renderHook(() => useBulkActions({
        totalCount: 5,
        onSelectionChange
      }))

      // Clear initial call
      onSelectionChange.mockClear()

      act(() => {
        result.current.selectItem('id-1')
      })

      expect(onSelectionChange).toHaveBeenCalledTimes(1)
      expect(onSelectionChange).toHaveBeenCalledWith({
        selectedIds: new Set(['id-1']),
        isSelectAll: false,
        totalCount: 5
      })

      act(() => {
        result.current.selectAll()
      })

      expect(onSelectionChange).toHaveBeenCalledTimes(2)
      expect(onSelectionChange).toHaveBeenCalledWith({
        selectedIds: new Set(),
        isSelectAll: true,
        totalCount: 5
      })
    })

    it('should not be called when callback is not provided', () => {
      const { result } = renderHook(() => useBulkActions({ totalCount: 5 }))

      // Should not throw
      act(() => {
        result.current.selectItem('id-1')
      })

      expect(result.current.selectedCount).toBe(1)
    })
  })

  describe('edge cases', () => {
    it('should handle empty arrays in selectMultiple', () => {
      const { result } = renderHook(() => useBulkActions({ totalCount: 5 }))

      act(() => {
        result.current.selectMultiple([])
      })

      expect(result.current.selectedCount).toBe(0)
    })

    it('should handle empty arrays in deselectMultiple', () => {
      const { result } = renderHook(() => useBulkActions({
        initialSelection: ['id-1'],
        totalCount: 5
      }))

      act(() => {
        result.current.deselectMultiple([])
      })

      expect(result.current.selectedIds).toEqual(['id-1'])
    })

    it('should handle zero totalCount', () => {
      const { result } = renderHook(() => useBulkActions({ totalCount: 0 }))

      expect(result.current.isAllSelected).toBe(false)

      act(() => {
        result.current.selectItem('id-1')
      })

      expect(result.current.isAllSelected).toBe(false)
    })

    it('should handle negative totalCount', () => {
      const { result } = renderHook(() => useBulkActions({ totalCount: -1 }))

      act(() => {
        result.current.selectItem('id-1')
      })

      expect(result.current.isAllSelected).toBe(false)
      expect(result.current.hasSelection).toBe(true)
    })
  })
})