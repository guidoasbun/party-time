'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import type { Toast } from '@/hooks/useToast'

interface ToastProps {
  toast: Toast
  onRemove: (id: string) => void
}

export function Toast({ toast, onRemove }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Animate in
    setIsVisible(true)
  }, [])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(() => onRemove(toast.id), 150) // Wait for animation
  }

  const variants = {
    default: 'bg-white border-gray-200 text-gray-900',
    destructive: 'bg-red-50 border-red-200 text-red-900',
    success: 'bg-green-50 border-green-200 text-green-900',
  }

  const iconVariants = {
    default: '!text-blue-500',
    destructive: '!text-red-500', 
    success: '!text-green-500',
  }

  const getIcon = (variant: string) => {
    switch (variant) {
      case 'success':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        )
      case 'destructive':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        )
      default:
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        )
    }
  }

  return (
    <div
      className={cn(
        'fixed right-4 z-50 w-full max-w-sm rounded-lg border shadow-lg transition-all duration-150',
        variants[toast.variant || 'default'],
        isVisible 
          ? 'translate-x-0 opacity-100' 
          : 'translate-x-full opacity-0'
      )}
      style={{ 
        top: `${Math.max(16, window.innerHeight - 100)}px`,
        transform: `translateY(-${Math.max(0, 100)}px)`
      }}
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className={cn('flex-shrink-0', iconVariants[toast.variant || 'default'])}>
            {getIcon(toast.variant || 'default')}
          </div>
          
          <div className="ml-3 w-0 flex-1">
            {toast.title && (
              <p className="text-sm font-medium">
                {toast.title}
              </p>
            )}
            <p className={cn('text-sm', toast.title ? 'mt-1 text-gray-600' : '')}>
              {toast.description}
            </p>
          </div>
          
          <div className="ml-4 flex-shrink-0 flex">
            <button
              className="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 transition ease-in-out duration-150"
              onClick={handleClose}
            >
              <span className="sr-only">Close</span>
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
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
  toasts: Toast[]
  onRemove: (id: string) => void
}

export function Toaster({ toasts, onRemove }: ToasterProps) {
  return (
    <>
      {toasts.map((toast, index) => (
        <div
          key={toast.id}
          style={{ 
            top: `${Math.max(16, 16 + (index * 80))}px`
          }}
          className="fixed right-4 z-50"
        >
          <Toast toast={toast} onRemove={onRemove} />
        </div>
      ))}
    </>
  )
}