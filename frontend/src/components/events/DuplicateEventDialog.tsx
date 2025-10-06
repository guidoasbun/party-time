'use client'

/**
 * Duplicate Event Dialog Component
 * Allows users to duplicate an event with optional name customization
 */

import React, { useState, useEffect } from 'react'
import { Copy, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import type { Event } from '@/types'

interface DuplicateEventDialogProps {
  isOpen: boolean
  event: Event | null
  isDuplicating: boolean
  onConfirm: (customName?: string) => void
  onCancel: () => void
}

export function DuplicateEventDialog({
  isOpen,
  event,
  isDuplicating,
  onConfirm,
  onCancel
}: DuplicateEventDialogProps) {
  const [customName, setCustomName] = useState('')
  const [useCustomName, setUseCustomName] = useState(false)

  // Reset state when dialog opens
  useEffect(() => {
    if (isOpen && event) {
      setCustomName(`${event.name} (Copy)`)
      setUseCustomName(false)
    }
  }, [isOpen, event])

  if (!isOpen || !event) return null

  const handleConfirm = () => {
    const finalName = useCustomName && customName.trim() ? customName.trim() : undefined
    onConfirm(finalName)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onCancel()
    } else if (e.key === 'Enter' && !isDuplicating) {
      handleConfirm()
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="duplicate-dialog-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
        aria-hidden="true"
      />

      {/* Dialog content */}
      <div className="relative w-full max-w-md mx-4 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between p-6 pb-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 mt-0.5">
              <Copy className="w-6 h-6 text-blue-500" />
            </div>
            <div className="flex-1 min-w-0">
              <h3
                id="duplicate-dialog-title"
                className="text-lg font-semibold text-gray-900 dark:text-gray-100"
              >
                Duplicate Event
              </h3>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Create a copy of &ldquo;{event.name}&rdquo;
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onCancel}
            disabled={isDuplicating}
            className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* What will be copied */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-4">
            <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
              What will be copied:
            </p>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• Event type, description, and settings</li>
              <li>• Venue and location information</li>
              <li>• Budget categories and allocations</li>
              <li>• Event timeline and tasks</li>
            </ul>
          </div>

          {/* Name customization toggle */}
          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              id="customize-name"
              checked={useCustomName}
              onChange={(e) => setUseCustomName(e.target.checked)}
              disabled={isDuplicating}
              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
            />
            <label
              htmlFor="customize-name"
              className="text-sm font-medium text-gray-900 dark:text-gray-100 cursor-pointer"
            >
              Customize event name
            </label>
          </div>

          {/* Custom name input */}
          {useCustomName && (
            <div className="space-y-2">
              <label
                htmlFor="event-name"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                New event name
              </label>
              <input
                type="text"
                id="event-name"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isDuplicating}
                placeholder="Enter event name..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors"
                maxLength={255}
                autoFocus
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {customName.length}/255 characters
              </p>
            </div>
          )}

          {/* Default name preview */}
          {!useCustomName && (
            <div className="text-sm text-gray-600 dark:text-gray-400">
              The duplicated event will be named:{' '}
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {event.name} (Copy)
              </span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-end space-x-3">
          <Button
            variant="outline"
            size="md"
            onClick={onCancel}
            disabled={isDuplicating}
          >
            Cancel
          </Button>

          <Button
            variant="default"
            size="md"
            onClick={handleConfirm}
            disabled={isDuplicating || (useCustomName && !customName.trim())}
            className="gap-2"
          >
            {isDuplicating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Duplicating...</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                <span>Duplicate Event</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
