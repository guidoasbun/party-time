'use client'

/**
 * Guest List Page
 * Full-page guest management interface for event organizers
 */

import React from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { GuestList } from '@/components/guests/GuestList'
import { ErrorMessage } from '@/components/ui/ErrorMessage'
import { useQuery } from '@tanstack/react-query'
import { guestsService } from '@/lib/api/services'
import type { UUID, PaginatedResponse, Guest } from '@/types'

export default function GuestsPage() {
  const params = useParams()
  const router = useRouter()
  const eventId = params?.id as UUID

  // Fetch guests using React Query
  const {
    data: guestsResponse,
    isLoading,
    error,
    refetch
  } = useQuery<PaginatedResponse<Guest>>({
    queryKey: ['guests', eventId],
    queryFn: () => guestsService.getGuests(eventId),
    enabled: !!eventId,
    staleTime: 2 * 60 * 1000 // 2 minutes
  })

  const guests = guestsResponse?.items || []
  const totalCount = guestsResponse?.total || 0

  // Error state
  if (error && !isLoading) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="space-y-6">
          {/* Breadcrumb */}
          <Breadcrumb />

          {/* Error message */}
          <ErrorMessage
            title="Failed to load guests"
            message={
              error instanceof Error
                ? error.message
                : 'Unable to load guest list. Please try again.'
            }
            onRetry={() => {
              void refetch()
            }}
          />

          {/* Back button */}
          <div className="flex justify-center">
            <button
              onClick={() => router.push(`/events/${eventId}`)}
              className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              ← Back to Event Details
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="space-y-6">
        {/* Breadcrumb Navigation */}
        <Breadcrumb />

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Guest Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage your event guest list, RSVPs, and invitations
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push(`/events/${eventId}`)}
              className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors"
            >
              ← Back to Event
            </button>
          </div>
        </div>

        {/* Guest Statistics Cards */}
        {!isLoading && guests.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Guests */}
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Guests</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{totalCount}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                  <svg
                    className="h-6 w-6 text-blue-600 dark:text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Attending */}
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Attending</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                    {guests.filter((g) => g.rsvp_status === 'attending').length}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                  <svg
                    className="h-6 w-6 text-green-600 dark:text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Pending */}
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
                    {guests.filter((g) => g.rsvp_status === 'pending').length}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center">
                  <svg
                    className="h-6 w-6 text-amber-600 dark:text-amber-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Not Attending */}
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Declined</p>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
                    {guests.filter((g) => g.rsvp_status === 'not_attending').length}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
                  <svg
                    className="h-6 w-6 text-red-600 dark:text-red-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Guest List Component */}
        <GuestList
          eventId={eventId}
          guests={guests}
          isLoading={isLoading}
          error={error ? (error as Error) : null}
          totalCount={totalCount}
          onRefresh={() => {
            void refetch()
          }}
        />
      </div>
    </div>
  )
}
