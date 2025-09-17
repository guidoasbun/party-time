'use client'

import React from 'react'
import { AlertTriangle, Info, HelpCircle, X } from 'lucide-react'
import { ConfirmDialogProps } from '@/types/actions.types'

interface ModalProps {
  open: boolean
  onClose: () => void
  children: React.ReactNode
}

const Modal: React.FC<ModalProps> = ({ open, onClose, children }) => {
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (open) {
      document.addEventListener('keydown', handleEscape)
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal content */}
      <div className="relative w-full max-w-md mx-4">
        {children}
      </div>
    </div>
  )
}

const getIconComponent = (icon?: ConfirmDialogProps['icon']) => {
  switch (icon) {
    case 'warning':
      return <AlertTriangle className="w-6 h-6 text-amber-500" />
    case 'danger':
      return <AlertTriangle className="w-6 h-6 text-red-500" />
    case 'info':
      return <Info className="w-6 h-6 text-blue-500" />
    case 'question':
      return <HelpCircle className="w-6 h-6 text-gray-500" />
    default:
      return null
  }
}

const getVariantStyles = (variant?: ConfirmDialogProps['variant']) => {
  switch (variant) {
    case 'destructive':
      return {
        confirmButton: 'bg-red-600 hover:bg-red-700 focus:ring-red-500 text-white',
        border: 'border-red-200'
      }
    case 'warning':
      return {
        confirmButton: 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500 text-white',
        border: 'border-amber-200'
      }
    default:
      return {
        confirmButton: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 text-white',
        border: 'border-gray-200'
      }
  }
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default',
  icon,
  isLoading = false
}) => {
  const styles = getVariantStyles(variant)
  const IconComponent = getIconComponent(icon)

  const handleConfirm = () => {
    if (!isLoading) {
      onConfirm()
    }
  }

  const handleCancel = () => {
    if (!isLoading) {
      onClose()
    }
  }

  return (
    <Modal open={open} onClose={handleCancel}>
      <div className={`bg-white rounded-lg shadow-xl border ${styles.border} overflow-hidden`}>
        {/* Header */}
        <div className="flex items-start justify-between p-6 pb-4">
          <div className="flex items-start space-x-3">
            {IconComponent && (
              <div className="flex-shrink-0 mt-0.5">
                {IconComponent}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3
                className="text-lg font-semibold text-gray-900"
                id="confirm-dialog-title"
              >
                {title}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCancel}
            disabled={isLoading}
            className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 pb-4">
          <p
            className="text-sm text-gray-600 leading-relaxed"
            id="confirm-dialog-description"
          >
            {description}
          </p>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={handleCancel}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={isLoading}
            className={`px-4 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${styles.confirmButton}`}
            aria-describedby="confirm-dialog-title confirm-dialog-description"
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Loading...</span>
              </div>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default ConfirmDialog