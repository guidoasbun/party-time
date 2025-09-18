'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Sun, Moon, Monitor } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import { Button } from './Button'
import { cn } from '@/lib/utils'

interface ThemeToggleProps {
  className?: string
  variant?: 'button' | 'dropdown'
  showLabel?: boolean
}

export function ThemeToggle({
  className,
  variant = 'button',
  showLabel = false
}: ThemeToggleProps) {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    function handleEscapeKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscapeKey)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscapeKey)
    }
  }, [isOpen])

  if (variant === 'dropdown') {
    return (
      <div ref={dropdownRef} className={cn('relative', className)}>
        <Button
          variant="ghost"
          size="sm"
          className="h-9 w-9 px-0"
          onClick={() => setIsOpen(!isOpen)}
          title={`Current theme: ${theme} (${resolvedTheme})`}
        >
          {resolvedTheme === 'dark' ? (
            <Moon className="h-4 w-4" />
          ) : (
            <Sun className="h-4 w-4" />
          )}
        </Button>

        <div className={cn(
          "absolute right-0 top-full mt-2 w-48 bg-popover border border-border rounded-lg shadow-lg transition-all duration-200 z-50",
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        )}>
          <div className="p-1">
            <button
              onClick={() => {
                setTheme('light')
                setIsOpen(false)
              }}
              className={cn(
                'flex items-center gap-2 w-full px-3 py-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground transition-colors',
                theme === 'light' && 'bg-accent text-accent-foreground'
              )}
            >
              <Sun className="h-4 w-4" />
              <span>Light</span>
              {theme === 'light' && (
                <div className="ml-auto w-2 h-2 bg-primary rounded-full" />
              )}
            </button>

            <button
              onClick={() => {
                setTheme('dark')
                setIsOpen(false)
              }}
              className={cn(
                'flex items-center gap-2 w-full px-3 py-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground transition-colors',
                theme === 'dark' && 'bg-accent text-accent-foreground'
              )}
            >
              <Moon className="h-4 w-4" />
              <span>Dark</span>
              {theme === 'dark' && (
                <div className="ml-auto w-2 h-2 bg-primary rounded-full" />
              )}
            </button>

            <button
              onClick={() => {
                setTheme('system')
                setIsOpen(false)
              }}
              className={cn(
                'flex items-center gap-2 w-full px-3 py-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground transition-colors',
                theme === 'system' && 'bg-accent text-accent-foreground'
              )}
            >
              <Monitor className="h-4 w-4" />
              <span>System</span>
              {theme === 'system' && (
                <div className="ml-auto w-2 h-2 bg-primary rounded-full" />
              )}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Simple toggle button variant
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      className={cn(
        'h-9 px-3 transition-all duration-200',
        showLabel ? 'gap-2' : 'w-9 px-0',
        className
      )}
      title={`Switch to ${resolvedTheme === 'light' ? 'dark' : 'light'} mode`}
    >
      {resolvedTheme === 'dark' ? (
        <Moon className="h-4 w-4" />
      ) : (
        <Sun className="h-4 w-4" />
      )}
      {showLabel && (
        <span className="hidden sm:inline">
          {resolvedTheme === 'dark' ? 'Dark' : 'Light'}
        </span>
      )}
    </Button>
  )
}

export default ThemeToggle