'use client'

/**
 * Share Event Button Component
 * Provides multiple ways to share an event (link, email, social)
 */

import React, { useState, useRef, useEffect } from 'react'
import { Share2, Link2, Mail, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/hooks/useToast'
import type { UUID } from '@/types'

interface ShareEventButtonProps {
  eventId: UUID
  eventName: string
  className?: string
}

export function ShareEventButton({ eventId, eventName, className }: ShareEventButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isCopying, setIsCopying] = useState(false)
  const [copySuccess, setCopySuccess] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  const eventUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/events/${eventId}`
    : ''

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

  const handleCopyLink = async () => {
    setIsCopying(true)

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(eventUrl)
      } else {
        // Fallback for non-secure contexts
        const textArea = document.createElement('textarea')
        textArea.value = eventUrl
        textArea.style.position = 'fixed'
        textArea.style.left = '-999999px'
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
      }

      setCopySuccess(true)
      toast({
        title: 'Link copied',
        description: 'Event link has been copied to clipboard.',
        variant: 'success',
      })

      // Reset success state after animation
      setTimeout(() => {
        setCopySuccess(false)
        setIsOpen(false)
      }, 1500)
    } catch {
      toast({
        title: 'Failed to copy link',
        description: 'Please copy the URL from your browser address bar.',
        variant: 'destructive',
      })
    } finally {
      setIsCopying(false)
    }
  }

  const handleEmailShare = () => {
    const subject = encodeURIComponent(`Check out this event: ${eventName}`)
    const body = encodeURIComponent(
      `I wanted to share this event with you:\n\n${eventName}\n\n${eventUrl}`
    )
    window.location.href = `mailto:?subject=${subject}&body=${body}`
    setIsOpen(false)
  }

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: eventName,
          text: `Check out this event: ${eventName}`,
          url: eventUrl,
        })
        setIsOpen(false)
      } catch (error) {
        // User cancelled share or error occurred
        if ((error as Error).name !== 'AbortError') {
          toast({
            title: 'Share failed',
            description: 'Unable to share event.',
            variant: 'destructive',
          })
        }
      }
    }
  }

  // Check if native share is available
  const hasNativeShare = typeof navigator !== 'undefined' && navigator.share

  return (
    <div className={`relative ${className || ''}`} ref={dropdownRef}>
      <Button
        variant="outline"
        size="md"
        onClick={() => setIsOpen(!isOpen)}
        className="gap-2"
        aria-label="Share event"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Share2 className="h-4 w-4" />
        <span className="hidden sm:inline">Share</span>
      </Button>

      {/* Dropdown menu */}
      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-50 overflow-hidden"
          role="menu"
          aria-orientation="vertical"
        >
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                Share Event
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded transition-colors"
                aria-label="Close share menu"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Share options */}
          <div className="py-2">
            {/* Copy link option */}
            <button
              onClick={handleCopyLink}
              disabled={isCopying || copySuccess}
              className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              role="menuitem"
            >
              {copySuccess ? (
                <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
              ) : (
                <Link2 className="h-5 w-5 text-gray-600 dark:text-gray-400 flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {copySuccess ? 'Link copied!' : 'Copy link'}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {eventUrl}
                </div>
              </div>
            </button>

            {/* Email option */}
            <button
              onClick={handleEmailShare}
              className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              role="menuitem"
            >
              <Mail className="h-5 w-5 text-gray-600 dark:text-gray-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Share via email
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Open email client
                </div>
              </div>
            </button>

            {/* Native share (mobile) */}
            {hasNativeShare && (
              <button
                onClick={handleNativeShare}
                className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                role="menuitem"
              >
                <Share2 className="h-5 w-5 text-gray-600 dark:text-gray-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    More options
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Share via apps
                  </div>
                </div>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
