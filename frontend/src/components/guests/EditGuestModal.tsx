'use client'

/**
 * EditGuestModal Component
 * Modal for editing existing guest information
 */

import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Save, Loader2 } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { guestUpdateSchema, type GuestUpdateInput } from '@/lib/validations/guest'
import { guestsService } from '@/lib/api/services'
import { useToast } from '@/hooks/useToast'
import { cn } from '@/lib/utils'
import type { UUID, Guest, GuestUpdate } from '@/types'

interface EditGuestModalProps {
  open: boolean
  onClose: () => void
  eventId: UUID
  guest: Guest | null
  onSuccess?: () => void
  className?: string
}

export function EditGuestModal({
  open,
  onClose,
  eventId,
  guest,
  onSuccess,
  className
}: EditGuestModalProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    watch
  } = useForm<GuestUpdateInput>({
    resolver: zodResolver(guestUpdateSchema) as never,
    defaultValues: {
      first_name: guest?.first_name || '',
      last_name: guest?.last_name || '',
      email: guest?.email || '',
      phone: guest?.phone || undefined,
      plus_one_allowed: guest?.plus_one_allowed || false,
      plus_one_name: guest?.plus_one_name || undefined,
      dietary_restrictions: guest?.dietary_restrictions || undefined,
      notes: guest?.notes || undefined
    }
  })

  const plusOneAllowed = watch('plus_one_allowed')

  // Reset form when guest changes
  useEffect(() => {
    if (guest && open) {
      reset({
        first_name: guest.first_name,
        last_name: guest.last_name,
        email: guest.email,
        phone: guest.phone || undefined,
        plus_one_allowed: guest.plus_one_allowed,
        plus_one_name: guest.plus_one_name || undefined,
        dietary_restrictions: guest.dietary_restrictions || undefined,
        notes: guest.notes || undefined
      })
    }
  }, [guest, open, reset])

  const onSubmit = async (data: GuestUpdateInput) => {
    if (!guest) return

    setIsSubmitting(true)

    try {
      const updateData: GuestUpdate = {
        ...data
      }

      await guestsService.updateGuest(eventId, guest.id, updateData)

      toast({
        title: 'Guest updated successfully',
        description: `${data.first_name} ${data.last_name}'s information has been updated.`,
        variant: 'success'
      })

      reset()
      onClose()
      onSuccess?.()
    } catch (error) {
      console.error('Failed to update guest:', error)
      toast({
        title: 'Failed to update guest',
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

  if (!guest) return null

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={`Edit Guest: ${guest.first_name} ${guest.last_name}`}
      size="lg"
      className={className}
      footer={
        <div className="flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting || !isDirty}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
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
              id="edit_plus_one_allowed"
              className={cn(
                'h-4 w-4 rounded border-gray-300 text-primary',
                'focus:ring-2 focus:ring-primary focus:ring-offset-2',
                'disabled:cursor-not-allowed disabled:opacity-50'
              )}
              disabled={isSubmitting}
            />
            <label
              htmlFor="edit_plus_one_allowed"
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
