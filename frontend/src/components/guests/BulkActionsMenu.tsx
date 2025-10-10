'use client'

/**
 * BulkActionsMenu Component
 * Dropdown menu for performing bulk operations on selected guests
 */

import React, { useState } from 'react'
import { MoreVertical, Trash2, Mail, Download, CheckCircle, XCircle, HelpCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { RsvpStatus, type UUID } from '@/types'
import { cn } from '@/lib/utils'

interface BulkActionsMenuProps {
  selectedGuestIds: UUID[]
  onDelete: (guestIds: UUID[]) => void
  onUpdateStatus: (guestIds: UUID[], status: RsvpStatus) => void
  onSendInvitations: (guestIds: UUID[]) => void
  onExport: (guestIds: UUID[]) => void
  className?: string
}

export function BulkActionsMenu({
  selectedGuestIds,
  onDelete,
  onUpdateStatus,
  onSendInvitations,
  onExport,
  className
}: BulkActionsMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = React.useRef<HTMLDivElement>(null)

  const selectedCount = selectedGuestIds.length

  // Close menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleAction = (action: () => void) => {
    action()
    setIsOpen(false)
  }

  if (selectedCount === 0) {
    return null
  }

  return (
    <div className={cn('relative', className)} ref={menuRef}>
      {/* Trigger Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="gap-2"
      >
        <span className="font-medium">{selectedCount} Selected</span>
        <MoreVertical className="h-4 w-4" />
      </Button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 z-50 rounded-md border border-border bg-card shadow-lg">
          <div className="p-2 space-y-1">
            {/* Update RSVP Status Section */}
            <div className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Update Status
            </div>

            <button
              type="button"
              onClick={() => handleAction(() => onUpdateStatus(selectedGuestIds, RsvpStatus.ATTENDING))}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground rounded transition-colors"
            >
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              <span>Mark as Attending</span>
            </button>

            <button
              type="button"
              onClick={() => handleAction(() => onUpdateStatus(selectedGuestIds, RsvpStatus.NOT_ATTENDING))}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground rounded transition-colors"
            >
              <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
              <span>Mark as Not Attending</span>
            </button>

            <button
              type="button"
              onClick={() => handleAction(() => onUpdateStatus(selectedGuestIds, RsvpStatus.MAYBE))}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground rounded transition-colors"
            >
              <HelpCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span>Mark as Maybe</span>
            </button>

            <button
              type="button"
              onClick={() => handleAction(() => onUpdateStatus(selectedGuestIds, RsvpStatus.PENDING))}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground rounded transition-colors"
            >
              <HelpCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <span>Mark as Pending</span>
            </button>

            <div className="my-1 border-t border-border" />

            {/* Actions Section */}
            <div className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Actions
            </div>

            <button
              type="button"
              onClick={() => handleAction(() => onSendInvitations(selectedGuestIds))}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground rounded transition-colors"
            >
              <Mail className="h-4 w-4" />
              <span>Send Invitations</span>
            </button>

            <button
              type="button"
              onClick={() => handleAction(() => onExport(selectedGuestIds))}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground rounded transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Export Selected</span>
            </button>

            <div className="my-1 border-t border-border" />

            {/* Danger Zone */}
            <button
              type="button"
              onClick={() => handleAction(() => onDelete(selectedGuestIds))}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 rounded transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              <span>Delete Selected</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
