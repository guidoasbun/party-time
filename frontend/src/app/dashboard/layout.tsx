'use client'

/**
 * Dashboard layout with navigation
 */

import React, { useEffect, useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { NavigationProvider } from '@/contexts/NavigationContext'
import { Navigation } from '@/components/layout/Navigation'
import { MobileBottomNav } from '@/components/layout/MobileBottomNav'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { useSidebar } from '@/contexts/NavigationContext'
import { cn } from '@/lib/utils'
import { UserProfileResponse } from '@/types/auth.types'

interface DashboardLayoutProps {
  children: React.ReactNode
}

function DashboardLayoutContent({ children }: DashboardLayoutProps) {
  const { collapsed } = useSidebar()
  const { data: session, status } = useSession()
  const router = useRouter()
  const [userInfo, setUserInfo] = useState<UserProfileResponse | null>(null)
  const [loading, setLoading] = useState(true)

  // Fetch user information
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
      return
    }

    if (status === "authenticated" && session?.idToken) {
      const fetchUserInfo = async () => {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/me`, {
            headers: {
              "Authorization": `Bearer ${session.idToken}`,
              "Content-Type": "application/json",
            },
          })

          if (response.ok) {
            const data = await response.json()
            setUserInfo(data)
          }
        } catch (error) {
          console.error("Error fetching user info:", error)
        } finally {
          setLoading(false)
        }
      }

      fetchUserInfo()
    }
  }, [status, session?.idToken, router])

  // Loading state
  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center px-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Redirect if unauthenticated
  if (status === "unauthenticated" || !userInfo) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Sidebar */}
      <Navigation />

      {/* Main Content Area */}
      <div
        className={cn(
          "transition-all duration-300",
          "lg:pl-64", // Default sidebar width
          collapsed && "lg:pl-16" // Collapsed sidebar width
        )}
      >
        {/* Dashboard Header */}
        <DashboardHeader
          user={userInfo}
          onSignOut={() => signOut({ callbackUrl: "/" })}
        />

        <main className="flex-1 pb-20 lg:pb-0">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </div>
  )
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { status } = useSession()
  const isAuthenticated = status === 'authenticated'

  return (
    <NavigationProvider isAuthenticated={isAuthenticated}>
      <DashboardLayoutContent>
        {children}
      </DashboardLayoutContent>
    </NavigationProvider>
  )
}