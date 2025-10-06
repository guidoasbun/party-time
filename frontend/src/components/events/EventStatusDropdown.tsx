'use client'

/**
 * Event Status Dropdown Component
 * Allows changing event status with appropriate confirmations
 */

import React, { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check, AlertCircle, Clock, CheckCircle, XCircle, Pause } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import { useUpdateEvent } from '@/hooks/api/useEvents'
import { useToast } from '@/hooks/useToast'
import { EventStatus } from '@/types/event.types'
import type { Event } from '@/types'

interface EventStatusDropdownProps {
  event: Event
  onStatusChange?: (newStatus: EventStatus) => void
  className?: string
}

const STATUS_CONFIG: Record<EventStatus, {
  label: string
  icon: React.ReactNode
  color: string
  bgColor: string
  borderColor: string
  requiresConfirmation?: boolean
  confirmationMessage?: string
}> = {
  [EventStatus.DRAFT]: {
    label: 'Draft',
    icon: <AlertCircle className="h-4 w-4" />,
    color: 'text-gray-700 dark:text-gray-300',
    bgColor: 'bg-gray-100 dark:bg-gray-700',
    borderColor: 'border-gray-300 dark:border-gray-600',
  },
  [EventStatus.PLANNING]: {
    label: 'Planning',
    icon: <Clock className="h-4 w-4" />,
    color: 'text-amber-700 dark:text-amber-300',
    bgColor: 'bg-amber-100 dark:bg-amber-900/30',
    borderColor: 'border-amber-300 dark:border-amber-700',
  },
  [EventStatus.CONFIRMED]: {
    label: 'Confirmed',
    icon: <CheckCircle className="h-4 w-4" />,
    color: 'text-emerald-700 dark:text-emerald-300',
    bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
    borderColor: 'border-emerald-300 dark:border-emerald-700',
  },
  [EventStatus.IN_PROGRESS]: {
    label: 'In Progress',
    icon: <Clock className="h-4 w-4" />,
    color: 'text-blue-700 dark:text-blue-300',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    borderColor: 'border-blue-300 dark:border-blue-700',
  },
  [EventStatus.ACTIVE]: {
    label: 'Active',
    icon: <CheckCircle className="h-4 w-4" />,
    color: 'text-blue-700 dark:text-blue-300',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    borderColor: 'border-blue-300 dark:border-blue-700',
  },
  [EventStatus.COMPLETED]: {
    label: 'Completed',
    icon: <Check className="h-4 w-4" />,
    color: 'text-green-700 dark:text-green-300',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
    borderColor: 'border-green-300 dark:border-green-700',
    requiresConfirmation: true,
    confirmationMessage: 'Mark this event as completed? This will archive the event.',
  },
  [EventStatus.CANCELLED]: {
    label: 'Cancelled',
    icon: <XCircle className="h-4 w-4" />,
    color: 'text-red-700 dark:text-red-300',
    bgColor: 'bg-red-100 dark:bg-red-900/30',
    borderColor: 'border-red-300 dark:border-red-700',
    requiresConfirmation: true,
    confirmationMessage: 'Cancel this event? This will notify all guests about the cancellation.',
  },
  [EventStatus.POSTPONED]: {
    label: 'Postponed',
    icon: <Pause className="h-4 w-4" />,
    color: 'text-orange-700 dark:text-orange-300',
    bgColor: 'bg-orange-100 dark:bg-orange-900/30',
    borderColor: 'border-orange-300 dark:border-orange-700',
    requiresConfirmation: true,
    confirmationMessage: 'Postpone this event? You can update the date later.',
  },
}

export function EventStatusDropdown({ event, onStatusChange, className }: EventStatusDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [pendingStatus, setPendingStatus] = useState<EventStatus | null>(null)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  const updateMutation = useUpdateEvent({
    onSuccess: (updatedEvent) => {
      toast({
        title: 'Status updated',
        description: `Event status changed to ${STATUS_CONFIG[updatedEvent.status].label}.`,
        variant: 'success',
      })
      onStatusChange?.(updatedEvent.status)
      setIsOpen(false)
      setPendingStatus(null)
      setShowConfirmation(false)
    },
    onError: (error) => {
      toast({
        title: 'Failed to update status',
        description: error.message || 'An error occurred while updating the event status.',
        variant: 'destructive',
      })
      setPendingStatus(null)
      setShowConfirmation(false)
    },
  })

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

  const handleStatusClick = (newStatus: EventStatus) => {
    // Don't do anything if it's the same status
    if (newStatus === event.status) {
      setIsOpen(false)
      return
    }

    const config = STATUS_CONFIG[newStatus]

    if (config.requiresConfirmation) {
      setPendingStatus(newStatus)
      setShowConfirmation(true)
      setIsOpen(false)
    } else {
      updateMutation.mutate({
        id: event.id,
        data: { status: newStatus },
      })
    }
  }

  const handleConfirmStatusChange = () => {
    if (pendingStatus) {
      updateMutation.mutate({
        id: event.id,
        data: { status: pendingStatus },
      })
    }
  }

  const handleCancelConfirmation = () => {
    setPendingStatus(null)
    setShowConfirmation(false)
  }

  const currentConfig = STATUS_CONFIG[event.status]
  const pendingConfig = pendingStatus ? STATUS_CONFIG[pendingStatus] : null

  // Get variant for confirmation dialog
  const getConfirmationVariant = (status: EventStatus): 'default' | 'destructive' | 'warning' => {
    if (status === EventStatus.CANCELLED) return 'destructive'
    if (status === EventStatus.POSTPONED || status === EventStatus.COMPLETED) return 'warning'
    return 'default'
  }

  return (
    <>
      <div className={`relative ${className || ''}`} ref={dropdownRef}>
        <Button
          variant="outline"
          size="md"
          onClick={() => setIsOpen(!isOpen)}
          disabled={updateMutation.isPending}
          className={`gap-2 ${currentConfig.color} ${currentConfig.bgColor} ${currentConfig.borderColor} hover:opacity-80`}
          aria-label="Change event status"
          aria-expanded={isOpen}
          aria-haspopup="true"
        >
          {currentConfig.icon}
          <span className="hidden sm:inline">{currentConfig.label}</span>
          <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </Button>

        {/* Dropdown menu */}
        {isOpen && (
          <div
            className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-50 overflow-hidden"
            role="menu"
            aria-orientation="vertical"
          >
            {/* Header */}
            <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Change Status
              </h3>
            </div>

            {/* Status options */}
            <div className="py-1">
              {Object.entries(STATUS_CONFIG).map(([status, config]) => {
                const isCurrentStatus = status === event.status
                const statusValue = status as EventStatus

                return (
                  <button
                    key={status}
                    onClick={() => handleStatusClick(statusValue)}
                    disabled={isCurrentStatus}
                    className={`w-full px-4 py-2 flex items-center gap-3 text-left transition-colors ${
                      isCurrentStatus
                        ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed opacity-75'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                    role="menuitem"
                  >
                    <span className={config.color}>{config.icon}</span>
                    <span className={`flex-1 text-sm font-medium ${config.color}`}>
                      {config.label}
                    </span>
                    {isCurrentStatus && (
                      <Check className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Confirmation dialog */}
      {showConfirmation && pendingStatus && pendingConfig && (
        <ConfirmDialog
          open={showConfirmation}
          onClose={handleCancelConfirmation}
          onConfirm={handleConfirmStatusChange}
          title={`Change Status to ${pendingConfig.label}`}
          description={pendingConfig.confirmationMessage || ''}
          confirmText="Confirm"
          cancelText="Cancel"
          variant={getConfirmationVariant(pendingStatus)}
          icon={pendingStatus === EventStatus.CANCELLED ? 'danger' : 'warning'}
          isLoading={updateMutation.isPending}
        />
      )}
    </>
  )
}
