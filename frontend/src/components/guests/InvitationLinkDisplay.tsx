'use client'

import React, { useState } from 'react'
import { Copy, Check, Mail, MessageSquare, Share2, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { InvitationLinkData } from '@/types/guest.types'
import { guestsService } from '@/lib/api/services/guests.service'
import { useTheme } from '@/contexts/ThemeContext'

interface InvitationLinkDisplayProps {
  invitationData: InvitationLinkData
  onCopy?: () => void
  onShare?: (platform: string) => void
}

export function InvitationLinkDisplay({
  invitationData,
  onCopy,
  onShare
}: InvitationLinkDisplayProps) {
  const { theme } = useTheme()
  const [copied, setCopied] = useState(false)
  const [copiedText, setCopiedText] = useState(false)

  const handleCopyLink = async () => {
    const success = await guestsService.copyToClipboard(invitationData.rsvp_url)
    if (success) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      onCopy?.()
    }
  }

  const handleCopyText = async () => {
    const success = await guestsService.copyToClipboard(invitationData.shareable_text)
    if (success) {
      setCopiedText(true)
      setTimeout(() => setCopiedText(false), 2000)
      onCopy?.()
    }
  }

  const handleShare = (platform: string) => {
    const url = invitationData.sharing_links[platform]
    if (url) {
      if (platform === 'email' || platform === 'sms') {
        // For email and SMS, use direct links
        window.location.href = url
      } else {
        // For social media, open in popup
        guestsService.openShareDialog(platform, url)
      }
      onShare?.(platform)
    }
  }

  return (
    <div className="space-y-4">
      {/* RSVP Link Card */}
      <Card className="p-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
              RSVP Link
            </h3>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Token: {invitationData.formatted_token}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex-1 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <code className="text-sm text-gray-900 dark:text-gray-100 break-all">
                {invitationData.rsvp_url}
              </code>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyLink}
              className="shrink-0"
              aria-label={copied ? 'Link copied' : 'Copy link'}
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

          <div className="flex items-center gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(invitationData.rsvp_url, '_blank')}
              className="text-xs"
            >
              <ExternalLink className="w-3 h-3 mr-1" />
              Preview
            </Button>
          </div>
        </div>
      </Card>

      {/* Shareable Text Card */}
      <Card className="p-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Invitation Message
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopyText}
              className="text-xs"
            >
              {copiedText ? (
                <>
                  <Check className="w-3 h-3 mr-1" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3 mr-1" />
                  Copy
                </>
              )}
            </Button>
          </div>

          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-sans">
              {invitationData.shareable_text}
            </pre>
          </div>
        </div>
      </Card>

      {/* Sharing Options */}
      <Card className="p-4">
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
            Share via
          </h3>

          <div className="grid grid-cols-2 gap-2">
            {/* Email */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleShare('email')}
              className="justify-start"
            >
              <Mail className="w-4 h-4 mr-2" />
              Email
            </Button>

            {/* SMS */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleShare('sms')}
              className="justify-start"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              SMS
            </Button>

            {/* WhatsApp */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleShare('whatsapp')}
              className="justify-start"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
              WhatsApp
            </Button>

            {/* More sharing options */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: 'Event Invitation',
                    text: invitationData.shareable_text,
                    url: invitationData.rsvp_url
                  }).catch(() => {
                    // User cancelled or error occurred
                  })
                }
              }}
              className="justify-start"
              disabled={!navigator.share}
            >
              <Share2 className="w-4 h-4 mr-2" />
              More...
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
