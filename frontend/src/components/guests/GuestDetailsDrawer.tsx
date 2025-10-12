'use client'

/**
 * GuestDetailsDrawer Component
 * Slide-in drawer displaying full guest information with actions
 */

import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import {
  X,
  Mail,
  Phone,
  User,
  Users,
  UtensilsCrossed,
  FileText,
  Edit,
  Trash2,
  Send,
  RefreshCw,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  HelpCircle
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import type { Guest, RsvpStatus, UUID } from '@/types'
import { RsvpStatus as RsvpStatusEnum } from '@/types'

interface GuestDetailsDrawerProps {
  open: boolean
  onClose: () => void
  guest: Guest | null
  onEdit?: (guest: Guest) => void
  onDelete?: (guestId: UUID) => void
  onSendInvitation?: (guestId: UUID) => void
  onRegenerateToken?: (guestId: UUID) => void
  className?: string
}

const getRsvpStatusConfig = (status: RsvpStatus) => {
  const configs = {
    [RsvpStatusEnum.ATTENDING]: {
      label: 'Attending',
      icon: CheckCircle2,
      bgColor: 'bg-green-100 dark:bg-green-900/30',
      textColor: 'text-green-800 dark:text-green-300',
      borderColor: 'border-green-300 dark:border-green-700'
    },
    [RsvpStatusEnum.NOT_ATTENDING]: {
      label: 'Not Attending',
      icon: XCircle,
      bgColor: 'bg-red-100 dark:bg-red-900/30',
      textColor: 'text-red-800 dark:text-red-300',
      borderColor: 'border-red-300 dark:border-red-700'
    },
    [RsvpStatusEnum.PENDING]: {
      label: 'Pending',
      icon: Clock,
      bgColor: 'bg-amber-100 dark:bg-amber-900/30',
      textColor: 'text-amber-800 dark:text-amber-300',
      borderColor: 'border-amber-300 dark:border-amber-700'
    },
    [RsvpStatusEnum.MAYBE]: {
      label: 'Maybe',
      icon: HelpCircle,
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
      textColor: 'text-blue-800 dark:text-blue-300',
      borderColor: 'border-blue-300 dark:border-blue-700'
    }
  }
  return configs[status] || configs[RsvpStatusEnum.PENDING]
}

export function GuestDetailsDrawer({
  open,
  onClose,
  guest,
  onEdit,
  onDelete,
  onSendInvitation,
  onRegenerateToken,
  className
}: GuestDetailsDrawerProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (open) {
      // Delay visibility to allow animation
      setTimeout(() => setIsVisible(true), 10)
      // Lock body scroll
      document.body.style.overflow = 'hidden'
    } else {
      setIsVisible(false)
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  useEffect(() => {
    if (!open) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [open, onClose])

  if (!open || !guest) return null

  const statusConfig = getRsvpStatusConfig(guest.rsvp_status)
  const StatusIcon = statusConfig.icon

  const drawerContent = (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className={cn(
          'absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300',
          isVisible ? 'opacity-100' : 'opacity-0'
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div className="absolute inset-y-0 right-0 flex max-w-full">
        <div
          className={cn(
            'w-screen max-w-md sm:max-w-lg transform transition-transform duration-300 ease-in-out',
            isVisible ? 'translate-x-0' : 'translate-x-full'
          )}
        >
          <div className="flex h-full flex-col bg-background shadow-xl border-l border-border">
            {/* Header */}
            <div className="px-6 py-4 border-b border-border bg-muted/30">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-semibold text-foreground truncate">
                    {guest.first_name} {guest.last_name}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1 truncate">
                    {guest.email}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="ml-4 p-2 text-muted-foreground hover:text-foreground rounded-md hover:bg-accent transition-colors"
                  aria-label="Close drawer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* RSVP Status Badge */}
              <div className="mt-4">
                <div
                  className={cn(
                    'inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium',
                    statusConfig.bgColor,
                    statusConfig.textColor,
                    statusConfig.borderColor
                  )}
                >
                  <StatusIcon className="h-4 w-4" />
                  {statusConfig.label}
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
              {/* Contact Information */}
              <section>
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-3">
                  Contact Information
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-muted-foreground">Email</p>
                      <a
                        href={`mailto:${guest.email}`}
                        className="text-sm text-foreground hover:text-primary break-all"
                      >
                        {guest.email}
                      </a>
                    </div>
                  </div>

                  {guest.phone && (
                    <div className="flex items-start gap-3">
                      <Phone className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-muted-foreground">Phone</p>
                        <a
                          href={`tel:${guest.phone}`}
                          className="text-sm text-foreground hover:text-primary"
                        >
                          {guest.phone}
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </section>

              {/* Plus-One Information */}
              <section>
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-3">
                  Plus-One
                </h3>
                <div className="flex items-start gap-3">
                  <Users className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    {guest.plus_one_allowed ? (
                      <>
                        <Badge variant="default" className="mb-2 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                          Plus-one allowed
                        </Badge>
                        {guest.plus_one_name && (
                          <p className="text-sm text-foreground">
                            {guest.plus_one_name}
                          </p>
                        )}
                        {!guest.plus_one_name && (
                          <p className="text-sm text-muted-foreground italic">
                            No plus-one name provided
                          </p>
                        )}
                      </>
                    ) : (
                      <Badge variant="secondary">No plus-one</Badge>
                    )}
                  </div>
                </div>
              </section>

              {/* Dietary Restrictions */}
              {guest.dietary_restrictions && (
                <section>
                  <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-3">
                    Dietary Restrictions
                  </h3>
                  <div className="flex items-start gap-3">
                    <UtensilsCrossed className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-foreground whitespace-pre-wrap">
                      {guest.dietary_restrictions}
                    </p>
                  </div>
                </section>
              )}

              {/* Notes */}
              {guest.notes && (
                <section>
                  <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-3">
                    Notes
                  </h3>
                  <div className="flex items-start gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-foreground whitespace-pre-wrap">
                      {guest.notes}
                    </p>
                  </div>
                </section>
              )}

              {/* RSVP Timeline */}
              <section>
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-3">
                  RSVP Timeline
                </h3>
                <div className="space-y-3">
                  {guest.invitation_sent_at && (
                    <div className="flex items-start gap-3">
                      <Send className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-muted-foreground">Invitation Sent</p>
                        <p className="text-sm text-foreground">
                          {format(new Date(guest.invitation_sent_at), 'PPp')}
                        </p>
                      </div>
                    </div>
                  )}

                  {guest.rsvp_responded_at && (
                    <div className="flex items-start gap-3">
                      <Calendar className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-muted-foreground">RSVP Response</p>
                        <p className="text-sm text-foreground">
                          {format(new Date(guest.rsvp_responded_at), 'PPp')}
                        </p>
                      </div>
                    </div>
                  )}

                  {!guest.invitation_sent_at && !guest.rsvp_responded_at && (
                    <p className="text-sm text-muted-foreground italic">
                      No invitation sent yet
                    </p>
                  )}
                </div>
              </section>
            </div>

            {/* Footer Actions */}
            <div className="px-6 py-4 border-t border-border bg-muted/30">
              <div className="grid grid-cols-2 gap-2">
                {onEdit && (
                  <Button
                    variant="outline"
                    onClick={() => onEdit(guest)}
                    className="w-full"
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                )}
                {onSendInvitation && (
                  <Button
                    variant="outline"
                    onClick={() => onSendInvitation(guest.id)}
                    className="w-full"
                  >
                    <Send className="mr-2 h-4 w-4" />
                    Send Invite
                  </Button>
                )}
                {onRegenerateToken && (
                  <Button
                    variant="outline"
                    onClick={() => onRegenerateToken(guest.id)}
                    className="w-full"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Regenerate Token
                  </Button>
                )}
                {onDelete && (
                  <Button
                    variant="outline"
                    onClick={() => onDelete(guest.id)}
                    className="w-full col-span-2 border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-950"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Guest
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  return typeof window !== 'undefined'
    ? createPortal(drawerContent, document.body)
    : null
}
