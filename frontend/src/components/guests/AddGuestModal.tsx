'use client'

/**
 * AddGuestModal Component
 * Full-featured modal for adding new guests to an event
 */

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { UserPlus, Loader2 } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { guestCreateSchema, type GuestCreateInput } from '@/lib/validations/guest'
import { guestsService } from '@/lib/api/services'
import { useToast } from '@/hooks/useToast'
import { cn } from '@/lib/utils'
import type { UUID, GuestCreate } from '@/types'

interface AddGuestModalProps {
  open: boolean
  onClose: () => void
  eventId: UUID
  onSuccess?: () => void
  className?: string
}

export function AddGuestModal({
  open,
  onClose,
  eventId,
  onSuccess,
  className
}: AddGuestModalProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [saveAndAddAnother, setSaveAndAddAnother] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    watch
  } = useForm<GuestCreateInput>({
    resolver: zodResolver(guestCreateSchema) as never,
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      phone: undefined,
      plus_one_allowed: false,
      plus_one_name: undefined,
      dietary_restrictions: undefined,
      notes: undefined
    }
  })

  const plusOneAllowed = watch('plus_one_allowed')

  const onSubmit = async (data: GuestCreateInput) => {
    setIsSubmitting(true)

    try {
      const guestData: GuestCreate = {
        ...data,
        event_id: eventId
      }

      await guestsService.createGuest(eventId, guestData)

      toast({
        title: 'Guest added successfully',
        description: `${data.first_name} ${data.last_name} has been added to the guest list.`,
        variant: 'success'
      })

      if (saveAndAddAnother) {
        // Reset form and keep modal open
        reset()
        setSaveAndAddAnother(false)
        onSuccess?.()
      } else {
        // Close modal and reset form
        reset()
        onClose()
        onSuccess?.()
      }
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

  const handleClose = () => {
    if (isDirty && !isSubmitting) {
      const confirmed = window.confirm(
        'You have unsaved changes. Are you sure you want to close?'
      )
      if (!confirmed) return
    }
    reset()
    onClose()
  }

  const handleSaveAndAddAnother = handleSubmit((data) => {
    setSaveAndAddAnother(true)
    return onSubmit(data)
  })

  const handleSaveAndClose = handleSubmit((data) => {
    setSaveAndAddAnother(false)
    return onSubmit(data)
  })

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Add New Guest"
      size="lg"
      className={className}
      footer={
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
            className="order-3 sm:order-1"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleSaveAndAddAnother}
            disabled={isSubmitting}
            className="order-2"
          >
            {isSubmitting && saveAndAddAnother ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <UserPlus className="mr-2 h-4 w-4" />
                Save & Add Another
              </>
            )}
          </Button>
          <Button
            type="button"
            onClick={handleSaveAndClose}
            disabled={isSubmitting}
            className="order-1 sm:order-3"
          >
            {isSubmitting && !saveAndAddAnother ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save & Close'
            )}
          </Button>
        </div>
      }
    >
      <form className="space-y-6">
        {/* Basic Information Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
            Basic Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              {...register('first_name')}
              label="First Name"
              placeholder="John"
              error={errors.first_name?.message}
              disabled={isSubmitting}
              required
            />
            <Input
              {...register('last_name')}
              label="Last Name"
              placeholder="Doe"
              error={errors.last_name?.message}
              disabled={isSubmitting}
              required
            />
          </div>

          <Input
            {...register('email')}
            type="email"
            label="Email Address"
            placeholder="john.doe@example.com"
            error={errors.email?.message}
            disabled={isSubmitting}
            required
          />

          <Input
            {...register('phone')}
            type="tel"
            label="Phone Number"
            placeholder="+1 (555) 123-4567"
            error={errors.phone?.message}
            disabled={isSubmitting}
          />
        </div>

        {/* Plus-One Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
            Plus-One
          </h3>

          <div className="flex items-center gap-3">
            <input
              {...register('plus_one_allowed')}
              type="checkbox"
              id="plus_one_allowed"
              className={cn(
                'h-4 w-4 rounded border-gray-300 text-primary',
                'focus:ring-2 focus:ring-primary focus:ring-offset-2',
                'disabled:cursor-not-allowed disabled:opacity-50'
              )}
              disabled={isSubmitting}
            />
            <label
              htmlFor="plus_one_allowed"
              className="text-sm font-medium text-foreground cursor-pointer"
            >
              Allow plus-one guest
            </label>
          </div>

          {plusOneAllowed && (
            <Input
              {...register('plus_one_name')}
              label="Plus-One Name"
              placeholder="Jane Smith"
              error={errors.plus_one_name?.message}
              disabled={isSubmitting}
            />
          )}
        </div>

        {/* Dietary Restrictions Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
            Dietary Restrictions
          </h3>

          <Textarea
            {...register('dietary_restrictions')}
            label="Dietary Restrictions"
            placeholder="Vegetarian, gluten-free, nut allergy, etc."
            error={errors.dietary_restrictions?.message}
            disabled={isSubmitting}
            rows={3}
          />
        </div>

        {/* Notes Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
            Additional Notes
          </h3>

          <Textarea
            {...register('notes')}
            label="Notes"
            placeholder="Special seating requests, accessibility needs, etc."
            error={errors.notes?.message}
            disabled={isSubmitting}
            rows={4}
          />
        </div>
      </form>
    </Modal>
  )
}
