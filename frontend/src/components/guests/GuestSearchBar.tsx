'use client'

/**
 * GuestSearchBar Component
 * Search bar with debounced input for filtering guests by name, email, or phone
 */

import React, { useState, useEffect, useCallback } from 'react'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

interface GuestSearchBarProps {
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
  debounceMs?: number
  className?: string
}

export function GuestSearchBar({
  value,
  onValueChange,
  placeholder = 'Search guests by name, email, or phone...',
  debounceMs = 300,
  className
}: GuestSearchBarProps) {
  const [localValue, setLocalValue] = useState(value)

  // Debounced search handler
  const debouncedOnValueChange = useCallback(
    (searchValue: string) => {
      const timer = setTimeout(() => {
        onValueChange(searchValue)
      }, debounceMs)

      return () => clearTimeout(timer)
    },
    [onValueChange, debounceMs]
  )

  // Update local value and trigger debounced search
  useEffect(() => {
    const cleanup = debouncedOnValueChange(localValue)
    return cleanup
  }, [localValue, debouncedOnValueChange])

  // Sync external value changes
  useEffect(() => {
    if (value !== localValue) {
      setLocalValue(value)
    }
  }, [value]) // Intentionally only depend on value to avoid loops

  const handleClear = () => {
    setLocalValue('')
    onValueChange('')
  }

  return (
    <div className={cn('relative', className)}>
      <Input
        type="text"
        placeholder={placeholder}
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        leftIcon={<Search className="h-4 w-4" />}
        rightIcon={
          localValue && (
            <button
              type="button"
              onClick={handleClear}
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )
        }
        className="pr-10"
      />
    </div>
  )
}
