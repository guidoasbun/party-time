'use client'

/**
 * SeatAssignmentPanel Component
 *
 * Phase 6.1.5: Guest Assignment System
 * Bottom panel showing seat details when a table is selected
 *
 * Features:
 * - Display all seat slots for selected table
 * - Show assigned seats with guest name + RSVP badge
 * - Show empty seats with seat numbers
 * - Click seat to assign/unassign guest
 * - Capacity warning indicator
 * - Quick actions: Clear All Seats, Auto-Fill Table
 * - Smooth open/close animations
 */

import React, { useState, useMemo } from 'react'
import {
  X,
  User,
  AlertTriangle,
  Trash2,
  Wand2,
  CheckCircle2,
  Clock,
  XCircle,
  HelpCircle
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'
import type {
  TableLayoutWithSeats,
  SeatAssignment,
  Guest,
  RsvpStatus,
  UUID
} from '@/types'
import { RsvpStatus as RsvpStatusEnum } from '@/types'

interface SeatAssignmentPanelProps {
  table: TableLayoutWithSeats | null
  guests: Guest[]
  isOpen?: boolean
  /** When true, renders as inline block element instead of fixed bottom panel */
  inline?: boolean
  onClose?: () => void
  onAssignSeat?: (seatNumber: number, guestId: UUID | null) => Promise<void>
  onClearAllSeats?: () => Promise<void>
  onAutoFillTable?: () => Promise<void>
  isLoading?: boolean
  className?: string
}

interface SeatSlot {
  seatNumber: number
  assignment: SeatAssignment | null
  guest: Guest | null
  isEmpty: boolean
}

/**
 * Get RSVP status configuration for styling
 */
const getRsvpStatusConfig = (status: RsvpStatus) => {
  const configs = {
    [RsvpStatusEnum.ATTENDING]: {
      label: 'Attending',
      icon: CheckCircle2,
      bgColor: 'bg-green-100 dark:bg-green-900/30',
      textColor: 'text-green-800 dark:text-green-300'
    },
    [RsvpStatusEnum.NOT_ATTENDING]: {
      label: 'Not Attending',
      icon: XCircle,
      bgColor: 'bg-red-100 dark:bg-red-900/30',
      textColor: 'text-red-800 dark:text-red-300'
    },
    [RsvpStatusEnum.PENDING]: {
      label: 'Pending',
      icon: Clock,
      bgColor: 'bg-amber-100 dark:bg-amber-900/30',
      textColor: 'text-amber-800 dark:text-amber-300'
    },
    [RsvpStatusEnum.MAYBE]: {
      label: 'Maybe',
      icon: HelpCircle,
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
      textColor: 'text-blue-800 dark:text-blue-300'
    }
  }
  return configs[status] || configs[RsvpStatusEnum.PENDING]
}

/**
 * Get capacity status color
 */
const getCapacityColor = (assignedCount: number, capacity: number): string => {
  const percentage = (assignedCount / capacity) * 100

  if (assignedCount >= capacity) {
    return 'text-red-600 dark:text-red-400'
  } else if (percentage >= 80) {
    return 'text-yellow-600 dark:text-yellow-400'
  } else {
    return 'text-green-600 dark:text-green-400'
  }
}

export function SeatAssignmentPanel({
  table,
  guests,
  isOpen = false,
  inline = false,
  onClose,
  onAssignSeat,
  onClearAllSeats,
  onAutoFillTable,
  isLoading = false,
  className
}: SeatAssignmentPanelProps) {
  const [selectedSeatNumber, setSelectedSeatNumber] = useState<number | null>(null)
  const [showGuestPicker, setShowGuestPicker] = useState(false)

  // Build seat slots (all possible seats based on capacity)
  const seatSlots: SeatSlot[] = useMemo(() => {
    if (!table) return []

    const slots: SeatSlot[] = []

    for (let i = 1; i <= table.capacity; i++) {
      const assignment = table.seat_assignments?.find(a => a.seat_number === i) || null
      const guest = assignment?.guest_id
        ? guests.find(g => g.id === assignment.guest_id) || null
        : null

      slots.push({
        seatNumber: i,
        assignment,
        guest,
        isEmpty: !assignment
      })
    }

    return slots
  }, [table, guests])

  // Calculate capacity metrics
  const capacityMetrics = useMemo(() => {
    if (!table) {
      return {
        assignedCount: 0,
        capacity: 0,
        emptySeats: 0,
        percentage: 0,
        isFull: false,
        isNearFull: false
      }
    }

    const assignedCount = table.assigned_count || 0
    const capacity = table.capacity
    const emptySeats = table.empty_seats || (capacity - assignedCount)
    const percentage = capacity > 0 ? (assignedCount / capacity) * 100 : 0

    return {
      assignedCount,
      capacity,
      emptySeats,
      percentage,
      isFull: assignedCount >= capacity,
      isNearFull: percentage >= 80
    }
  }, [table])

  // Handle seat click
  const handleSeatClick = (seatNumber: number, currentGuest: Guest | null) => {
    setSelectedSeatNumber(seatNumber)

    if (currentGuest) {
      // Unassign guest
      onAssignSeat?.(seatNumber, null)
    } else {
      // Show guest picker (for now, just log - could expand to modal)
      setShowGuestPicker(true)
      console.log('Show guest picker for seat', seatNumber)
    }
  }

  // Handle clear all seats
  const handleClearAll = async () => {
    if (window.confirm(`Remove all ${capacityMetrics.assignedCount} guests from this table?`)) {
      await onClearAllSeats?.()
    }
  }

  if (!isOpen || !table) {
    return null
  }

  return (
    <div
      className={cn(
        'bg-card border-t border-border shadow-lg',
        inline
          ? 'relative w-full'
          : [
              'fixed bottom-0 left-0 right-0 z-20',
              'transform transition-transform duration-300 ease-in-out',
              isOpen ? 'translate-y-0' : 'translate-y-full',
            ],
        className
      )}
      style={inline ? undefined : { maxHeight: '40vh' }}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold text-foreground">
              Table {table.table_number}
            </h3>

            {/* Capacity Badge */}
            <Badge
              variant={capacityMetrics.isFull ? 'destructive' : capacityMetrics.isNearFull ? 'outline' : 'default'}
              className={cn(
                "text-sm",
                capacityMetrics.isNearFull && !capacityMetrics.isFull && "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
              )}
            >
              <span className={getCapacityColor(capacityMetrics.assignedCount, capacityMetrics.capacity)}>
                {capacityMetrics.assignedCount}/{capacityMetrics.capacity} seats filled
              </span>
            </Badge>

            {/* Warning Icon if full */}
            {capacityMetrics.isFull && (
              <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-xs font-medium">Table Full</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {capacityMetrics.assignedCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearAll}
                disabled={isLoading}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All
              </Button>
            )}

            {capacityMetrics.emptySeats > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={onAutoFillTable}
                disabled={isLoading}
              >
                <Wand2 className="w-4 h-4 mr-2" />
                Auto-Fill ({capacityMetrics.emptySeats} seats)
              </Button>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              aria-label="Close seat assignment panel"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Seat Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {seatSlots.map((slot) => {
              const statusConfig = slot.guest
                ? getRsvpStatusConfig(slot.guest.rsvp_status)
                : null
              const StatusIcon = statusConfig?.icon

              return (
                <div
                  key={slot.seatNumber}
                  role="button"
                  tabIndex={isLoading ? -1 : 0}
                  onClick={() => handleSeatClick(slot.seatNumber, slot.guest)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      handleSeatClick(slot.seatNumber, slot.guest)
                    }
                  }}
                  aria-disabled={isLoading}
                  className={cn(
                    'relative p-3 rounded-lg border-2 transition-all cursor-pointer',
                    'hover:shadow-md active:scale-95',
                    slot.isEmpty
                      ? 'border-dashed border-border bg-muted/30 hover:bg-muted/50'
                      : 'border-solid border-border bg-card',
                    selectedSeatNumber === slot.seatNumber && 'ring-2 ring-primary ring-offset-2',
                    isLoading && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  {/* Seat Number Badge */}
                  <div className="absolute top-1 left-1">
                    <Badge variant="outline" className="text-xs h-5">
                      #{slot.seatNumber}
                    </Badge>
                  </div>

                  {/* Content */}
                  <div className="mt-6 flex flex-col items-center justify-center min-h-[60px]">
                    {slot.isEmpty ? (
                      <>
                        <User className="w-6 h-6 text-muted-foreground mb-1" />
                        <span className="text-xs text-muted-foreground">Empty</span>
                      </>
                    ) : (
                      <>
                        {/* Guest Avatar */}
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                          <span className="text-xs font-medium text-primary">
                            {slot.guest?.first_name?.charAt(0)}
                            {slot.guest?.last_name?.charAt(0)}
                          </span>
                        </div>

                        {/* Guest Name */}
                        <p className="text-xs font-medium text-foreground text-center line-clamp-2">
                          {slot.guest?.first_name} {slot.guest?.last_name}
                        </p>

                        {/* RSVP Status */}
                        {statusConfig && StatusIcon && (
                          <div
                            className={cn(
                              'mt-1 flex items-center gap-1 px-2 py-0.5 rounded-full text-xs',
                              statusConfig.bgColor,
                              statusConfig.textColor
                            )}
                          >
                            <StatusIcon className="w-3 h-3" />
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* Remove Button (on hover for assigned seats) */}
                  {!slot.isEmpty && (
                    <div className="absolute top-1 right-1 opacity-0 hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleSeatClick(slot.seatNumber, slot.guest)
                        }}
                        className="w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600"
                        aria-label={`Remove ${slot.guest?.first_name} ${slot.guest?.last_name}`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-border bg-muted/50">
          <p className="text-xs text-muted-foreground text-center">
            Click empty seats to assign guests • Click assigned seats to remove guests
          </p>
        </div>
      </div>
    </div>
  )
}
