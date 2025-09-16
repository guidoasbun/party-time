'use client'

import { format } from 'date-fns'
import { LogOut, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { UserProfileResponse } from '@/types/auth.types'
import { cn } from '@/lib/utils'

interface DashboardHeaderProps {
  user: UserProfileResponse
  onSignOut: () => void
  className?: string
}

function getGreeting(): string {
  const hour = new Date().getHours()

  if (hour < 12) {
    return 'Good morning'
  } else if (hour < 17) {
    return 'Good afternoon'
  } else {
    return 'Good evening'
  }
}

export function DashboardHeader({ user, onSignOut, className }: DashboardHeaderProps) {
  const greeting = getGreeting()
  const currentDate = format(new Date(), 'EEEE, MMMM do, yyyy')

  return (
    <div className={cn(
      "bg-white border-b border-gray-200 px-6 py-6",
      className
    )}>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Greeting and Date */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              {greeting}, {user.name || user.email || 'User'}!
            </h1>
            <div className="flex items-center gap-2 mt-2 text-gray-600">
              <Calendar className="h-4 w-4" />
              <p className="text-sm">{currentDate}</p>
            </div>
          </div>

          {/* User Info and Actions */}
          <div className="flex items-center gap-4">
            {/* User Badge */}
            <div className="hidden sm:flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user.name ? user.name.charAt(0).toUpperCase() : user.email ? user.email.charAt(0).toUpperCase() : '?'}
                </span>
              </div>
              <div className="text-sm">
                <p className="font-medium text-gray-900">{user.name || user.email || 'User'}</p>
                <p className="text-gray-500">{user.email}</p>
              </div>
            </div>

            {/* Sign Out Button */}
            <Button
              variant="outline"
              onClick={onSignOut}
              className="gap-2"
              size="sm"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>

        {/* Optional: User verification status */}
        {!user.email_verified && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-amber-400 rounded-full" />
              <p className="text-sm text-amber-800">
                Please verify your email address to access all features.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}