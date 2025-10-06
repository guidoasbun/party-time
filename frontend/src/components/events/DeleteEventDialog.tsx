'use client'

/**
 * Delete Event Dialog Component
 * Displays a confirmation dialog before deleting an event
 */

import React from 'react'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import type { Event } from '@/types'

interface DeleteEventDialogProps {
  isOpen: boolean
  event: Event | null
  isDeleting: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function DeleteEventDialog({
  isOpen,
  event,
  isDeleting,
  onConfirm,
  onCancel
}: DeleteEventDialogProps) {
  if (!event) return null

  return (
    <ConfirmDialog
      open={isOpen}
      onClose={onCancel}
      onConfirm={onConfirm}
      title="Delete Event"
      description={`Are you sure you want to delete "${event.name}"? This action cannot be undone and will permanently remove:

• All event details and settings
• ${event.guest_count} guest${event.guest_count !== 1 ? 's' : ''} and RSVP data
• Budget information and expenses
• Event timeline and tasks

This action is irreversible.`}
      confirmText={isDeleting ? 'Deleting...' : 'Delete Event'}
      cancelText="Cancel"
      variant="destructive"
      icon="danger"
      isLoading={isDeleting}
    />
  )
}
