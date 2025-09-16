'use client'

/**
 * Navigation context for managing navigation state across the application
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import {
  NavigationItem,
  BreadcrumbItem,
  navigationConfig,
  getActiveNavItem,
  generateBreadcrumbs,
  isNavItemActive,
  hasNavPermission
} from '@/lib/navigation'

interface NavigationContextType {
  // Navigation state
  activeItem: NavigationItem | null
  breadcrumbs: BreadcrumbItem[]
  sidebarCollapsed: boolean
  mobileMenuOpen: boolean

  // Navigation actions
  setSidebarCollapsed: (collapsed: boolean) => void
  setMobileMenuOpen: (open: boolean) => void
  toggleSidebar: () => void
  toggleMobileMenu: () => void
  closeMobileMenu: () => void

  // Navigation helpers
  isItemActive: (item: NavigationItem) => boolean
  hasPermission: (item: NavigationItem) => boolean
  getFilteredNavigation: () => NavigationItem[]
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined)

interface NavigationProviderProps {
  children: React.ReactNode
  isAuthenticated?: boolean
}

export function NavigationProvider({ children, isAuthenticated = false }: NavigationProviderProps) {
  const pathname = usePathname()

  // Navigation state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeItem, setActiveItem] = useState<NavigationItem | null>(null)
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([])

  // Update active item and breadcrumbs when pathname changes
  useEffect(() => {
    const active = getActiveNavItem(pathname)
    setActiveItem(active)

    const crumbs = generateBreadcrumbs(pathname)
    setBreadcrumbs(crumbs)
  }, [pathname])

  // Close mobile menu when navigating
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  // Handle window resize - collapse sidebar on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) { // lg breakpoint
        setSidebarCollapsed(true)
        setMobileMenuOpen(false)
      } else {
        setMobileMenuOpen(false)
      }
    }

    // Set initial state
    handleResize()

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Navigation actions
  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed(prev => !prev)
  }, [])

  const toggleMobileMenu = useCallback(() => {
    setMobileMenuOpen(prev => !prev)
  }, [])

  const closeMobileMenu = useCallback(() => {
    setMobileMenuOpen(false)
  }, [])

  // Navigation helpers
  const isItemActive = useCallback((item: NavigationItem) => {
    return isNavItemActive(item, pathname)
  }, [pathname])

  const hasPermission = useCallback((item: NavigationItem) => {
    return hasNavPermission(item, isAuthenticated)
  }, [isAuthenticated])

  const getFilteredNavigation = useCallback(() => {
    return navigationConfig.filter(item => hasPermission(item))
  }, [hasPermission])

  const value: NavigationContextType = {
    // State
    activeItem,
    breadcrumbs,
    sidebarCollapsed,
    mobileMenuOpen,

    // Actions
    setSidebarCollapsed,
    setMobileMenuOpen,
    toggleSidebar,
    toggleMobileMenu,
    closeMobileMenu,

    // Helpers
    isItemActive,
    hasPermission,
    getFilteredNavigation,
  }

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  )
}

/**
 * Hook to use navigation context
 */
export function useNavigation() {
  const context = useContext(NavigationContext)

  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider')
  }

  return context
}

/**
 * Hook to get current breadcrumbs
 */
export function useBreadcrumbs() {
  const { breadcrumbs } = useNavigation()
  return breadcrumbs
}

/**
 * Hook to get active navigation item
 */
export function useActiveNavItem() {
  const { activeItem } = useNavigation()
  return activeItem
}

/**
 * Hook to manage sidebar state
 */
export function useSidebar() {
  const {
    sidebarCollapsed,
    setSidebarCollapsed,
    toggleSidebar,
    mobileMenuOpen,
    setMobileMenuOpen,
    toggleMobileMenu,
    closeMobileMenu
  } = useNavigation()

  return {
    collapsed: sidebarCollapsed,
    setCollapsed: setSidebarCollapsed,
    toggle: toggleSidebar,
    mobileOpen: mobileMenuOpen,
    setMobileOpen: setMobileMenuOpen,
    toggleMobile: toggleMobileMenu,
    closeMobile: closeMobileMenu,
  }
}