'use client'

import React, { useState } from 'react'
import { AlertTriangle, Loader2, Check, Copy } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import { Card } from '@/components/ui/Card'
import { guestsService } from '@/lib/api/services/guests.service'
import { UUID, Guest } from '@/types'

interface RegenerateTokenDialogProps {
  isOpen: boolean
  onClose: () => void
  eventId: UUID
  guestId: UUID
  guestName: string
  onSuccess?: (newGuest: Guest) => void
}

export function RegenerateTokenDialog({
  isOpen,
  onClose,
  eventId,
  guestId,
  guestName,
  onSuccess
}: RegenerateTokenDialogProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [newGuest, setNewGuest] = useState<Guest | null>(null)
  const [copied, setCopied] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const handleConfirm = async () => {
    try {
      setLoading(true)
      setError(null)

      const updatedGuest = await guestsService.regenerateToken(eventId, guestId)
      setNewGuest(updatedGuest)
      setShowSuccess(true)
      onSuccess?.(updatedGuest)
    } catch (err) {
      console.error('Failed to regenerate token:', err)
      setError('Failed to regenerate token. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleCopyToken = async () => {
    if (newGuest?.rsvp_token) {
      const success = await guestsService.copyToClipboard(newGuest.rsvp_token)
      if (success) {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
    }
  }

  const handleClose = () => {
    setNewGuest(null)
    setError(null)
    setCopied(false)
    setShowSuccess(false)
    onClose()
  }

  // Show success message after regeneration
  if (showSuccess && newGuest) {
    return (
      <div
        className={`fixed inset-0 z-50 ${isOpen ? 'flex' : 'hidden'} items-center justify-center bg-black/50`}
        onClick={handleClose}
      >
        <Card
          className="w-full max-w-md p-6 space-y-4"
          onClick={(e: React.MouseEvent) => e.stopPropagation()}
        >
          <div className="flex items-start gap-3 pb-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
              <Check className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                Token Regenerated
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                The new RSVP link is ready to share
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <p className="text-sm text-green-900 dark:text-green-100">
                Old link has been invalidated. Share the new link with {guestName}.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                New Token
              </label>
              <div className="flex items-center gap-2">
                <div className="flex-1 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <code className="text-sm text-gray-900 dark:text-gray-100 font-mono">
                    {newGuest.rsvp_token}
                  </code>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyToken}
                  className="shrink-0"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 mr-1" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-1" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button onClick={handleClose}>Done</Button>
          </div>
        </Card>
      </div>
    )
  }

  // Show confirmation dialog
  return (
    <ConfirmDialog
      open={isOpen}
      onClose={handleClose}
      onConfirm={handleConfirm}
      title="Regenerate RSVP Token?"
      description={`This will invalidate the current RSVP link for ${guestName}. They will need a new invitation link. This action cannot be undone.`}
      confirmText={loading ? 'Regenerating...' : 'Regenerate'}
      cancelText="Cancel"
      variant="warning"
      isLoading={loading}
    />
  )
}
