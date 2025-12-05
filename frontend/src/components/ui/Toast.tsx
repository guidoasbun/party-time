'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import type { Toast as ToastType } from '@/hooks/useToast'

interface ToastProps {
  toast: ToastType
  onRemove: (id: string) => void
  index?: number
}

export function Toast({ toast, onRemove, index = 0 }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Animate in after mount
    const timer = setTimeout(() => setIsVisible(true), 10)
    return () => clearTimeout(timer)
  }, [])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(() => onRemove(toast.id), 150) // Wait for animation
  }

  const variants: Record<string, string> = {
    default: 'bg-card border-border text-card-foreground',
    destructive: 'bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-800 text-red-900 dark:text-red-100',
    success: 'bg-green-50 dark:bg-green-950/50 border-green-200 dark:border-green-800 text-green-900 dark:text-green-100',
  }

  const iconVariants: Record<string, string> = {
    default: 'text-blue-500 dark:text-blue-400',
    destructive: 'text-red-500 dark:text-red-400',
    success: 'text-green-500 dark:text-green-400',
  }

  const descriptionVariants: Record<string, string> = {
    default: 'text-muted-foreground',
    destructive: 'text-red-700 dark:text-red-200',
    success: 'text-green-700 dark:text-green-200',
  }

  const getIcon = (variant: string) => {
    switch (variant) {
      case 'success':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        )
      case 'destructive':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        )
      default:
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        )
    }
  }

  const variant = toast.variant || 'default'

  return (
    <div
      role="alert"
      aria-live="polite"
      className={cn(
        'w-full max-w-sm rounded-lg border shadow-lg transition-all duration-200 ease-out',
        variants[variant],
        isVisible
          ? 'translate-x-0 opacity-100'
          : 'translate-x-full opacity-0'
      )}
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className={cn('flex-shrink-0', iconVariants[variant])}>
            {getIcon(variant)}
          </div>

          <div className="ml-3 w-0 flex-1">
            {toast.title && (
              <p className="text-sm font-medium">
                {toast.title}
              </p>
            )}
            <p className={cn(
              'text-sm',
              toast.title && 'mt-1',
              descriptionVariants[variant]
            )}>
              {toast.description}
            </p>
          </div>

          <div className="ml-4 flex-shrink-0 flex">
            <button
              type="button"
              className={cn(
                'inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-150',
                variant === 'default' && 'text-muted-foreground hover:text-foreground focus:ring-primary',
                variant === 'destructive' && 'text-red-400 dark:text-red-300 hover:text-red-600 dark:hover:text-red-100 focus:ring-red-500',
                variant === 'success' && 'text-green-400 dark:text-green-300 hover:text-green-600 dark:hover:text-green-100 focus:ring-green-500'
              )}
              onClick={handleClose}
            >
              <span className="sr-only">Close notification</span>
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

interface ToasterProps {
  toasts: ToastType[]
  onRemove: (id: string) => void
}

export function Toaster({ toasts, onRemove }: ToasterProps) {
  if (toasts.length === 0) return null

  return (
    <div
      className="fixed bottom-4 right-4 z-50 flex flex-col-reverse gap-3 sm:bottom-6 sm:right-6"
      aria-label="Notifications"
    >
      {toasts.map((toast, index) => (
        <Toast
          key={toast.id}
          toast={toast}
          onRemove={onRemove}
          index={index}
        />
      ))}
    </div>
  )
}
