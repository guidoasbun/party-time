'use client'

import React, { useState, useEffect } from 'react'
import { Download, Loader2, ZoomIn, ZoomOut } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Select } from '@/components/ui/Select'
import { guestsService } from '@/lib/api/services/guests.service'
import { QRCodeOptions, UUID } from '@/types'
import { useTheme } from '@/contexts/ThemeContext'

interface QRCodeDisplayProps {
  eventId: UUID
  guestId: UUID
  guestName: string
  onDownload?: () => void
}

export function QRCodeDisplay({
  eventId,
  guestId,
  guestName,
  onDownload
}: QRCodeDisplayProps) {
  const { resolvedTheme } = useTheme()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null)
  const [size, setSize] = useState<'small' | 'medium' | 'large'>('medium')
  const [downloading, setDownloading] = useState(false)

  const sizeMap = {
    small: { boxSize: 6, border: 2, label: 'Small (180px)' },
    medium: { boxSize: 10, border: 4, label: 'Medium (300px)' },
    large: { boxSize: 14, border: 5, label: 'Large (420px)' }
  }

  const sizeOptions = [
    { value: 'small', label: 'Small (180px)' },
    { value: 'medium', label: 'Medium (300px)' },
    { value: 'large', label: 'Large (420px)' }
  ]

  useEffect(() => {
    loadQRCode()
  }, [eventId, guestId, size, resolvedTheme])

  const loadQRCode = async () => {
    try {
      setLoading(true)
      setError(null)

      const options: QRCodeOptions = {
        box_size: sizeMap[size].boxSize,
        border: sizeMap[size].border,
        theme: resolvedTheme,
        format: 'base64'
      }

      const base64Data = await guestsService.getQRCodeBase64(eventId, guestId, options)
      setQrCodeUrl(base64Data)
    } catch (err) {
      console.error('Failed to load QR code:', err)
      setError('Failed to load QR code')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async () => {
    try {
      setDownloading(true)
      const options: QRCodeOptions = {
        box_size: sizeMap[size].boxSize,
        border: sizeMap[size].border,
        theme: resolvedTheme,
        format: 'png'
      }
      await guestsService.downloadQRCode(eventId, guestId, guestName, options)
      onDownload?.()
    } catch (err) {
      console.error('Failed to download QR code:', err)
      setError('Failed to download QR code')
    } finally {
      setDownloading(false)
    }
  }

  const handleSizeChange = (value: string | string[]) => {
    setSize(value as 'small' | 'medium' | 'large')
  }

  return (
    <Card className="p-4">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
            QR Code
          </h3>
          <div className="flex items-center gap-2">
            <Select
              options={sizeOptions}
              value={size}
              onValueChange={handleSizeChange}
              className="text-xs w-48"
            />
          </div>
        </div>

        {/* QR Code Display */}
        <div className="flex items-center justify-center p-6 bg-white dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
          {loading ? (
            <div className="flex flex-col items-center gap-3 py-12">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
              <p className="text-sm text-gray-500 dark:text-gray-400">Generating QR code...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center gap-3 py-12">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                <span className="text-red-600 dark:text-red-400 text-xl">!</span>
              </div>
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={loadQRCode}
                className="mt-2"
              >
                Try Again
              </Button>
            </div>
          ) : qrCodeUrl ? (
            <div className="relative group">
              <img
                src={qrCodeUrl}
                alt="RSVP QR Code"
                className={`rounded-lg ${
                  size === 'small'
                    ? 'w-[180px] h-[180px]'
                    : size === 'medium'
                    ? 'w-[300px] h-[300px]'
                    : 'w-[420px] h-[420px]'
                }`}
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                <div className="flex gap-2">
                  {size !== 'large' && (
                    <button
                      onClick={() => setSize(size === 'small' ? 'medium' : 'large')}
                      className="p-2 bg-white dark:bg-gray-800 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      aria-label="Zoom in"
                    >
                      <ZoomIn className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                    </button>
                  )}
                  {size !== 'small' && (
                    <button
                      onClick={() => setSize(size === 'large' ? 'medium' : 'small')}
                      className="p-2 bg-white dark:bg-gray-800 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      aria-label="Zoom out"
                    >
                      <ZoomOut className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Scan to RSVP
          </p>
          <Button
            variant="default"
            size="sm"
            onClick={handleDownload}
            disabled={!qrCodeUrl || downloading}
          >
            {downloading ? (
              <>
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                Downloading...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-1" />
                Download
              </>
            )}
          </Button>
        </div>

        {/* Info */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
          <p className="text-xs text-blue-900 dark:text-blue-100">
            <strong>Tip:</strong> Print this QR code on invitations or display it at your event
            for easy RSVP access.
          </p>
        </div>
      </div>
    </Card>
  )
}
