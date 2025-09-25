'use client'

import * as React from 'react'
import { useFormContext } from 'react-hook-form'
import { Eye, EyeOff, Users, DollarSign, Settings, Info } from 'lucide-react'
import { EventStatus } from '@/types/event.types'
import { EventCreateFormData } from '@/lib/validations/event'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

// Event status options
const statusOptions = [
  {
    value: EventStatus.DRAFT,
    label: '📝 Draft',
    description: 'Still planning, not visible to guests'
  },
  {
    value: EventStatus.PLANNING,
    label: '🔄 Planning',
    description: 'Active planning phase, visible to collaborators'
  },
  {
    value: EventStatus.CONFIRMED,
    label: '✅ Confirmed',
    description: 'Event details confirmed, ready for invitations'
  }
]

// Budget range suggestions
const budgetSuggestions = [
  { label: '$500', value: 500 },
  { label: '$1,000', value: 1000 },
  { label: '$2,500', value: 2500 },
  { label: '$5,000', value: 5000 },
  { label: '$10,000', value: 10000 },
  { label: '$25,000', value: 25000 }
]

// Guest count suggestions
const guestSuggestions = [
  { label: '10', value: 10 },
  { label: '25', value: 25 },
  { label: '50', value: 50 },
  { label: '100', value: 100 },
  { label: '200', value: 200 },
  { label: '500', value: 500 }
]

export function SettingsStep() {
  const {
    register,
    setValue,
    watch,
    formState: { errors }
  } = useFormContext<EventCreateFormData>()

  const isPublic = watch('is_public')
  const status = watch('status')
  const maxGuests = watch('max_guests')
  const budgetTotal = watch('budget_total')

  const handlePrivacyToggle = () => {
    setValue('is_public', !isPublic, { shouldValidate: true })
  }

  const handleStatusChange = (newStatus: EventStatus) => {
    setValue('status', newStatus, { shouldValidate: true })
  }

  const handleBudgetSuggestion = (value: number) => {
    setValue('budget_total', value, { shouldValidate: true })
  }

  const handleGuestSuggestion = (value: number) => {
    setValue('max_guests', value, { shouldValidate: true })
  }

  return (
    <div className="space-y-6">
      {/* Privacy Settings */}
      <div className="space-y-4">
        <h3 className="font-medium flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Privacy & Visibility
        </h3>

        <div className="border rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                {isPublic ? (
                  <Eye className="h-4 w-4 text-blue-600" />
                ) : (
                  <EyeOff className="h-4 w-4 text-gray-600" />
                )}
                <span className="font-medium">
                  {isPublic ? 'Public Event' : 'Private Event'}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {isPublic
                  ? 'Your event will be visible to the public and searchable'
                  : 'Your event is private and only visible to invited guests'
                }
              </p>
            </div>
            <Button
              type="button"
              variant={isPublic ? "default" : "outline"}
              size="sm"
              onClick={handlePrivacyToggle}
            >
              {isPublic ? 'Make Private' : 'Make Public'}
            </Button>
          </div>
        </div>

        {errors.is_public && (
          <p className="text-sm text-destructive">{errors.is_public.message}</p>
        )}
      </div>

      {/* Event Status */}
      <div className="space-y-4">
        <h3 className="font-medium">Event Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {statusOptions.map((option) => (
            <Button
              key={option.value}
              type="button"
              variant={status === option.value ? "default" : "outline"}
              className="h-auto p-4 flex flex-col items-start gap-2 text-left"
              onClick={() => handleStatusChange(option.value)}
            >
              <div className="font-medium">{option.label}</div>
              <div className="text-xs text-muted-foreground">
                {option.description}
              </div>
            </Button>
          ))}
        </div>
        {errors.status && (
          <p className="text-sm text-destructive">{errors.status.message}</p>
        )}
      </div>

      {/* Guest Settings */}
      <div className="space-y-4">
        <h3 className="font-medium flex items-center gap-2">
          <Users className="h-4 w-4" />
          Guest Limit (Optional)
        </h3>

        <Input
          type="number"
          {...register('max_guests', { valueAsNumber: true })}
          label="Maximum Number of Guests"
          placeholder="e.g., 50"
          error={errors.max_guests?.message}
          leftIcon={<Users className="h-4 w-4" />}
          min="1"
          max="10000"
        />

        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Quick suggestions:</p>
          <div className="flex flex-wrap gap-2">
            {guestSuggestions.map((suggestion) => (
              <Button
                key={suggestion.value}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleGuestSuggestion(suggestion.value)}
                className={cn(
                  "text-xs",
                  maxGuests === suggestion.value && "border-primary bg-primary/10"
                )}
              >
                {suggestion.label} guests
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Budget Settings */}
      <div className="space-y-4">
        <h3 className="font-medium flex items-center gap-2">
          <DollarSign className="h-4 w-4" />
          Budget (Optional)
        </h3>

        <Input
          type="number"
          {...register('budget_total', { valueAsNumber: true })}
          label="Total Budget"
          placeholder="e.g., 5000"
          error={errors.budget_total?.message}
          leftIcon={<DollarSign className="h-4 w-4" />}
          min="0"
          max="10000000"
          step="50"
        />

        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Budget suggestions:</p>
          <div className="flex flex-wrap gap-2">
            {budgetSuggestions.map((suggestion) => (
              <Button
                key={suggestion.value}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleBudgetSuggestion(suggestion.value)}
                className={cn(
                  "text-xs",
                  budgetTotal === suggestion.value && "border-primary bg-primary/10"
                )}
              >
                {suggestion.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Settings Summary */}
      <div className="bg-muted/50 rounded-lg p-4">
        <h4 className="font-medium mb-2">⚙️ Event Settings Summary</h4>
        <div className="text-sm text-muted-foreground space-y-1">
          <p>
            <strong>Privacy:</strong> {isPublic ? 'Public event' : 'Private event'}
          </p>
          <p>
            <strong>Status:</strong> {statusOptions.find(s => s.value === status)?.label || 'Draft'}
          </p>
          {maxGuests && (
            <p>
              <strong>Guest Limit:</strong> {maxGuests} people
            </p>
          )}
          {budgetTotal && (
            <p>
              <strong>Budget:</strong> ${budgetTotal.toLocaleString()}
            </p>
          )}
        </div>
      </div>

      {/* Settings Information */}
      <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-medium mb-2 text-amber-900 dark:text-amber-100">Important Notes:</h4>
            <ul className="text-sm text-amber-700 dark:text-amber-200 space-y-1">
              <li>• All these settings can be changed later from your event dashboard</li>
              <li>• Budget tracking helps you stay organized but isn&apos;t required</li>
              <li>• Guest limits help with planning but don&apos;t restrict actual invitations</li>
              <li>• Private events are only visible to people you invite</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Ready to Create */}
      <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
        <h4 className="font-medium mb-2 text-green-900 dark:text-green-100">🎉 Ready to Create!</h4>
        <p className="text-sm text-green-700 dark:text-green-200">
          You&apos;re all set! Click &quot;Create Event&quot; to finalize your event and start inviting guests.
          Don&apos;t worry - you can always edit these details later.
        </p>
      </div>
    </div>
  )
}