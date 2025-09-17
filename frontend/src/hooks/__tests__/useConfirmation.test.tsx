/**
 * Tests for useConfirmation hook
 */

import { renderHook, act, waitFor } from '@testing-library/react'
import { useConfirmation } from '../useConfirmation'
import { ConfirmationConfig } from '@/types/actions.types'

describe('useConfirmation', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('initial state', () => {
    it('should initialize with closed state', () => {
      const { result } = renderHook(() => useConfirmation())

      expect(result.current.state.isOpen).toBe(false)
      expect(result.current.state.config).toBe(null)
      expect(result.current.state.isLoading).toBe(false)
    })
  })

  describe('showConfirmation', () => {
    it('should open confirmation dialog with config', async () => {
      const { result } = renderHook(() => useConfirmation())

      const config: ConfirmationConfig = {
        title: 'Test Confirmation',
        description: 'Are you sure?',
        confirmText: 'Yes',
        cancelText: 'No'
      }

      act(() => {
        result.current.showConfirmation(config)
      })

      expect(result.current.state.isOpen).toBe(true)
      expect(result.current.state.config).toEqual({
        ...config,
        variant: 'default',
        icon: undefined
      })
      expect(result.current.state.isLoading).toBe(false)
    })

    it('should merge with default config', async () => {
      const defaultConfig = {
        confirmText: 'Default Confirm',
        variant: 'warning' as const
      }

      const { result } = renderHook(() => useConfirmation({ defaultConfig }))

      const config: ConfirmationConfig = {
        title: 'Test Title',
        description: 'Test Description'
      }

      act(() => {
        result.current.showConfirmation(config)
      })

      expect(result.current.state.config).toEqual({
        title: 'Test Title',
        description: 'Test Description',
        confirmText: 'Default Confirm',
        cancelText: 'Cancel',
        variant: 'warning'
      })
    })

    it('should override default config with provided config', async () => {
      const defaultConfig = {
        confirmText: 'Default Confirm',
        variant: 'warning' as const
      }

      const { result } = renderHook(() => useConfirmation({ defaultConfig }))

      const config: ConfirmationConfig = {
        title: 'Test Title',
        description: 'Test Description',
        confirmText: 'Custom Confirm',
        variant: 'destructive' as const
      }

      act(() => {
        result.current.showConfirmation(config)
      })

      expect(result.current.state.config).toEqual({
        title: 'Test Title',
        description: 'Test Description',
        confirmText: 'Custom Confirm',
        cancelText: 'Cancel',
        variant: 'destructive'
      })
    })

    it('should return a promise that resolves when confirmed', async () => {
      const { result } = renderHook(() => useConfirmation())

      const config: ConfirmationConfig = {
        title: 'Test',
        description: 'Test'
      }

      let promiseResult: boolean | undefined

      act(() => {
        result.current.showConfirmation(config).then(value => {
          promiseResult = value
        })
      })

      // Confirm the dialog
      await act(async () => {
        await result.current.confirm()
      })

      await waitFor(() => {
        expect(promiseResult).toBe(true)
      })
    })

    it('should return a promise that resolves when cancelled', async () => {
      const { result } = renderHook(() => useConfirmation())

      const config: ConfirmationConfig = {
        title: 'Test',
        description: 'Test'
      }

      let promiseResult: boolean | undefined

      act(() => {
        result.current.showConfirmation(config).then(value => {
          promiseResult = value
        })
      })

      // Cancel the dialog
      act(() => {
        result.current.cancel()
      })

      await waitFor(() => {
        expect(promiseResult).toBe(false)
      })
    })
  })

  describe('hideConfirmation', () => {
    it('should close confirmation dialog', () => {
      const { result } = renderHook(() => useConfirmation())

      const config: ConfirmationConfig = {
        title: 'Test',
        description: 'Test'
      }

      // Open dialog
      act(() => {
        result.current.showConfirmation(config)
      })

      expect(result.current.state.isOpen).toBe(true)

      // Close dialog
      act(() => {
        result.current.hideConfirmation()
      })

      expect(result.current.state.isOpen).toBe(false)
      expect(result.current.state.isLoading).toBe(false)
    })

    it('should call onCancel callback', () => {
      const onCancel = jest.fn()
      const { result } = renderHook(() => useConfirmation({ onCancel }))

      const config: ConfirmationConfig = {
        title: 'Test',
        description: 'Test'
      }

      // Open and close dialog
      act(() => {
        result.current.showConfirmation(config)
      })

      act(() => {
        result.current.hideConfirmation()
      })

      expect(onCancel).toHaveBeenCalled()
    })

    it('should resolve promise with false when hiding', async () => {
      const { result } = renderHook(() => useConfirmation())

      const config: ConfirmationConfig = {
        title: 'Test',
        description: 'Test'
      }

      let promiseResult: boolean | undefined

      act(() => {
        result.current.showConfirmation(config).then(value => {
          promiseResult = value
        })
      })

      act(() => {
        result.current.hideConfirmation()
      })

      await waitFor(() => {
        expect(promiseResult).toBe(false)
      })
    })
  })

  describe('confirm', () => {
    it('should set loading state and close dialog on success', async () => {
      const { result } = renderHook(() => useConfirmation())

      const config: ConfirmationConfig = {
        title: 'Test',
        description: 'Test'
      }

      // Open dialog
      act(() => {
        result.current.showConfirmation(config)
      })

      // Confirm dialog
      await act(async () => {
        await result.current.confirm()
      })

      expect(result.current.state.isOpen).toBe(false)
      expect(result.current.state.isLoading).toBe(false)
    })

    it('should call onConfirm callback', async () => {
      const onConfirm = jest.fn()
      const { result } = renderHook(() => useConfirmation({ onConfirm }))

      const config: ConfirmationConfig = {
        title: 'Test',
        description: 'Test'
      }

      // Open dialog
      act(() => {
        result.current.showConfirmation(config)
      })

      // Confirm dialog
      await act(async () => {
        await result.current.confirm()
      })

      expect(onConfirm).toHaveBeenCalled()
    })

    it('should handle async onConfirm callback', async () => {
      const onConfirm = jest.fn(() => new Promise(resolve => setTimeout(resolve, 100)))
      const { result } = renderHook(() => useConfirmation({ onConfirm }))

      const config: ConfirmationConfig = {
        title: 'Test',
        description: 'Test'
      }

      // Open dialog
      act(() => {
        result.current.showConfirmation(config)
      })

      // Confirm dialog
      const confirmPromise = act(async () => {
        await result.current.confirm()
      })

      await confirmPromise

      expect(onConfirm).toHaveBeenCalled()
      expect(result.current.state.isOpen).toBe(false)
    })

    it('should handle onConfirm callback errors', async () => {
      const onConfirm = jest.fn(() => Promise.reject(new Error('Confirm failed')))
      const { result } = renderHook(() => useConfirmation({ onConfirm }))

      const config: ConfirmationConfig = {
        title: 'Test',
        description: 'Test'
      }

      // Open dialog
      act(() => {
        result.current.showConfirmation(config)
      })

      // Confirm dialog should throw
      await expect(
        act(async () => {
          await result.current.confirm()
        })
      ).rejects.toThrow('Confirm failed')

      expect(result.current.state.isLoading).toBe(false)
      expect(result.current.state.isOpen).toBe(true) // Should remain open on error
    })

    it('should resolve promise with true when confirmed', async () => {
      const { result } = renderHook(() => useConfirmation())

      const config: ConfirmationConfig = {
        title: 'Test',
        description: 'Test'
      }

      let promiseResult: boolean | undefined

      act(() => {
        result.current.showConfirmation(config).then(value => {
          promiseResult = value
        })
      })

      await act(async () => {
        await result.current.confirm()
      })

      await waitFor(() => {
        expect(promiseResult).toBe(true)
      })
    })
  })

  describe('cancel', () => {
    it('should call hideConfirmation', () => {
      const { result } = renderHook(() => useConfirmation())

      const config: ConfirmationConfig = {
        title: 'Test',
        description: 'Test'
      }

      // Open dialog
      act(() => {
        result.current.showConfirmation(config)
      })

      expect(result.current.state.isOpen).toBe(true)

      // Cancel dialog
      act(() => {
        result.current.cancel()
      })

      expect(result.current.state.isOpen).toBe(false)
    })
  })

  describe('setLoading', () => {
    it('should update loading state', () => {
      const { result } = renderHook(() => useConfirmation())

      expect(result.current.state.isLoading).toBe(false)

      act(() => {
        result.current.setLoading(true)
      })

      expect(result.current.state.isLoading).toBe(true)

      act(() => {
        result.current.setLoading(false)
      })

      expect(result.current.state.isLoading).toBe(false)
    })
  })

  describe('multiple confirmations', () => {
    it('should handle multiple sequential confirmations', async () => {
      const { result } = renderHook(() => useConfirmation())

      const config1: ConfirmationConfig = {
        title: 'First Confirmation',
        description: 'First test'
      }

      const config2: ConfirmationConfig = {
        title: 'Second Confirmation',
        description: 'Second test'
      }

      // First confirmation
      let firstResult: boolean | undefined
      act(() => {
        result.current.showConfirmation(config1).then(value => {
          firstResult = value
        })
      })

      await act(async () => {
        await result.current.confirm()
      })

      await waitFor(() => {
        expect(firstResult).toBe(true)
      })

      // Second confirmation
      let secondResult: boolean | undefined
      act(() => {
        result.current.showConfirmation(config2).then(value => {
          secondResult = value
        })
      })

      act(() => {
        result.current.cancel()
      })

      await waitFor(() => {
        expect(secondResult).toBe(false)
      })
    })

    it('should replace previous confirmation when new one is shown', () => {
      const { result } = renderHook(() => useConfirmation())

      const config1: ConfirmationConfig = {
        title: 'First Confirmation',
        description: 'First test'
      }

      const config2: ConfirmationConfig = {
        title: 'Second Confirmation',
        description: 'Second test'
      }

      // Show first confirmation
      act(() => {
        result.current.showConfirmation(config1)
      })

      expect(result.current.state.config?.title).toBe('First Confirmation')

      // Show second confirmation (should replace first)
      act(() => {
        result.current.showConfirmation(config2)
      })

      expect(result.current.state.config?.title).toBe('Second Confirmation')
    })
  })

  describe('edge cases', () => {
    it('should handle confirm when no confirmation is shown', async () => {
      const { result } = renderHook(() => useConfirmation())

      // Try to confirm without showing confirmation first
      await act(async () => {
        await result.current.confirm()
      })

      // Should not throw or cause issues
      expect(result.current.state.isOpen).toBe(false)
    })

    it('should handle cancel when no confirmation is shown', () => {
      const { result } = renderHook(() => useConfirmation())

      // Try to cancel without showing confirmation first
      act(() => {
        result.current.cancel()
      })

      // Should not throw or cause issues
      expect(result.current.state.isOpen).toBe(false)
    })

    it('should handle setLoading when no confirmation is shown', () => {
      const { result } = renderHook(() => useConfirmation())

      // Try to set loading without showing confirmation first
      act(() => {
        result.current.setLoading(true)
      })

      expect(result.current.state.isLoading).toBe(true)
    })
  })
})