'use client'

/**
 * GuestTable Component
 * Data table for displaying guests with inline editing, sorting, and bulk selection
 */

import React, { useState } from 'react'
import { ChevronUp, ChevronDown, Edit2, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { RsvpStatus, type Guest, type GuestUpdate, type UUID } from '@/types'
import { cn } from '@/lib/utils'

interface GuestTableProps {
  guests: Guest[]
  selectedIds: UUID[]
  onSelectionChange: (ids: UUID[]) => void
  onUpdateGuest: (guestId: UUID, data: GuestUpdate) => void
  sortBy: keyof Guest
  sortOrder: 'asc' | 'desc'
  onSort: (field: keyof Guest) => void
  isUpdating?: boolean
}

interface EditingState {
  guestId: UUID | null
  field: keyof Guest | null
  value: string
}

const rsvpStatusOptions = [
  { value: RsvpStatus.ATTENDING, label: 'Attending' },
  { value: RsvpStatus.NOT_ATTENDING, label: 'Not Attending' },
  { value: RsvpStatus.PENDING, label: 'Pending' },
  { value: RsvpStatus.MAYBE, label: 'Maybe' }
]

export function GuestTable({
  guests,
  selectedIds,
  onSelectionChange,
  onUpdateGuest,
  sortBy,
  sortOrder,
  onSort,
  isUpdating = false
}: GuestTableProps) {
  const [editing, setEditing] = useState<EditingState>({
    guestId: null,
    field: null,
    value: ''
  })

  const isAllSelected = guests.length > 0 && selectedIds.length === guests.length
  const isSomeSelected = selectedIds.length > 0 && !isAllSelected

  const toggleSelectAll = () => {
    if (isAllSelected) {
      onSelectionChange([])
    } else {
      onSelectionChange(guests.map(g => g.id))
    }
  }

  const toggleSelectGuest = (guestId: UUID) => {
    if (selectedIds.includes(guestId)) {
      onSelectionChange(selectedIds.filter(id => id !== guestId))
    } else {
      onSelectionChange([...selectedIds, guestId])
    }
  }

  const startEditing = (guestId: UUID, field: keyof Guest, currentValue: string | boolean | null) => {
    setEditing({
      guestId,
      field,
      value: currentValue?.toString() || ''
    })
  }

  const cancelEditing = () => {
    setEditing({ guestId: null, field: null, value: '' })
  }

  const saveEdit = (guestId: UUID, field: keyof Guest) => {
    const updateData: GuestUpdate = {
      [field]: editing.value || undefined
    }
    onUpdateGuest(guestId, updateData)
    cancelEditing()
  }

  const renderSortIcon = (field: keyof Guest) => {
    if (sortBy !== field) {
      return <ChevronUp className="h-4 w-4 text-gray-400" />
    }
    return sortOrder === 'asc' ? (
      <ChevronUp className="h-4 w-4" />
    ) : (
      <ChevronDown className="h-4 w-4" />
    )
  }

  const getRsvpStatusColor = (status: RsvpStatus): string => {
    const colors: Record<RsvpStatus, string> = {
      [RsvpStatus.ATTENDING]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      [RsvpStatus.NOT_ATTENDING]: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      [RsvpStatus.PENDING]: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300',
      [RsvpStatus.MAYBE]: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
    }
    return colors[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
  }

  const getRsvpStatusLabel = (status: RsvpStatus): string => {
    const labels: Record<RsvpStatus, string> = {
      [RsvpStatus.ATTENDING]: 'Attending',
      [RsvpStatus.NOT_ATTENDING]: 'Not Attending',
      [RsvpStatus.PENDING]: 'Pending',
      [RsvpStatus.MAYBE]: 'Maybe'
    }
    return labels[status] || status
  }

  const renderEditableCell = (
    guest: Guest,
    field: keyof Guest,
    value: string | boolean | null | undefined,
    type: 'text' | 'email' | 'tel' | 'select' = 'text'
  ) => {
    const isEditing = editing.guestId === guest.id && editing.field === field
    const displayValue = value?.toString() || '-'

    if (isEditing) {
      if (type === 'select' && field === 'rsvp_status') {
        return (
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <Select
                options={rsvpStatusOptions}
                value={editing.value}
                onValueChange={(val) => setEditing({ ...editing, value: val as string })}
                placeholder="Select status"
              />
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => saveEdit(guest.id, field)}
              disabled={isUpdating}
              className="p-1 h-8 w-8"
            >
              <Check className="h-4 w-4 text-green-600" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={cancelEditing}
              disabled={isUpdating}
              className="p-1 h-8 w-8"
            >
              <X className="h-4 w-4 text-red-600" />
            </Button>
          </div>
        )
      }

      return (
        <div className="flex items-center gap-2">
          <Input
            type={type}
            value={editing.value}
            onChange={(e) => setEditing({ ...editing, value: e.target.value })}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                saveEdit(guest.id, field)
              } else if (e.key === 'Escape') {
                cancelEditing()
              }
            }}
            className="h-8 text-sm"
            autoFocus
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => saveEdit(guest.id, field)}
            disabled={isUpdating}
            className="p-1 h-8 w-8"
          >
            <Check className="h-4 w-4 text-green-600" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={cancelEditing}
            disabled={isUpdating}
            className="p-1 h-8 w-8"
          >
            <X className="h-4 w-4 text-red-600" />
          </Button>
        </div>
      )
    }

    return (
      <button
        type="button"
        onClick={() => startEditing(guest.id, field, value as string | boolean | null)}
        className="flex items-center gap-2 w-full text-left group"
      >
        <span className="flex-1">{displayValue}</span>
        <Edit2 className="h-3 w-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
      </button>
    )
  }

  if (guests.length === 0) {
    return (
      <div className="text-center py-12 border border-border rounded-lg bg-card">
        <p className="text-muted-foreground">No guests found</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto border border-border rounded-lg">
      <table className="w-full bg-card">
        <thead className="bg-muted/50 border-b border-border">
          <tr>
            {/* Select All Checkbox */}
            <th className="px-4 py-3 text-left w-12">
              <input
                type="checkbox"
                checked={isAllSelected}
                ref={(el) => {
                  if (el) el.indeterminate = isSomeSelected
                }}
                onChange={toggleSelectAll}
                className="w-4 h-4 rounded border-input text-primary focus:ring-2 focus:ring-ring focus:ring-offset-2"
                aria-label="Select all guests"
              />
            </th>

            {/* Name Column */}
            <th className="px-4 py-3 text-left">
              <button
                type="button"
                onClick={() => onSort('first_name')}
                className="flex items-center gap-2 font-semibold text-sm hover:text-foreground transition-colors"
              >
                Name
                {renderSortIcon('first_name')}
              </button>
            </th>

            {/* Email Column */}
            <th className="px-4 py-3 text-left">
              <button
                type="button"
                onClick={() => onSort('email')}
                className="flex items-center gap-2 font-semibold text-sm hover:text-foreground transition-colors"
              >
                Email
                {renderSortIcon('email')}
              </button>
            </th>

            {/* Phone Column */}
            <th className="px-4 py-3 text-left">
              <span className="font-semibold text-sm">Phone</span>
            </th>

            {/* RSVP Status Column */}
            <th className="px-4 py-3 text-left">
              <button
                type="button"
                onClick={() => onSort('rsvp_status')}
                className="flex items-center gap-2 font-semibold text-sm hover:text-foreground transition-colors"
              >
                RSVP Status
                {renderSortIcon('rsvp_status')}
              </button>
            </th>

            {/* Plus-One Column */}
            <th className="px-4 py-3 text-left">
              <span className="font-semibold text-sm">Plus-One</span>
            </th>

            {/* Dietary Restrictions Column */}
            <th className="px-4 py-3 text-left">
              <span className="font-semibold text-sm">Dietary</span>
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-border">
          {guests.map((guest) => (
            <tr
              key={guest.id}
              className={cn(
                'hover:bg-muted/50 transition-colors',
                selectedIds.includes(guest.id) && 'bg-blue-50 dark:bg-blue-950/20'
              )}
            >
              {/* Checkbox */}
              <td className="px-4 py-3">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(guest.id)}
                  onChange={() => toggleSelectGuest(guest.id)}
                  className="w-4 h-4 rounded border-input text-primary focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  aria-label={`Select ${guest.first_name} ${guest.last_name}`}
                />
              </td>

              {/* Name */}
              <td className="px-4 py-3">
                <div className="font-medium">
                  {guest.first_name} {guest.last_name}
                </div>
              </td>

              {/* Email */}
              <td className="px-4 py-3 text-sm">
                {renderEditableCell(guest, 'email', guest.email, 'email')}
              </td>

              {/* Phone */}
              <td className="px-4 py-3 text-sm">
                {renderEditableCell(guest, 'phone', guest.phone, 'tel')}
              </td>

              {/* RSVP Status */}
              <td className="px-4 py-3">
                <span
                  className={cn(
                    'inline-flex px-2 py-1 rounded-full text-xs font-semibold',
                    getRsvpStatusColor(guest.rsvp_status)
                  )}
                >
                  {getRsvpStatusLabel(guest.rsvp_status)}
                </span>
              </td>

              {/* Plus-One */}
              <td className="px-4 py-3 text-sm">
                {guest.plus_one_allowed ? (
                  <div>
                    {guest.plus_one_name || (
                      <span className="text-muted-foreground italic">Allowed</span>
                    )}
                  </div>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </td>

              {/* Dietary Restrictions */}
              <td className="px-4 py-3 text-sm">
                {renderEditableCell(guest, 'dietary_restrictions', guest.dietary_restrictions)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
