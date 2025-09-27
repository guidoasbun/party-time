'use client'

import * as React from 'react'
import { useFormContext } from 'react-hook-form'
import { EventType } from '@/types/event.types'
import { EventCreateFormData } from '@/lib/validations/event'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { EventTypeSelector } from '@/components/events/EventTypeSelector'
import { cn } from '@/lib/utils'

const MAX_DESCRIPTION_LENGTH = 2000
const MAX_NAME_LENGTH = 255

export interface BasicInfoStepProps {
  className?: string
}

export function BasicInfoStep({ className }: BasicInfoStepProps) {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
    clearErrors
  } = useFormContext<EventCreateFormData>()

  // Watch form values for real-time updates
  const name = watch('name')
  const description = watch('description')
  const type = watch('type')

  // Character count for description
  const descriptionLength = description?.length || 0
  const nameLength = name?.length || 0

  // Handle event type selection
  const handleTypeChange = React.useCallback((selectedType: EventType) => {
    setValue('type', selectedType, { shouldValidate: true, shouldDirty: true })
    // Clear any existing type errors when user makes a selection
    if (errors.type) {
      clearErrors('type')
    }
  }, [setValue, clearErrors, errors.type])

  // Handle name changes to clear errors
  const handleNameChange = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    if (errors.name && event.target.value.trim()) {
      clearErrors('name')
    }
  }, [clearErrors, errors.name])

  // Handle description changes to clear errors
  const handleDescriptionChange = React.useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (errors.description && event.target.value.length <= MAX_DESCRIPTION_LENGTH) {
      clearErrors('description')
    }
  }, [clearErrors, errors.description])

  return (
    <div className={cn("space-y-6", className)}>
      {/* Event Name */}
      <div className="space-y-2">
        <Input
          {...register('name', {
            required: 'Event name is required',
            maxLength: {
              value: MAX_NAME_LENGTH,
              message: `Event name must be less than ${MAX_NAME_LENGTH} characters`
            },
            onChange: handleNameChange
          })}
          label="Event Name"
          placeholder="Enter your event name"
          error={errors.name?.message}
          maxLength={MAX_NAME_LENGTH}
          aria-describedby={nameLength > 0 ? 'name-character-count' : undefined}
          autoFocus
        />
        {nameLength > 0 && (
          <div className="flex justify-between text-xs text-muted-foreground">
            <span
              id="name-character-count"
              className={cn(
                nameLength > MAX_NAME_LENGTH * 0.9 && "text-warning",
                nameLength >= MAX_NAME_LENGTH && "text-destructive"
              )}
            >
              {nameLength}/{MAX_NAME_LENGTH} characters
            </span>
          </div>
        )}
      </div>

      {/* Event Type */}
      <div className="space-y-2">
        <label className="text-sm font-medium leading-none">
          Event Type <span className="text-destructive">*</span>
        </label>
        <EventTypeSelector
          value={type}
          onChange={handleTypeChange}
          error={errors.type?.message}
          aria-label="Select the type of event you're planning"
        />
        <p className="text-sm text-muted-foreground">
          Choose the type that best describes your event. This helps us provide relevant suggestions.
        </p>
      </div>

      {/* Event Description */}
      <div className="space-y-2">
        <Textarea
          {...register('description', {
            maxLength: {
              value: MAX_DESCRIPTION_LENGTH,
              message: `Description must be less than ${MAX_DESCRIPTION_LENGTH} characters`
            },
            onChange: handleDescriptionChange
          })}
          label="Event Description"
          placeholder="Tell us about your event... (optional)"
          error={errors.description?.message}
          maxLength={MAX_DESCRIPTION_LENGTH}
          rows={4}
          aria-describedby="description-character-count description-help"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span id="description-help">
            Provide details about your event to help with planning
          </span>
          <span
            id="description-character-count"
            className={cn(
              descriptionLength > MAX_DESCRIPTION_LENGTH * 0.9 && "text-warning",
              descriptionLength >= MAX_DESCRIPTION_LENGTH && "text-destructive"
            )}
          >
            {descriptionLength}/{MAX_DESCRIPTION_LENGTH} characters
          </span>
        </div>
      </div>

      {/* Help Text */}
      <div className="bg-muted/50 rounded-lg p-4">
        <h4 className="text-sm font-medium mb-2">Tips for a great event description:</h4>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>• Mention the occasion or purpose</li>
          <li>• Include any special themes or dress codes</li>
          <li>• Note if it&apos;s a surprise or has special requirements</li>
          <li>• Add any dietary preferences or accessibility needs</li>
        </ul>
      </div>
    </div>
  )
}

// Export constants for testing
export { MAX_DESCRIPTION_LENGTH, MAX_NAME_LENGTH }