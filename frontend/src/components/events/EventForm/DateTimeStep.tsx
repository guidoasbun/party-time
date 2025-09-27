'use client'

import * as React from 'react'
import { useFormContext } from 'react-hook-form'
import { Calendar, Clock, Sun } from 'lucide-react'
import { format, parse } from 'date-fns'
import { EventCreateFormData } from '@/lib/validations/event'
import { DateTimePicker, QuickDatePresets } from '@/components/ui/DateTimePicker'
import { TimezoneSelector } from '@/components/ui/TimezoneSelector'
import { Button } from '@/components/ui/Button'

export function DateTimeStep() {
  const {
    setValue,
    watch,
    formState: { errors }
  } = useFormContext<EventCreateFormData>()

  const startDate = watch('start_date')
  const endDate = watch('end_date')
  const startTime = watch('start_time')
  const endTime = watch('end_time')
  const allDay = watch('all_day')
  const timezone = watch('timezone')

  // Auto-detect user's timezone
  React.useEffect(() => {
    if (!timezone) {
      const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone
      setValue('timezone', userTimezone)
    }
  }, [timezone, setValue])

  // Set default times when all_day is disabled
  React.useEffect(() => {
    if (!allDay && startDate && !startTime) {
      setValue('start_time', '18:00') // Default 6 PM
    }
    if (!allDay && endDate && !endTime) {
      setValue('end_time', '22:00') // Default 10 PM
    }
  }, [allDay, startDate, endDate, startTime, endTime, setValue])

  const handleAllDayToggle = () => {
    const newAllDay = !allDay
    setValue('all_day', newAllDay)

    if (newAllDay) {
      // Clear times for all-day events
      setValue('start_time', '')
      setValue('end_time', '')
    } else {
      // Set default times for timed events
      setValue('start_time', '18:00')
      setValue('end_time', '22:00')
    }
  }

  const handleStartDateChange = (date: string) => {
    setValue('start_date', date, { shouldValidate: true })

    // If end date is before start date, clear it
    if (endDate && new Date(endDate) < new Date(date)) {
      setValue('end_date', '', { shouldValidate: true })
    }
  }

  const handleEndDateChange = (date: string) => {
    setValue('end_date', date, { shouldValidate: true })
  }

  const handleStartTimeChange = (time: string) => {
    setValue('start_time', time, { shouldValidate: true })
  }

  const handleEndTimeChange = (time: string) => {
    setValue('end_time', time, { shouldValidate: true })
  }

  const handleTimezoneChange = (tz: string) => {
    setValue('timezone', tz, { shouldValidate: true })
  }

  const handleQuickDateSelect = (date: string) => {
    setValue('start_date', date, { shouldValidate: true })
  }

  // Format datetime for preview
  const formatEventDateTime = (date: string, time?: string) => {
    if (!date) return ''

    const dateObj = new Date(date)
    const dateString = format(dateObj, 'EEEE, MMMM d, yyyy')

    if (allDay || !time) {
      return dateString
    }

    const timeObj = parse(time, 'HH:mm', new Date())
    const timeString = format(timeObj, 'h:mm a')

    return `${dateString} at ${timeString}`
  }

  // Get minimum date (today)
  const getMinDate = () => {
    return format(new Date(), 'yyyy-MM-dd')
  }

  // Get minimum end date (same as start date)
  const getMinEndDate = () => {
    return startDate || getMinDate()
  }

  return (
    <div className="space-y-6">
      {/* All Day Toggle */}
      <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
        <div className="flex items-center gap-3">
          {allDay ? <Sun className="h-5 w-5 text-amber-500" /> : <Clock className="h-5 w-5 text-blue-500" />}
          <div>
            <p className="font-medium">
              {allDay ? 'All-day event' : 'Timed event'}
            </p>
            <p className="text-sm text-muted-foreground">
              {allDay
                ? 'Your event will last the entire day'
                : 'Specify exact start and end times'
              }
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant={allDay ? "default" : "outline"}
          size="sm"
          onClick={handleAllDayToggle}
        >
          {allDay ? 'All Day' : 'Timed'}
        </Button>
      </div>

      {/* Quick Date Presets */}
      <QuickDatePresets
        onDateSelect={handleQuickDateSelect}
        disabled={false}
      />

      {/* Start Date and Time */}
      <div className="space-y-4">
        <h4 className="font-medium flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Start Date {!allDay && '& Time'} *
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DateTimePicker
            value={startDate || ''}
            onChange={handleStartDateChange}
            label="Start Date"
            error={errors.start_date?.message}
            min={getMinDate()}
            includeTime={false}
          />

          {!allDay && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Start Time</label>
              <div className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                <Clock className="h-4 w-4 text-muted-foreground mr-2 mt-0.5" />
                <input
                  type="time"
                  value={startTime || ''}
                  onChange={(e) => handleStartTimeChange(e.target.value)}
                  className="flex-1 bg-transparent border-0 outline-none"
                />
              </div>
              {errors.start_time && (
                <p className="text-sm text-destructive">{errors.start_time.message}</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* End Date and Time (Optional) */}
      <div className="space-y-4">
        <h4 className="font-medium flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          End Date {!allDay && '& Time'} (Optional)
        </h4>
        <p className="text-sm text-muted-foreground">
          Leave empty for single-day events. For multi-day events, specify when your event ends.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DateTimePicker
            value={endDate || ''}
            onChange={handleEndDateChange}
            label="End Date"
            error={errors.end_date?.message}
            min={getMinEndDate()}
            includeTime={false}
          />

          {!allDay && (
            <div className="space-y-2">
              <label className="text-sm font-medium">End Time</label>
              <div className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                <Clock className="h-4 w-4 text-muted-foreground mr-2 mt-0.5" />
                <input
                  type="time"
                  value={endTime || ''}
                  onChange={(e) => handleEndTimeChange(e.target.value)}
                  className="flex-1 bg-transparent border-0 outline-none"
                  disabled={!endDate}
                />
              </div>
              {errors.end_time && (
                <p className="text-sm text-destructive">{errors.end_time.message}</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Timezone */}
      <div className="space-y-2">
        <TimezoneSelector
          value={timezone}
          onChange={handleTimezoneChange}
          label="Timezone"
          error={errors.timezone?.message}
          showCurrentTime={true}
        />
        <p className="text-sm text-muted-foreground">
          We&apos;ve detected your timezone, but you can change it if needed.
        </p>
      </div>

      {/* Event Schedule Preview */}
      {startDate && (
        <div className="bg-muted/50 rounded-lg p-4">
          <h4 className="font-medium mb-2 flex items-center gap-2">
            📅 Event Schedule Preview
          </h4>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>
              <strong>Starts:</strong> {formatEventDateTime(startDate, startTime)}
            </p>
            {endDate && (
              <p>
                <strong>Ends:</strong> {formatEventDateTime(endDate, endTime)}
              </p>
            )}
            <p>
              <strong>Timezone:</strong> {timezone?.replace('_', ' ')}
            </p>
            {allDay && (
              <p className="text-amber-600 dark:text-amber-400 mt-2">
                ⚡ This is an all-day event
              </p>
            )}
          </div>
        </div>
      )}

      {/* Help text */}
      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h4 className="font-medium mb-2 text-blue-900 dark:text-blue-100 flex items-center gap-2">
          <Clock className="h-4 w-4" />
          💡 Date & Time Tips:
        </h4>
        <ul className="text-sm text-blue-700 dark:text-blue-200 space-y-1">
          <li>• Consider your guests&apos; availability when choosing dates</li>
          <li>• Weekend events typically have better attendance</li>
          <li>• Use all-day events for things like conferences or festivals</li>
          <li>• Timed events work best for parties, meetings, or workshops</li>
          <li>• Check for local holidays or conflicting events</li>
          <li>• You can always adjust these dates later</li>
        </ul>
      </div>
    </div>
  )
}