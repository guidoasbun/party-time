'use client'

import * as React from 'react'
import { useFormContext } from 'react-hook-form'
import { EventType } from '@/types/event.types'
import { EventCreateFormData } from '@/lib/validations/event'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { cn } from '@/lib/utils'

// Event type options for the select component
const eventTypeOptions = [
  { value: EventType.WEDDING, label: '💒 Wedding' },
  { value: EventType.BIRTHDAY, label: '🎂 Birthday Party' },
  { value: EventType.ANNIVERSARY, label: '💕 Anniversary' },
  { value: EventType.GRADUATION, label: '🎓 Graduation' },
  { value: EventType.BABY_SHOWER, label: '🍼 Baby Shower' },
  { value: EventType.BRIDAL_SHOWER, label: '💐 Bridal Shower' },
  { value: EventType.CORPORATE, label: '🏢 Corporate Event' },
  { value: EventType.CONFERENCE, label: '📊 Conference' },
  { value: EventType.WORKSHOP, label: '🛠️ Workshop' },
  { value: EventType.FUNDRAISER, label: '💰 Fundraiser' },
  { value: EventType.HOLIDAY_PARTY, label: '🎉 Holiday Party' },
  { value: EventType.REUNION, label: '👥 Reunion' },
  { value: EventType.OTHER, label: '📅 Other' },
]

export function BasicInfoStep() {
  const {
    register,
    setValue,
    watch,
    formState: { errors }
  } = useFormContext<EventCreateFormData>()

  const eventType = watch('type')

  const handleTypeChange = (value: string | string[]) => {
    if (typeof value === 'string') {
      setValue('type', value as EventType, { shouldValidate: true })
    }
  }

  return (
    <div className="space-y-6">
      {/* Event Name */}
      <Input
        {...register('name')}
        label="Event Name *"
        placeholder="e.g., Sarah's Birthday Party"
        error={errors.name?.message}
        className="text-lg"
        autoFocus
      />

      {/* Event Type */}
      <div className="space-y-2">
        <Select
          label="Event Type *"
          options={eventTypeOptions}
          value={eventType}
          onValueChange={handleTypeChange}
          placeholder="Select event type..."
          error={errors.type?.message}
        />
        <p className="text-sm text-muted-foreground">
          Choose the type that best describes your event. This helps us provide relevant suggestions.
        </p>
      </div>

      {/* Event Description */}
      <Textarea
        {...register('description')}
        label="Description (Optional)"
        placeholder="Tell us about your event... What's the occasion? Any special themes or requirements?"
        error={errors.description?.message}
        className="min-h-[120px]"
        maxLength={2000}
      />

      {/* Help text */}
      <div className="bg-muted/50 rounded-lg p-4">
        <h4 className="font-medium mb-2">💡 Tips for a great event name:</h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Be specific and descriptive (e.g., &quot;John &amp; Jane&apos;s Wedding Reception&quot;)</li>
          <li>• Include the occasion if it&apos;s not obvious from the type</li>
          <li>• Keep it under 100 characters for best display</li>
          <li>• Avoid special characters that might cause issues</li>
        </ul>
      </div>
    </div>
  )
}