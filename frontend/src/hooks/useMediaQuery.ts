'use client'

import { useState, useEffect, useCallback } from 'react'

/**
 * Hook to detect if a media query matches
 * @param query - CSS media query string (e.g., '(min-width: 768px)')
 * @returns boolean indicating if the query matches
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const mediaQuery = window.matchMedia(query)
    setMatches(mediaQuery.matches)

    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [query])

  return matches
}

/**
 * Tailwind CSS breakpoints
 * sm: 640px, md: 768px, lg: 1024px, xl: 1280px, 2xl: 1536px
 */
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const

export type Breakpoint = keyof typeof BREAKPOINTS

export interface BreakpointState {
  /** Screen width < 640px */
  isMobile: boolean
  /** Screen width >= 640px and < 1024px */
  isTablet: boolean
  /** Screen width >= 1024px */
  isDesktop: boolean
  /** Screen width >= 1280px */
  isLargeDesktop: boolean
  /** Current breakpoint name */
  breakpoint: Breakpoint | 'xs'
}

/**
 * Hook to get current breakpoint state
 * @returns Object with boolean flags for each breakpoint range
 */
export function useBreakpoints(): BreakpointState {
  const [state, setState] = useState<BreakpointState>({
    isMobile: true,
    isTablet: false,
    isDesktop: false,
    isLargeDesktop: false,
    breakpoint: 'xs',
  })

  useEffect(() => {
    if (typeof window === 'undefined') return

    const updateBreakpoints = () => {
      const width = window.innerWidth
      const isMobile = width < BREAKPOINTS.sm
      const isTablet = width >= BREAKPOINTS.sm && width < BREAKPOINTS.lg
      const isDesktop = width >= BREAKPOINTS.lg
      const isLargeDesktop = width >= BREAKPOINTS.xl

      let breakpoint: Breakpoint | 'xs' = 'xs'
      if (width >= BREAKPOINTS['2xl']) breakpoint = '2xl'
      else if (width >= BREAKPOINTS.xl) breakpoint = 'xl'
      else if (width >= BREAKPOINTS.lg) breakpoint = 'lg'
      else if (width >= BREAKPOINTS.md) breakpoint = 'md'
      else if (width >= BREAKPOINTS.sm) breakpoint = 'sm'

      setState({ isMobile, isTablet, isDesktop, isLargeDesktop, breakpoint })
    }

    updateBreakpoints()
    window.addEventListener('resize', updateBreakpoints)
    return () => window.removeEventListener('resize', updateBreakpoints)
  }, [])

  return state
}

/**
 * Hook to check if screen is at least a certain breakpoint
 * @param breakpoint - The minimum breakpoint to check
 * @returns boolean indicating if screen is at or above the breakpoint
 */
export function useMinBreakpoint(breakpoint: Breakpoint): boolean {
  return useMediaQuery(`(min-width: ${BREAKPOINTS[breakpoint]}px)`)
}

/**
 * Hook to check if screen is below a certain breakpoint
 * @param breakpoint - The maximum breakpoint to check
 * @returns boolean indicating if screen is below the breakpoint
 */
export function useMaxBreakpoint(breakpoint: Breakpoint): boolean {
  return useMediaQuery(`(max-width: ${BREAKPOINTS[breakpoint] - 1}px)`)
}

/**
 * Hook to detect if user prefers reduced motion
 * @returns boolean indicating if reduced motion is preferred
 */
export function usePrefersReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)')
}

/**
 * Hook to detect if user prefers dark color scheme
 * @returns boolean indicating if dark mode is preferred
 */
export function usePrefersDarkMode(): boolean {
  return useMediaQuery('(prefers-color-scheme: dark)')
}

/**
 * Hook to detect if device has touch capability
 * @returns boolean indicating if device is touch-enabled
 */
export function useIsTouchDevice(): boolean {
  const [isTouch, setIsTouch] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    setIsTouch('ontouchstart' in window || navigator.maxTouchPoints > 0)
  }, [])

  return isTouch
}
