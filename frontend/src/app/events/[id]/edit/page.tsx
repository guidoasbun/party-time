'use client'

import * as React from 'react'
import { useParams, useRouter } from 'next/navigation'
import { EventEditForm } from '@/components/events/EventEditForm'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export default function EditEventPage() {
  const params = useParams()
  const router = useRouter()
  const eventId = params.id as string

  const handleSuccess = React.useCallback((id: string) => {
    // Navigate to the event detail page after successful update
    router.push(`/events/${id}`)
  }, [router])

  const handleCancel = React.useCallback(() => {
    // Navigate back to the event detail page without saving
    router.push(`/events/${eventId}`)
  }, [router, eventId])

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/events/${eventId}`)}
          className="mb-4 -ml-2"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Event
        </Button>

        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Event</h1>
          <p className="text-muted-foreground mt-2">
            Update your event details and settings
          </p>
        </div>
      </div>

      {/* Edit Form */}
      <EventEditForm
        eventId={eventId}
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </div>
  )
}
