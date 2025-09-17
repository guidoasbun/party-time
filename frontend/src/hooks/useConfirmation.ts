'use client'

import { useState, useCallback } from 'react'
import { ConfirmationConfig } from '@/types/actions.types'

export interface ConfirmationState {
  isOpen: boolean
  config: ConfirmationConfig | null
  isLoading: boolean
}

export interface UseConfirmationOptions {
  defaultConfig?: Partial<ConfirmationConfig>
  onConfirm?: () => void | Promise<void>
  onCancel?: () => void
}

export interface UseConfirmationReturn {
  state: ConfirmationState
  showConfirmation: (config: ConfirmationConfig) => Promise<boolean>
  hideConfirmation: () => void
  confirm: () => Promise<void>
  cancel: () => void
  setLoading: (loading: boolean) => void
}

export function useConfirmation(
  options: UseConfirmationOptions = {}
): UseConfirmationReturn {
  const { defaultConfig, onConfirm, onCancel } = options

  const [state, setState] = useState<ConfirmationState>({
    isOpen: false,
    config: null,
    isLoading: false
  })

  const [resolvePromise, setResolvePromise] = useState<{
    resolve: (value: boolean) => void
  } | null>(null)

  const showConfirmation = useCallback(
    (config: ConfirmationConfig): Promise<boolean> => {
      return new Promise<boolean>((resolve) => {
        const mergedConfig: ConfirmationConfig = {
          ...defaultConfig,
          ...config,
          confirmText: config.confirmText || defaultConfig?.confirmText || 'Confirm',
          cancelText: config.cancelText || defaultConfig?.cancelText || 'Cancel',
          variant: config.variant || defaultConfig?.variant || 'default',
          icon: config.icon || defaultConfig?.icon
        }

        setState({
          isOpen: true,
          config: mergedConfig,
          isLoading: false
        })

        setResolvePromise({ resolve })
      })
    },
    [defaultConfig]
  )

  const hideConfirmation = useCallback(() => {
    setState(prev => ({
      ...prev,
      isOpen: false,
      isLoading: false
    }))

    // Resolve with false (cancelled)
    if (resolvePromise) {
      resolvePromise.resolve(false)
      setResolvePromise(null)
    }

    if (onCancel) {
      onCancel()
    }
  }, [resolvePromise, onCancel])

  const confirm = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true }))

    try {
      if (onConfirm) {
        await onConfirm()
      }

      setState(prev => ({
        ...prev,
        isOpen: false,
        isLoading: false
      }))

      // Resolve with true (confirmed)
      if (resolvePromise) {
        resolvePromise.resolve(true)
        setResolvePromise(null)
      }
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false }))
      throw error
    }
  }, [onConfirm, resolvePromise])

  const cancel = useCallback(() => {
    hideConfirmation()
  }, [hideConfirmation])

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, isLoading: loading }))
  }, [])

  return {
    state,
    showConfirmation,
    hideConfirmation,
    confirm,
    cancel,
    setLoading
  }
}