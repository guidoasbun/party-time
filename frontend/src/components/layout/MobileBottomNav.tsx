'use client'

/**
 * Mobile Bottom Navigation
 * Phase 8.2: UI Polish - Quick actions navigation for mobile devices
 */

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  Calendar,
  Plus,
  Users,
  MoreHorizontal,
  Settings,
  HelpCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavItem {
  id: string
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  isAction?: boolean
}

const navItems: NavItem[] = [
  {
    id: 'home',
    label: 'Home',
    href: '/dashboard',
    icon: Home,
  },
  {
    id: 'events',
    label: 'Events',
    href: '/events',
    icon: Calendar,
  },
  {
    id: 'create',
    label: 'Create',
    href: '/events/new',
    icon: Plus,
    isAction: true,
  },
  {
    id: 'guests',
    label: 'Guests',
    href: '/events', // Will show guest-related content
    icon: Users,
  },
  {
    id: 'more',
    label: 'More',
    href: '#more',
    icon: MoreHorizontal,
  },
]

interface MobileBottomNavProps {
  className?: string
}

export function MobileBottomNav({ className }: MobileBottomNavProps) {
  const pathname = usePathname()
  const [showMore, setShowMore] = React.useState(false)

  // Check if current path matches nav item
  const isActive = (href: string): boolean => {
    if (href === '/dashboard') {
      return pathname === '/dashboard'
    }
    if (href === '/events') {
      return pathname === '/events' || pathname.startsWith('/events/')
    }
    return pathname === href
  }

  // Handle "More" menu
  const handleMoreClick = (e: React.MouseEvent) => {
    e.preventDefault()
    setShowMore(!showMore)
  }

  // Close more menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = () => setShowMore(false)
    if (showMore) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [showMore])

  return (
    <>
      {/* More Menu Popover */}
      {showMore && (
        <div
          className="fixed bottom-20 right-4 z-50 w-48 bg-card border border-border rounded-lg shadow-lg animate-slideInUp lg:hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="py-2">
            <Link
              href="/settings"
              className="flex items-center gap-3 px-4 py-3 text-sm text-card-foreground hover:bg-muted transition-colors"
              onClick={() => setShowMore(false)}
            >
              <Settings className="h-5 w-5 text-muted-foreground" />
              Settings
            </Link>
            <Link
              href="/help"
              className="flex items-center gap-3 px-4 py-3 text-sm text-card-foreground hover:bg-muted transition-colors"
              onClick={() => setShowMore(false)}
            >
              <HelpCircle className="h-5 w-5 text-muted-foreground" />
              Help & Support
            </Link>
          </div>
        </div>
      )}

      {/* Bottom Navigation Bar */}
      <nav
        className={cn(
          'fixed bottom-0 left-0 right-0 z-40 lg:hidden',
          'bg-card border-t border-border',
          'safe-area-bottom',
          className
        )}
        role="navigation"
        aria-label="Mobile navigation"
      >
        <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            const isMore = item.id === 'more'

            // Create action button (center plus button)
            if (item.isAction) {
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={cn(
                    'flex items-center justify-center',
                    'w-14 h-14 -mt-5',
                    'bg-primary text-primary-foreground',
                    'rounded-full shadow-lg',
                    'hover:bg-primary/90 hover:scale-105',
                    'active:scale-95',
                    'transition-all duration-200',
                    'touch-manipulation'
                  )}
                  aria-label={item.label}
                >
                  <Icon className="h-6 w-6" />
                </Link>
              )
            }

            // Handle "More" button separately
            if (isMore) {
              return (
                <button
                  key={item.id}
                  onClick={handleMoreClick}
                  className={cn(
                    'flex flex-col items-center justify-center gap-1',
                    'min-w-[64px] min-h-[48px] py-2 px-1',
                    'rounded-lg transition-colors duration-150',
                    'touch-manipulation',
                    showMore
                      ? 'text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  )}
                  aria-label={item.label}
                  aria-expanded={showMore}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-xs font-medium">{item.label}</span>
                </button>
              )
            }

            // Regular nav items
            return (
              <Link
                key={item.id}
                href={item.href}
                className={cn(
                  'flex flex-col items-center justify-center gap-1',
                  'min-w-[64px] min-h-[48px] py-2 px-1',
                  'rounded-lg transition-colors duration-150',
                  'touch-manipulation',
                  active
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                )}
                aria-current={active ? 'page' : undefined}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Spacer to prevent content from being hidden behind nav */}
      <div className="h-16 lg:hidden" aria-hidden="true" />
    </>
  )
}

// Export a version without the spacer for custom layouts
export function MobileBottomNavBar({ className }: MobileBottomNavProps) {
  const pathname = usePathname()

  const isActive = (href: string): boolean => {
    if (href === '/dashboard') {
      return pathname === '/dashboard'
    }
    if (href === '/events') {
      return pathname === '/events' || pathname.startsWith('/events/')
    }
    return pathname === href
  }

  return (
    <nav
      className={cn(
        'fixed bottom-0 left-0 right-0 z-40 lg:hidden',
        'bg-card border-t border-border',
        className
      )}
      role="navigation"
      aria-label="Mobile navigation"
    >
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {navItems.slice(0, 4).map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)

          if (item.isAction) {
            return (
              <Link
                key={item.id}
                href={item.href}
                className={cn(
                  'flex items-center justify-center',
                  'w-12 h-12 -mt-4',
                  'bg-primary text-primary-foreground',
                  'rounded-full shadow-lg',
                  'hover:bg-primary/90',
                  'transition-colors duration-200',
                  'touch-manipulation'
                )}
                aria-label={item.label}
              >
                <Icon className="h-6 w-6" />
              </Link>
            )
          }

          return (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1',
                'min-w-[56px] min-h-[44px] py-2 px-1',
                'transition-colors duration-150',
                'touch-manipulation',
                active
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
              aria-current={active ? 'page' : undefined}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
