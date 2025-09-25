'use client'

import * as React from 'react'
import { useFormContext } from 'react-hook-form'
import { Calendar } from 'lucide-react'
import { EventCreateFormData } from '@/lib/validations/event'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

// Quick date preset options
const datePresets = [
  {
    label: 'Tomorrow',
    getValue: () => {
      const date = new Date()
      date.setDate(date.getDate() + 1)
      return date.toISOString().split('T')[0]
    }
  },
  {
    label: 'Next Week',
    getValue: () => {
      const date = new Date()
      date.setDate(date.getDate() + 7)
      return date.toISOString().split('T')[0]
    }
  },
  {
    label: 'Next Month',
    getValue: () => {
      const date = new Date()
      date.setMonth(date.getMonth() + 1)
      return date.toISOString().split('T')[0]
    }
  },
  {
    label: 'In 3 Months',
    getValue: () => {
      const date = new Date()
      date.setMonth(date.getMonth() + 3)
      return date.toISOString().split('T')[0]
    }
  }
]

// Common timezone options
const timezoneOptions = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Anchorage',
  'Pacific/Honolulu',
  'UTC',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Australia/Sydney'
]

export function DateTimeStep() {
  const {
    register,
    setValue,
    watch,
    formState: { errors }
  } = useFormContext<EventCreateFormData>()

  const startDate = watch('start_date')
  const endDate = watch('end_date')
  const timezone = watch('timezone')

  // Auto-detect user's timezone
  React.useEffect(() => {
    if (!timezone) {
      const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone
      setValue('timezone', userTimezone)
    }
  }, [timezone, setValue])

  const handlePresetClick = (preset: typeof datePresets[0]) => {
    const dateValue = preset.getValue()
    setValue('start_date', dateValue, { shouldValidate: true })
  }

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStartDate = e.target.value
    setValue('start_date', newStartDate, { shouldValidate: true })

    // If end date is before start date, clear it
    if (endDate && new Date(endDate) < new Date(newStartDate)) {
      setValue('end_date', '', { shouldValidate: true })
    }
  }

  // Get minimum date for end date (must be same day or later than start date)
  const getMinEndDate = () => {
    return startDate || new Date().toISOString().split('T')[0]
  }

  // Get minimum date for start date (today)
  const getMinStartDate = () => {
    return new Date().toISOString().split('T')[0]
  }

  return (
    <div className="space-y-6">
      {/* Start Date */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            type="date"
            {...register('start_date')}
            label="Start Date *"
            error={errors.start_date?.message}
            min={getMinStartDate()}
            leftIcon={<Calendar className="h-4 w-4" />}
            onChange={handleStartDateChange}
          />

          <div className="space-y-2">
            <label className="text-sm font-medium">Start Time (Optional)</label>
            <input
              type="time"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              defaultValue="18:00"
            />
          </div>
        </div>

        {/* Quick date presets */}
        <div className="space-y-2">
          <p className="text-sm font-medium">Quick Dates:</p>
          <div className="flex flex-wrap gap-2">
            {datePresets.map((preset) => (
              <Button
                key={preset.label}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handlePresetClick(preset)}
                className="text-xs"
              >
                {preset.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* End Date (Optional) */}
      <div className="space-y-4">
        <h4 className="font-medium">End Date & Time (Optional)</h4>
        <p className="text-sm text-muted-foreground">
          Leave empty for single-day events. For multi-day events, specify when your event ends.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            type="date"
            {...register('end_date')}
            label="End Date"
            error={errors.end_date?.message}
            min={getMinEndDate()}
            leftIcon={<Calendar className="h-4 w-4" />}
          />

          <div className="space-y-2">
            <label className="text-sm font-medium">End Time</label>
            <input
              type="time"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50"
              disabled={!endDate}
              defaultValue="22:00"
            />
          </div>
        </div>
      </div>

      {/* Timezone */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Timezone</label>
        <select
          {...register('timezone')}
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            errors.timezone && "border-destructive focus:ring-destructive"
          )}
        >
          {timezoneOptions.map((tz) => (
            <option key={tz} value={tz}>
              {tz.replace('_', ' ')} ({Intl.DateTimeFormat(undefined, {
                timeZone: tz,
                timeZoneName: 'short'
              }).formatToParts().find(part => part.type === 'timeZoneName')?.value})
            </option>
          ))}
        </select>
        {errors.timezone && (
          <p className="text-sm text-destructive">{errors.timezone.message}</p>
        )}
        <p className="text-sm text-muted-foreground">
          We&apos;ve detected your timezone, but you can change it if needed.
        </p>
      </div>

      {/* Event Duration Preview */}
      {startDate && (
        <div className="bg-muted/50 rounded-lg p-4">
          <h4 className="font-medium mb-2">📅 Event Schedule Preview</h4>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>
              <strong>Starts:</strong> {new Date(startDate).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
            {endDate && (
              <p>
                <strong>Ends:</strong> {new Date(endDate).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            )}
            <p>
              <strong>Timezone:</strong> {timezone?.replace('_', ' ')}
            </p>
          </div>
        </div>
      )}

      {/* Help text */}
      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h4 className="font-medium mb-2 text-blue-900 dark:text-blue-100">💡 Date & Time Tips:</h4>
        <ul className="text-sm text-blue-700 dark:text-blue-200 space-y-1">
          <li>• Consider your guests&apos; availability when choosing dates</li>
          <li>• Weekend events typically have better attendance</li>
          <li>• Allow enough time for setup and cleanup</li>
          <li>• Check for local holidays or conflicting events</li>
          <li>• You can always adjust these dates later</li>
        </ul>
      </div>
    </div>
  )
}