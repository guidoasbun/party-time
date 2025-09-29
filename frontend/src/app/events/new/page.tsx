'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { EventForm } from '@/components/events/EventForm'

export default function NewEventPage() {
  const router = useRouter()

  // Handle successful event creation
  const handleSuccess = React.useCallback((eventId: string) => {
    // Navigate to the newly created event
    router.push?.(`/events/${eventId}`)
  }, [router])

  // Handle cancellation - go back to events list
  const handleCancel = React.useCallback(() => {
    router.push?.('/events')
  }, [router])

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Create New Event</h1>
          <p className="text-muted-foreground mt-2">
            Let&apos;s create an amazing event! Fill out the details below to get started.
          </p>
        </div>

        <EventForm
          formId="new-event"
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </div>
    </div>
  )
}