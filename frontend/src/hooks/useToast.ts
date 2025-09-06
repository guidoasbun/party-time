import { useState, useCallback } from 'react'

export interface Toast {
  id: string
  title?: string
  description: string
  variant?: 'default' | 'destructive' | 'success'
  duration?: number
}

export interface ToastOptions {
  title?: string
  description: string
  variant?: 'default' | 'destructive' | 'success'
  duration?: number
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((options: ToastOptions) => {
    const id = Math.random().toString(36).substr(2, 9)
    const toast: Toast = {
      id,
      title: options.title,
      description: options.description,
      variant: options.variant || 'default',
      duration: options.duration || 5000,
    }

    setToasts((prev) => [...prev, toast])

    // Auto-remove toast after duration
    if (toast.duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, toast.duration)
    }

    return id
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const toast = useCallback((options: ToastOptions) => {
    return addToast(options)
  }, [addToast])

  // Convenience methods
  const success = useCallback((description: string, title?: string) => {
    return addToast({ description, title, variant: 'success' })
  }, [addToast])

  const error = useCallback((description: string, title?: string) => {
    return addToast({ description, title, variant: 'destructive' })
  }, [addToast])

  const info = useCallback((description: string, title?: string) => {
    return addToast({ description, title, variant: 'default' })
  }, [addToast])

  return {
    toasts,
    toast,
    success,
    error,
    info,
    removeToast,
  }
}