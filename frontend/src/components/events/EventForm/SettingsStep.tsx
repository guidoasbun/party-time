'use client'

import * as React from 'react'
import { useFormContext, Controller } from 'react-hook-form'
import { Lock, Users, DollarSign, Eye, EyeOff, HelpCircle } from 'lucide-react'
import { EventStatus } from '@/types/event.types'
import { EventCreateFormData } from '@/lib/validations/event'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { cn } from '@/lib/utils'

interface SettingsStepProps {
  className?: string
  errors?: Record<string, string>
  onFieldChange?: (field: string, value: unknown) => void
}

// Simple Switch component for privacy toggle
interface SwitchProps {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  label: string
  description?: string
  icon?: React.ReactNode
  disabled?: boolean
  id?: string
}

function Switch({ checked, onCheckedChange, label, description, icon, disabled, id }: SwitchProps) {
  const generatedId = React.useId()
  const switchId = id || generatedId

  return (
    <div className="flex items-start space-x-3">
      {icon && (
        <div className="flex-shrink-0 mt-1 text-muted-foreground">
          {icon}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <div>
            <label id={switchId} className="text-sm font-medium text-foreground">
              {label}
            </label>
            {description && (
              <div className="text-sm text-muted-foreground mt-1">
                {description}
              </div>
            )}
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={checked}
            aria-labelledby={switchId}
            aria-label={label}
            disabled={disabled}
            onClick={() => onCheckedChange(!checked)}
            className={cn(
              "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
              checked ? 'bg-primary' : 'bg-input'
            )}
          >
            <span
              className={cn(
                "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-background shadow ring-0 transition duration-200 ease-in-out",
                checked ? 'translate-x-5' : 'translate-x-0'
              )}
            />
          </button>
        </div>
      </div>
    </div>
  )
}

export function SettingsStep({ className, errors, onFieldChange }: SettingsStepProps) {
  const { control, watch, formState: { errors: formErrors } } = useFormContext<EventCreateFormData>()

  // Watch form values to show preview
  const isPublic = watch('is_public')
  const maxGuests = watch('max_guests')
  const budgetTotal = watch('budget_total')
  const status = watch('status')

  // Handle field changes
  const handleFieldChange = React.useCallback((field: string, value: unknown) => {
    onFieldChange?.(field, value)
  }, [onFieldChange])

  // Format currency display
  const formatCurrency = (amount: number | undefined): string => {
    if (!amount) return '$0'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // Get error message for a field
  const getFieldError = (fieldName: string): string | undefined => {
    return errors?.[fieldName] || formErrors[fieldName as keyof typeof formErrors]?.message
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Privacy Settings Card */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Lock className="h-5 w-5 text-muted-foreground" />
            <h3 className="text-lg font-semibold">Privacy Settings</h3>
          </div>

          <Controller
            name="is_public"
            control={control}
            render={({ field }) => (
              <Switch
                checked={field.value || false}
                onCheckedChange={(checked) => {
                  field.onChange(checked)
                  handleFieldChange('is_public', checked)
                }}
                label="Make event public"
                description={
                  field.value
                    ? "Your event will be visible to anyone with the link"
                    : "Your event will only be visible to invited guests"
                }
                icon={field.value ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              />
            )}
          />

          {isPublic && (
            <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-md">
              <div className="flex items-start space-x-2">
                <HelpCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Public Event:</strong> Anyone with the link can view event details and RSVP if enabled.
                  Guest list and contact information remain private.
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Guest Settings Card */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-muted-foreground" />
            <h3 className="text-lg font-semibold">Guest Management</h3>
          </div>

          <div className="space-y-4">
            <Controller
              name="max_guests"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  type="number"
                  label="Maximum guest limit (optional)"
                  placeholder="Enter maximum number of guests"
                  error={getFieldError('max_guests')}
                  value={field.value || ''}
                  onChange={(e) => {
                    const value = e.target.value ? parseInt(e.target.value, 10) : undefined
                    field.onChange(value)
                    handleFieldChange('max_guests', value)
                  }}
                  min="1"
                  max="10000"
                  leftIcon={<Users className="h-4 w-4" />}
                />
              )}
            />

            {maxGuests && (
              <div className="text-sm text-muted-foreground">
                This event can accommodate up to <strong>{maxGuests}</strong> {maxGuests === 1 ? 'guest' : 'guests'}.
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Budget Settings Card */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5 text-muted-foreground" />
            <h3 className="text-lg font-semibold">Budget Planning</h3>
          </div>

          <div className="space-y-4">
            <Controller
              name="budget_total"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  type="number"
                  label="Total event budget (optional)"
                  placeholder="Enter your total budget"
                  error={getFieldError('budget_total')}
                  value={field.value || ''}
                  onChange={(e) => {
                    const value = e.target.value ? parseFloat(e.target.value) : undefined
                    field.onChange(value)
                    handleFieldChange('budget_total', value)
                  }}
                  min="0"
                  max="10000000"
                  step="0.01"
                  leftIcon={<DollarSign className="h-4 w-4" />}
                />
              )}
            />

            {budgetTotal !== undefined && (
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">
                  Total budget: <strong>{formatCurrency(budgetTotal)}</strong>
                </div>
                {maxGuests && maxGuests > 0 && budgetTotal > 0 && (
                  <div className="text-sm text-muted-foreground">
                    Budget per guest: <strong>{formatCurrency(budgetTotal / maxGuests)}</strong>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Event Status Card */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <div className={cn(
              'h-3 w-3 rounded-full',
              status === EventStatus.DRAFT && 'bg-gray-400',
              status === EventStatus.PLANNING && 'bg-blue-400',
              status === EventStatus.CONFIRMED && 'bg-green-400'
            )} />
            <h3 className="text-lg font-semibold">Event Status</h3>
          </div>

          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { value: EventStatus.DRAFT, label: 'Draft', description: 'Work in progress' },
                    { value: EventStatus.PLANNING, label: 'Planning', description: 'Active planning' },
                    { value: EventStatus.CONFIRMED, label: 'Confirmed', description: 'Ready to go' }
                  ].map((statusOption) => (
                    <button
                      key={statusOption.value}
                      type="button"
                      onClick={() => {
                        field.onChange(statusOption.value)
                        handleFieldChange('status', statusOption.value)
                      }}
                      className={cn(
                        'p-3 text-left border rounded-lg transition-colors',
                        field.value === statusOption.value
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-border hover:border-primary/50 hover:bg-accent'
                      )}
                    >
                      <div className="font-medium text-sm">{statusOption.label}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {statusOption.description}
                      </div>
                    </button>
                  ))}
                </div>

                <div className="text-sm text-muted-foreground">
                  {status === EventStatus.DRAFT && "You can continue editing and save as draft to come back later."}
                  {status === EventStatus.PLANNING && "Event is in active planning phase. You can invite guests and manage details."}
                  {status === EventStatus.CONFIRMED && "Event is confirmed and ready. Guests can RSVP and view final details."}
                </div>
              </div>
            )}
          />
        </div>
      </Card>

      {/* Summary Preview */}
      <Card className="p-6 bg-accent/50">
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Event Summary</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground">Privacy</div>
              <div className="font-medium">
                {isPublic ? 'Public Event' : 'Private Event'}
              </div>
            </div>

            <div>
              <div className="text-muted-foreground">Guest Limit</div>
              <div className="font-medium">
                {maxGuests ? `${maxGuests} ${maxGuests === 1 ? 'guest' : 'guests'}` : 'No limit'}
              </div>
            </div>

            <div>
              <div className="text-muted-foreground">Budget</div>
              <div className="font-medium">
                {budgetTotal !== undefined ? formatCurrency(budgetTotal) : 'No budget set'}
              </div>
            </div>

            <div>
              <div className="text-muted-foreground">Status</div>
              <div className="font-medium capitalize">
                {status?.replace('_', ' ') || 'Draft'}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}