'use client'

/**
 * Event action buttons component
 * Displays edit, delete, duplicate, and share actions
 */

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Edit, Trash2, Copy, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useDeleteEvent, useDuplicateEvent } from '@/hooks/api/useEvents'
import { useConfirmation } from '@/hooks/useConfirmation'
import { useToast } from '@/hooks/useToast'
import { cn } from '@/lib/utils'
import type { UUID } from '@/types'

interface EventActionButtonsProps {
  eventId: UUID
  eventName: string
  className?: string
  onDeleteSuccess?: () => void
  onDuplicateSuccess?: (newEventId: UUID) => void
}

export function EventActionButtons({
  eventId,
  eventName,
  className,
  onDeleteSuccess,
  onDuplicateSuccess,
}: EventActionButtonsProps) {
  const router = useRouter()
  const { toast } = useToast()
  const { showConfirmation } = useConfirmation()
  const [isCopying, setIsCopying] = useState(false)

  const deleteMutation = useDeleteEvent({
    onSuccess: () => {
      toast({
        title: 'Event deleted',
        description: `${eventName} has been deleted successfully.`,
        variant: 'success',
      })
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

  const handleDelete = async () => {
    const confirmed = await showConfirmation({
      title: 'Delete Event',
      description: `Are you sure you want to delete "${eventName}"? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'destructive',
    })

    if (confirmed) {
      deleteMutation.mutate(eventId)
    }
  }

  const handleDuplicate = async () => {
    const confirmed = await showConfirmation({
      title: 'Duplicate Event',
      description: `Create a copy of "${eventName}"?`,
      confirmText: 'Duplicate',
      cancelText: 'Cancel',
    })

    if (confirmed) {
      duplicateMutation.mutate(eventId)
    }
  }

  const handleShare = async () => {
    setIsCopying(true)
    const eventUrl = `${window.location.origin}/events/${eventId}`

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(eventUrl)
        toast({
          title: 'Link copied',
          description: 'Event link has been copied to clipboard.',
          variant: 'success',
        })
      } else {
        // Fallback for non-secure contexts
        const textArea = document.createElement('textarea')
        textArea.value = eventUrl
        textArea.style.position = 'fixed'
        textArea.style.left = '-999999px'
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
        toast({
          title: 'Link copied',
          description: 'Event link has been copied to clipboard.',
          variant: 'success',
        })
      }
    } catch {
      toast({
        title: 'Failed to copy link',
        description: 'Please copy the URL from your browser address bar.',
        variant: 'destructive',
      })
    } finally {
      setIsCopying(false)
    }
  }

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
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

      <Button
        variant="outline"
        size="md"
        onClick={handleDuplicate}
        disabled={duplicateMutation.isPending}
        className="gap-2"
        aria-label="Duplicate event"
      >
        <Copy className="h-4 w-4" />
        <span className="hidden sm:inline">
          {duplicateMutation.isPending ? 'Duplicating...' : 'Duplicate'}
        </span>
      </Button>

      <Button
        variant="outline"
        size="md"
        onClick={handleShare}
        disabled={isCopying}
        className="gap-2"
        aria-label="Share event"
      >
        <Share2 className="h-4 w-4" />
        <span className="hidden sm:inline">
          {isCopying ? 'Copying...' : 'Share'}
        </span>
      </Button>

      <Button
        variant="outline"
        size="md"
        onClick={handleDelete}
        disabled={deleteMutation.isPending}
        className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
        aria-label="Delete event"
      >
        <Trash2 className="h-4 w-4" />
        <span className="hidden sm:inline">
          {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
        </span>
      </Button>
    </div>
  )
}
