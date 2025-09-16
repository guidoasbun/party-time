/**
 * Navigation utilities and configuration
 */

import {
  Home,
  Calendar,
  Users,
  MapPin,
  DollarSign,
  Settings,
  Plus,
  List,
  User,
  type LucideIcon,
} from 'lucide-react'

export interface NavigationItem {
  id: string
  label: string
  href: string
  icon: LucideIcon
  description?: string
  children?: NavigationItem[]
  requiresAuth?: boolean
  badge?: string | number
}

export interface BreadcrumbItem {
  label: string
  href?: string
  isActive?: boolean
}

// Main navigation configuration
export const navigationConfig: NavigationItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    href: '/dashboard',
    icon: Home,
    description: 'Overview and statistics',
    requiresAuth: true,
  },
  {
    id: 'events',
    label: 'Events',
    href: '/events',
    icon: Calendar,
    description: 'Manage your events',
    requiresAuth: true,
    children: [
      {
        id: 'events-list',
        label: 'All Events',
        href: '/events',
        icon: List,
        description: 'View all events',
      },
      {
        id: 'events-create',
        label: 'Create Event',
        href: '/events/new',
        icon: Plus,
        description: 'Plan a new event',
      },
    ],
  },
  {
    id: 'guests',
    label: 'Guests',
    href: '/guests',
    icon: Users,
    description: 'Manage guest lists',
    requiresAuth: true,
  },
  {
    id: 'venues',
    label: 'Venues',
    href: '/venues',
    icon: MapPin,
    description: 'Find and manage venues',
    requiresAuth: true,
  },
  {
    id: 'budget',
    label: 'Budget',
    href: '/budget',
    icon: DollarSign,
    description: 'Track expenses and budget',
    requiresAuth: true,
  },
  {
    id: 'profile',
    label: 'Profile',
    href: '/profile',
    icon: User,
    description: 'User profile settings',
    requiresAuth: true,
  },
  {
    id: 'settings',
    label: 'Settings',
    href: '/settings',
    icon: Settings,
    description: 'Application settings',
    requiresAuth: true,
  },
]

/**
 * Get active navigation item based on current pathname
 */
export function getActiveNavItem(pathname: string): NavigationItem | null {
  // Direct match first
  for (const item of navigationConfig) {
    if (item.href === pathname) {
      return item
    }

    // Check children
    if (item.children) {
      for (const child of item.children) {
        if (child.href === pathname) {
          return child
        }
      }
    }
  }

  // Partial match for nested routes
  for (const item of navigationConfig) {
    if (pathname.startsWith(item.href) && item.href !== '/') {
      // Check if there's a more specific child match
      if (item.children) {
        for (const child of item.children) {
          if (pathname.startsWith(child.href)) {
            return child
          }
        }
      }
      return item
    }
  }

  return null
}

/**
 * Generate breadcrumb items from pathname
 */
export function generateBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const breadcrumbs: BreadcrumbItem[] = []
  const segments = pathname.split('/').filter(Boolean)

  // Always start with home/dashboard
  if (pathname !== '/' && pathname !== '/dashboard') {
    breadcrumbs.push({
      label: 'Dashboard',
      href: '/dashboard',
    })
  }

  let currentPath = ''
  for (let i = 0; i < segments.length; i++) {
    currentPath += `/${segments[i]}`
    const isLast = i === segments.length - 1

    // Find navigation item for this path
    const navItem = getActiveNavItem(currentPath)

    if (navItem) {
      breadcrumbs.push({
        label: navItem.label,
        href: isLast ? undefined : currentPath,
        isActive: isLast,
      })
    } else {
      // Handle dynamic routes (e.g., /events/123, /events/123/edit)
      const parentPath = currentPath.substring(0, currentPath.lastIndexOf('/'))
      const parentItem = getActiveNavItem(parentPath)

      if (parentItem && segments[i]) {
        // Try to format the segment nicely
        let label = segments[i]

        // Common route patterns
        if (label === 'new') {
          label = 'Create New'
        } else if (label === 'edit') {
          label = 'Edit'
        } else if (label === 'settings') {
          label = 'Settings'
        } else if (label.length > 20) {
          // Truncate long IDs
          label = `${label.substring(0, 8)}...`
        }

        breadcrumbs.push({
          label: formatBreadcrumbLabel(label),
          href: isLast ? undefined : currentPath,
          isActive: isLast,
        })
      }
    }
  }

  return breadcrumbs
}

/**
 * Format breadcrumb label for display
 */
function formatBreadcrumbLabel(segment: string): string {
  // Replace hyphens and underscores with spaces and capitalize
  return segment
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

/**
 * Check if a navigation item is active based on current pathname
 */
export function isNavItemActive(item: NavigationItem, pathname: string): boolean {
  // Exact match
  if (item.href === pathname) {
    return true
  }

  // For parent items, check if any child is active
  if (item.children) {
    return item.children.some(child => isNavItemActive(child, pathname))
  }

  // Partial match for nested routes (but not root)
  if (item.href !== '/' && pathname.startsWith(item.href)) {
    return true
  }

  return false
}

/**
 * Get navigation item by ID
 */
export function getNavItemById(id: string): NavigationItem | null {
  for (const item of navigationConfig) {
    if (item.id === id) {
      return item
    }

    if (item.children) {
      const child = item.children.find(child => child.id === id)
      if (child) {
        return child
      }
    }
  }

  return null
}

/**
 * Get parent navigation item for a given item ID
 */
export function getParentNavItem(itemId: string): NavigationItem | null {
  for (const item of navigationConfig) {
    if (item.children?.some(child => child.id === itemId)) {
      return item
    }
  }

  return null
}

/**
 * Check if user has permission to access a navigation item
 */
export function hasNavPermission(item: NavigationItem, isAuthenticated: boolean): boolean {
  if (item.requiresAuth && !isAuthenticated) {
    return false
  }

  // Add more permission checks here as needed
  // e.g., role-based access, feature flags, etc.

  return true
}