'use client'

/**
 * GuestOverview Component
 * Comprehensive guest analytics dashboard with statistics, charts, and export functionality
 */

import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { RSVPChart } from './RSVPChart'
import { ExportGuests } from './ExportGuests'
import { guestsService } from '@/lib/api/services'
import { Guest, GuestStats, UUID, RsvpStatus } from '@/types'
import { cn } from '@/lib/utils'
import { Users, UserCheck, Clock, UserX, UserPlus, Utensils } from 'lucide-react'

interface GuestOverviewProps {
  eventId: UUID
  eventName?: string
  guests: Guest[]
  className?: string
}

interface StatCardProps {
  title: string
  value: number | string
  icon: React.ReactNode
  color: 'blue' | 'green' | 'amber' | 'red' | 'purple' | 'gray'
  subtitle?: string
  className?: string
}

function StatCard({ title, value, icon, color, subtitle, className }: StatCardProps) {
  const colorClasses = {
    blue: {
      bg: 'bg-blue-100 dark:bg-blue-900/30',
      icon: 'text-blue-600 dark:text-blue-400',
      text: 'text-blue-600 dark:text-blue-400'
    },
    green: {
      bg: 'bg-green-100 dark:bg-green-900/30',
      icon: 'text-green-600 dark:text-green-400',
      text: 'text-green-600 dark:text-green-400'
    },
    amber: {
      bg: 'bg-amber-100 dark:bg-amber-900/30',
      icon: 'text-amber-600 dark:text-amber-400',
      text: 'text-amber-600 dark:text-amber-400'
    },
    red: {
      bg: 'bg-red-100 dark:bg-red-900/30',
      icon: 'text-red-600 dark:text-red-400',
      text: 'text-red-600 dark:text-red-400'
    },
    purple: {
      bg: 'bg-purple-100 dark:bg-purple-900/30',
      icon: 'text-purple-600 dark:text-purple-400',
      text: 'text-purple-600 dark:text-purple-400'
    },
    gray: {
      bg: 'bg-gray-100 dark:bg-gray-900/30',
      icon: 'text-gray-600 dark:text-gray-400',
      text: 'text-gray-600 dark:text-gray-400'
    }
  }

  const colors = colorClasses[color]

  return (
    <Card className={cn('transition-all hover:shadow-md', className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground mb-1">
              {title}
            </p>
            <p className={cn('text-3xl font-bold', colors.text)}>
              {value}
            </p>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-1">
                {subtitle}
              </p>
            )}
          </div>
          <div className={cn('h-12 w-12 rounded-full flex items-center justify-center', colors.bg)}>
            <div className={colors.icon}>
              {icon}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function GuestOverview({ eventId, eventName, guests, className }: GuestOverviewProps) {
  // Fetch guest statistics from backend
  const {
    data: stats,
    isLoading: isStatsLoading,
    error: statsError
  } = useQuery<GuestStats>({
    queryKey: ['guest-stats', eventId],
    queryFn: () => guestsService.getGuestStats(eventId),
    staleTime: 2 * 60 * 1000, // 2 minutes
  })

  // Fetch dietary restrictions
  const {
    data: dietaryGuests,
    isLoading: isDietaryLoading
  } = useQuery<Guest[]>({
    queryKey: ['dietary-restrictions', eventId],
    queryFn: () => guestsService.getDietaryRestrictions(eventId),
    staleTime: 2 * 60 * 1000, // 2 minutes
  })

  // Calculate client-side statistics
  const totalGuests = guests.length
  const attendingGuests = guests.filter(g => g.rsvp_status === RsvpStatus.ATTENDING).length
  const notAttendingGuests = guests.filter(g => g.rsvp_status === RsvpStatus.NOT_ATTENDING).length
  const maybeGuests = guests.filter(g => g.rsvp_status === RsvpStatus.MAYBE).length
  const pendingGuests = guests.filter(g => g.rsvp_status === RsvpStatus.PENDING).length

  const plusOnesAllowed = guests.filter(g => g.plus_one_allowed).length
  const plusOnesConfirmed = guests.filter(g => g.plus_one_allowed && g.plus_one_name).length

  const responsesReceived = attendingGuests + notAttendingGuests + maybeGuests
  const responseRate = totalGuests > 0 ? Math.round((responsesReceived / totalGuests) * 100) : 0

  const dietaryCount = dietaryGuests?.length || 0

  // Loading state
  if (isStatsLoading || isDietaryLoading) {
    return (
      <div className={cn('space-y-6', className)}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  // Error state
  if (statsError) {
    return (
      <div className={cn('p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg', className)}>
        <p className="text-red-600 dark:text-red-400 font-medium">
          Failed to load guest statistics
        </p>
        <p className="text-sm text-red-500 dark:text-red-500 mt-1">
          {statsError instanceof Error ? statsError.message : 'An error occurred'}
        </p>
      </div>
    )
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Guests"
          value={totalGuests}
          icon={<Users className="h-6 w-6" />}
          color="blue"
          subtitle="Invited to event"
        />

        <StatCard
          title="Attending"
          value={attendingGuests}
          icon={<UserCheck className="h-6 w-6" />}
          color="green"
          subtitle={`${totalGuests > 0 ? Math.round((attendingGuests / totalGuests) * 100) : 0}% of total`}
        />

        <StatCard
          title="Pending"
          value={pendingGuests}
          icon={<Clock className="h-6 w-6" />}
          color="amber"
          subtitle="Awaiting response"
        />

        <StatCard
          title="Declined"
          value={notAttendingGuests}
          icon={<UserX className="h-6 w-6" />}
          color="red"
          subtitle={`${totalGuests > 0 ? Math.round((notAttendingGuests / totalGuests) * 100) : 0}% of total`}
        />
      </div>

      {/* Secondary Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          title="Response Rate"
          value={`${responseRate}%`}
          icon={<UserCheck className="h-6 w-6" />}
          color="purple"
          subtitle={`${responsesReceived} of ${totalGuests} responded`}
        />

        <StatCard
          title="Plus Ones"
          value={`${plusOnesConfirmed}/${plusOnesAllowed}`}
          icon={<UserPlus className="h-6 w-6" />}
          color="blue"
          subtitle={`${plusOnesConfirmed} confirmed`}
        />

        <StatCard
          title="Dietary Restrictions"
          value={dietaryCount}
          icon={<Utensils className="h-6 w-6" />}
          color="amber"
          subtitle={`${totalGuests > 0 ? Math.round((dietaryCount / totalGuests) * 100) : 0}% of guests`}
        />
      </div>

      {/* RSVP Chart and Dietary Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* RSVP Breakdown Chart */}
        <Card>
          <CardHeader>
            <CardTitle>RSVP Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <RSVPChart
              attending={attendingGuests}
              notAttending={notAttendingGuests}
              maybe={maybeGuests}
              pending={pendingGuests}
            />
          </CardContent>
        </Card>

        {/* Dietary Restrictions Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Dietary Restrictions</CardTitle>
          </CardHeader>
          <CardContent>
            {dietaryCount === 0 ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-muted-foreground text-center">
                  No dietary restrictions reported
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground mb-4">
                  {dietaryCount} {dietaryCount === 1 ? 'guest has' : 'guests have'} dietary restrictions
                </p>
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {dietaryGuests?.map((guest) => (
                    <div
                      key={guest.id}
                      className="p-3 bg-muted/50 rounded-lg border border-border"
                    >
                      <p className="font-medium text-sm text-foreground">
                        {guest.first_name} {guest.last_name}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {guest.dietary_restrictions}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Export Options */}
      <Card>
        <CardHeader>
          <CardTitle>Export Guest List</CardTitle>
        </CardHeader>
        <CardContent>
          <ExportGuests
            guests={guests}
            eventId={eventId}
            eventName={eventName}
          />
        </CardContent>
      </Card>
    </div>
  )
}
