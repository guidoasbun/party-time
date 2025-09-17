'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

export type Theme = 'light' | 'dark' | 'system'
export type ResolvedTheme = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
  resolvedTheme: ResolvedTheme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

interface ThemeProviderProps {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'party-time-theme'
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme)
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('light')
  const [mounted, setMounted] = useState(false)

  // Get system preference
  const getSystemTheme = (): ResolvedTheme => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    return 'light'
  }

  // Resolve theme based on current setting
  const resolveTheme = (currentTheme: Theme): ResolvedTheme => {
    if (currentTheme === 'system') {
      return getSystemTheme()
    }
    return currentTheme
  }

  // Apply theme to document
  const applyTheme = (resolvedTheme: ResolvedTheme) => {
    if (typeof window !== 'undefined') {
      const root = window.document.documentElement
      root.classList.remove('light', 'dark')
      root.classList.add(resolvedTheme)

      // Force reflow to ensure changes are applied immediately
      void root.offsetHeight

      // Update CSS custom properties for theme (removed - using CSS variables instead)
      // The CSS variables in globals.css handle theme changes automatically
    }
  }

  // Set theme with persistence
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(storageKey, newTheme)
      } catch (error) {
        console.warn('Failed to save theme preference:', error)
      }
    }

    const resolved = resolveTheme(newTheme)
    setResolvedTheme(resolved)
    applyTheme(resolved)
  }

  // Toggle between light and dark (skips system)
  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark')
    } else if (theme === 'dark') {
      setTheme('light')
    } else {
      // If system, toggle to opposite of current resolved theme
      setTheme(resolvedTheme === 'light' ? 'dark' : 'light')
    }
  }

  // Initialize theme on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedTheme = localStorage.getItem(storageKey) as Theme | null
        const initialTheme = savedTheme || defaultTheme
        const resolved = resolveTheme(initialTheme)

        setThemeState(initialTheme)
        setResolvedTheme(resolved)
        applyTheme(resolved)
        setMounted(true)
      } catch (error) {
        console.warn('Failed to load theme preference:', error)
        const resolved = resolveTheme(defaultTheme)
        setResolvedTheme(resolved)
        applyTheme(resolved)
        setMounted(true)
      }
    }
  }, [defaultTheme, storageKey])

  // Listen for system theme changes
  useEffect(() => {
    if (typeof window !== 'undefined' && theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

      const handleChange = (e: MediaQueryListEvent) => {
        const resolved = e.matches ? 'dark' : 'light'
        setResolvedTheme(resolved)
        applyTheme(resolved)
      }

      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    }
  }, [theme])

  // Prevent flash of unstyled content
  if (!mounted) {
    return (
      <div className="theme-loading">
        {children}
      </div>
    )
  }

  const value: ThemeContextType = {
    theme,
    resolvedTheme,
    setTheme,
    toggleTheme
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}