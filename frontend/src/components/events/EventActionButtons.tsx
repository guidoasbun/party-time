'use client'

/**
 * Event action buttons component
 * Displays edit, delete, duplicate, share, and status change actions
 */

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Edit, Trash2, Copy } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useDeleteEvent, useDuplicateEvent, useEvent } from '@/hooks/api/useEvents'
import { useToast } from '@/hooks/useToast'
import { DeleteEventDialog } from './DeleteEventDialog'
import { DuplicateEventDialog } from './DuplicateEventDialog'
import { ShareEventButton } from './ShareEventButton'
import { EventStatusDropdown } from './EventStatusDropdown'
import { cn } from '@/lib/utils'
import type { UUID } from '@/types'

interface EventActionButtonsProps {
  eventId: UUID
  eventName: string
  className?: string
  onDeleteSuccess?: () => void
  onDuplicateSuccess?: (newEventId: UUID) => void
  showStatusDropdown?: boolean
}

export function EventActionButtons({
  eventId,
  eventName,
  className,
  onDeleteSuccess,
  onDuplicateSuccess,
  showStatusDropdown = true,
}: EventActionButtonsProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false)

  // Get full event data for dialogs and status dropdown
  const { data: event } = useEvent(eventId)

  const deleteMutation = useDeleteEvent({
    onSuccess: () => {
      toast({
        title: 'Event deleted',
        description: `${eventName} has been deleted successfully.`,
        variant: 'success',
      })
      setShowDeleteDialog(false)
      onDeleteSuccess?.()
      router.push('/dashboard')
    },
    onError: (error) => {
      toast({
        title: 'Failed to delete event',
        description: error.message || 'An error occurred while deleting the event.',
        variant: 'destructive',
      })
    },
  })

  const duplicateMutation = useDuplicateEvent({
    onSuccess: (newEvent) => {
      toast({
        title: 'Event duplicated',
        description: `${newEvent.name} has been created successfully.`,
        variant: 'success',
      })
      setShowDuplicateDialog(false)
      onDuplicateSuccess?.(newEvent.id)
      router.push(`/events/${newEvent.id}`)
    },
    onError: (error) => {
      toast({
        title: 'Failed to duplicate event',
        description: error.message || 'An error occurred while duplicating the event.',
        variant: 'destructive',
      })
    },
  })

  const handleEdit = () => {
    router.push(`/events/${eventId}/edit`)
  }

  const handleDeleteClick = () => {
    setShowDeleteDialog(true)
  }

  const handleDeleteConfirm = () => {
    deleteMutation.mutate(eventId)
  }

  const handleDeleteCancel = () => {
    setShowDeleteDialog(false)
  }

  const handleDuplicateClick = () => {
    setShowDuplicateDialog(true)
  }

  const handleDuplicateConfirm = (_customName?: string) => {
    // Note: customName parameter available for future enhancement
    duplicateMutation.mutate(eventId)
  }

  const handleDuplicateCancel = () => {
    setShowDuplicateDialog(false)
  }

  return (
    <>
      <div className={cn('flex flex-wrap gap-2', className)}>
        {/* Status Dropdown */}
        {showStatusDropdown && event && (
          <EventStatusDropdown event={event} />
        )}

        {/* Edit Button */}
        <Button
          variant="default"
          size="md"
          onClick={handleEdit}
          className="gap-2"
          aria-label="Edit event"
        >
          <Edit className="h-4 w-4" />
          <span className="hidden sm:inline">Edit</span>
        </Button>

        {/* Duplicate Button */}
        <Button
          variant="outline"
          size="md"
          onClick={handleDuplicateClick}
          disabled={duplicateMutation.isPending}
          className="gap-2"
          aria-label="Duplicate event"
        >
          <Copy className="h-4 w-4" />
          <span className="hidden sm:inline">
            {duplicateMutation.isPending ? 'Duplicating...' : 'Duplicate'}
          </span>
        </Button>

        {/* Share Button */}
        <ShareEventButton eventId={eventId} eventName={eventName} />

        {/* Delete Button */}
        <Button
          variant="outline"
          size="md"
          onClick={handleDeleteClick}
          disabled={deleteMutation.isPending}
          className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950 border-red-200 dark:border-red-800"
          aria-label="Delete event"
        >
          <Trash2 className="h-4 w-4" />
          <span className="hidden sm:inline">
            {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
          </span>
        </Button>
      </div>

      {/* Delete Dialog */}
      <DeleteEventDialog
        isOpen={showDeleteDialog}
        event={event || null}
        isDeleting={deleteMutation.isPending}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />

      {/* Duplicate Dialog */}
      <DuplicateEventDialog
        isOpen={showDuplicateDialog}
        event={event || null}
        isDuplicating={duplicateMutation.isPending}
        onConfirm={handleDuplicateConfirm}
        onCancel={handleDuplicateCancel}
      />
    </>
  )
}
