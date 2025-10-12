'use client'

/**
 * QuickAddGuest Component
 * Compact inline form for quickly adding guests with minimal fields
 */

import React, { useState, useRef, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { UserPlus, X, Loader2, Check } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { quickAddSchema, type QuickAddInput } from '@/lib/validations/guest'
import { guestsService } from '@/lib/api/services'
import { useToast } from '@/hooks/useToast'
import { cn } from '@/lib/utils'
import type { UUID, GuestCreate } from '@/types'

interface QuickAddGuestProps {
  eventId: UUID
  onSuccess?: () => void
  onCancel?: () => void
  autoFocus?: boolean
  className?: string
}

export function QuickAddGuest({
  eventId,
  onSuccess,
  onCancel,
  autoFocus = false,
  className
}: QuickAddGuestProps) {
  const { toast } = useToast()
  const [isExpanded, setIsExpanded] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const firstInputRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setFocus
  } = useForm<QuickAddInput>({
    resolver: zodResolver(quickAddSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      email: ''
    }
  })

  // Auto-focus first input when expanded
  useEffect(() => {
    if (isExpanded && autoFocus) {
      setTimeout(() => {
        firstInputRef.current?.focus()
      }, 100)
    }
  }, [isExpanded, autoFocus])

  const onSubmit = async (data: QuickAddInput) => {
    setIsSubmitting(true)

    try {
      const guestData: GuestCreate = {
        ...data,
        event_id: eventId,
        plus_one_allowed: false
      }

      await guestsService.createGuest(eventId, guestData)

      // Show success indicator
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 2000)

      // Reset form
      reset()

      // Show toast
      toast({
        title: 'Guest added',
        description: `${data.first_name} ${data.last_name} added successfully`,
        variant: 'success'
      })

      // Call success callback
      onSuccess?.()

      // Keep form expanded and focus first input for quick adding
      setTimeout(() => {
        setFocus('first_name')
      }, 100)
    } catch (error) {
      console.error('Failed to add guest:', error)
      toast({
        title: 'Failed to add guest',
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        variant: 'destructive'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    reset()
    setIsExpanded(false)
    onCancel?.()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleCancel()
    }
  }

  if (!isExpanded) {
    return (
      <Button
        type="button"
        variant="outline"
        onClick={() => setIsExpanded(true)}
        className={cn('w-full sm:w-auto', className)}
      >
        <UserPlus className="mr-2 h-4 w-4" />
        Quick Add Guest
      </Button>
    )
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      onKeyDown={handleKeyDown}
      className={cn(
        'border border-border rounded-lg p-4 bg-card shadow-sm',
        'animate-in fade-in slide-in-from-top-2 duration-200',
        className
      )}
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Quick Add Guest
          </h3>
          <button
            type="button"
            onClick={handleCancel}
            className="p-1 text-muted-foreground hover:text-foreground rounded-md hover:bg-accent transition-colors"
            aria-label="Close quick add"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            {...register('first_name')}
            ref={firstInputRef}
            placeholder="First name"
            error={errors.first_name?.message}
            disabled={isSubmitting}
            required
            className="text-sm"
          />
          <Input
            {...register('last_name')}
            placeholder="Last name"
            error={errors.last_name?.message}
            disabled={isSubmitting}
            required
            className="text-sm"
          />
          <Input
            {...register('email')}
            type="email"
            placeholder="email@example.com"
            error={errors.email?.message}
            disabled={isSubmitting}
            required
            className="text-sm"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 sm:flex-none"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : showSuccess ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Added!
              </>
            ) : (
              <>
                <UserPlus className="mr-2 h-4 w-4" />
                Add Guest
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isSubmitting}
            className="flex-1 sm:flex-none"
          >
            Cancel
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          Press <kbd className="px-1.5 py-0.5 text-xs font-semibold bg-muted rounded">Escape</kbd> to cancel or <kbd className="px-1.5 py-0.5 text-xs font-semibold bg-muted rounded">Enter</kbd> to add
        </p>
      </div>
    </form>
  )
}
