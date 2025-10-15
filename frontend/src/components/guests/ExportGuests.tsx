'use client'

/**
 * ExportGuests Component
 * Export guest list as CSV and provide print-friendly view
 */

import React, { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Download, Printer, X } from 'lucide-react'
import { Guest, RsvpStatus, UUID } from '@/types'
import { cn } from '@/lib/utils'

interface ExportGuestsProps {
  guests: Guest[]
  eventId: UUID
  eventName?: string
  className?: string
}

interface ExportOptions {
  filterByStatus?: RsvpStatus | 'all'
  includeDietaryOnly?: boolean
  includePlusOnesOnly?: boolean
  fields: {
    name: boolean
    email: boolean
    phone: boolean
    rsvpStatus: boolean
    plusOne: boolean
    dietaryRestrictions: boolean
  }
}

export function ExportGuests({ guests, eventId, eventName, className }: ExportGuestsProps) {
  const [showOptions, setShowOptions] = useState(false)
  const [options, setOptions] = useState<ExportOptions>({
    filterByStatus: 'all',
    includeDietaryOnly: false,
    includePlusOnesOnly: false,
    fields: {
      name: true,
      email: true,
      phone: true,
      rsvpStatus: true,
      plusOne: true,
      dietaryRestrictions: true
    }
  })

  // Filter guests based on options
  const getFilteredGuests = (): Guest[] => {
    let filtered = [...guests]

    // Filter by RSVP status
    if (options.filterByStatus && options.filterByStatus !== 'all') {
      filtered = filtered.filter(g => g.rsvp_status === options.filterByStatus)
    }

    // Filter by dietary restrictions
    if (options.includeDietaryOnly) {
      filtered = filtered.filter(g => g.dietary_restrictions && g.dietary_restrictions.length > 0)
    }

    // Filter by plus ones
    if (options.includePlusOnesOnly) {
      filtered = filtered.filter(g => g.plus_one_allowed && g.plus_one_name)
    }

    return filtered
  }

  // Generate CSV content
  const generateCSV = (): string => {
    const filteredGuests = getFilteredGuests()
    const headers: string[] = []
    const { fields } = options

    // Build headers based on selected fields
    if (fields.name) headers.push('First Name', 'Last Name')
    if (fields.email) headers.push('Email')
    if (fields.phone) headers.push('Phone')
    if (fields.rsvpStatus) headers.push('RSVP Status')
    if (fields.plusOne) headers.push('Plus One Allowed', 'Plus One Name')
    if (fields.dietaryRestrictions) headers.push('Dietary Restrictions')

    const rows = filteredGuests.map(guest => {
      const row: string[] = []

      if (fields.name) {
        row.push(`"${guest.first_name}"`, `"${guest.last_name}"`)
      }
      if (fields.email) row.push(`"${guest.email}"`)
      if (fields.phone) row.push(`"${guest.phone || ''}"`)
      if (fields.rsvpStatus) row.push(`"${guest.rsvp_status}"`)
      if (fields.plusOne) {
        row.push(guest.plus_one_allowed ? 'Yes' : 'No', `"${guest.plus_one_name || ''}"`)
      }
      if (fields.dietaryRestrictions) row.push(`"${guest.dietary_restrictions || ''}"`)

      return row.join(',')
    })

    return [headers.join(','), ...rows].join('\n')
  }

  // Download CSV file
  const handleExportCSV = (): void => {
    const csv = generateCSV()
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${eventName || 'event'}-guests-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // Open print dialog with formatted view
  const handlePrint = (): void => {
    const filteredGuests = getFilteredGuests()
    const { fields } = options

    // Create print window content
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${eventName || 'Event'} - Guest List</title>
          <style>
            @media print {
              body {
                font-family: Arial, sans-serif;
                padding: 20px;
                color: #000;
                background: #fff;
              }
              h1 {
                font-size: 24px;
                margin-bottom: 10px;
                border-bottom: 2px solid #000;
                padding-bottom: 10px;
              }
              .meta {
                font-size: 12px;
                color: #666;
                margin-bottom: 20px;
              }
              table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 20px;
                page-break-inside: auto;
              }
              tr {
                page-break-inside: avoid;
                page-break-after: auto;
              }
              th {
                background-color: #f3f4f6;
                border: 1px solid #d1d5db;
                padding: 8px;
                text-align: left;
                font-weight: bold;
                font-size: 12px;
              }
              td {
                border: 1px solid #e5e7eb;
                padding: 8px;
                font-size: 11px;
              }
              .status-attending { color: #10b981; font-weight: bold; }
              .status-not-attending { color: #ef4444; font-weight: bold; }
              .status-maybe { color: #f59e0b; font-weight: bold; }
              .status-pending { color: #6b7280; }
            }
          </style>
        </head>
        <body>
          <h1>${eventName || 'Event'} - Guest List</h1>
          <div class="meta">
            <p>Generated: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
            <p>Total Guests: ${filteredGuests.length}</p>
          </div>
          <table>
            <thead>
              <tr>
                ${fields.name ? '<th>First Name</th><th>Last Name</th>' : ''}
                ${fields.email ? '<th>Email</th>' : ''}
                ${fields.phone ? '<th>Phone</th>' : ''}
                ${fields.rsvpStatus ? '<th>RSVP Status</th>' : ''}
                ${fields.plusOne ? '<th>Plus One</th>' : ''}
                ${fields.dietaryRestrictions ? '<th>Dietary Restrictions</th>' : ''}
              </tr>
            </thead>
            <tbody>
              ${filteredGuests.map(guest => `
                <tr>
                  ${fields.name ? `<td>${guest.first_name}</td><td>${guest.last_name}</td>` : ''}
                  ${fields.email ? `<td>${guest.email}</td>` : ''}
                  ${fields.phone ? `<td>${guest.phone || '-'}</td>` : ''}
                  ${fields.rsvpStatus ? `<td class="status-${guest.rsvp_status}">${guest.rsvp_status.replace('_', ' ')}</td>` : ''}
                  ${fields.plusOne ? `<td>${guest.plus_one_name || (guest.plus_one_allowed ? 'Allowed' : 'No')}</td>` : ''}
                  ${fields.dietaryRestrictions ? `<td>${guest.dietary_restrictions || '-'}</td>` : ''}
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `

    // Open print window
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(printContent)
      printWindow.document.close()
      printWindow.focus()
      setTimeout(() => {
        printWindow.print()
        printWindow.close()
      }, 250)
    }
  }

  const filteredCount = getFilteredGuests().length

  return (
    <div className={cn('space-y-4', className)}>
      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleExportCSV}
          className="gap-2"
          disabled={guests.length === 0}
        >
          <Download className="h-4 w-4" />
          Export CSV
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handlePrint}
          className="gap-2"
          disabled={guests.length === 0}
        >
          <Printer className="h-4 w-4" />
          Print List
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowOptions(!showOptions)}
          className="gap-2"
        >
          {showOptions ? 'Hide' : 'Show'} Options
        </Button>
      </div>

      {/* Export Options */}
      {showOptions && (
        <div className="p-4 bg-muted/50 rounded-lg border border-border space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Export Options</h3>
            <button
              onClick={() => setShowOptions(false)}
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Close options"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Filter by Status */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Filter by RSVP Status
            </label>
            <select
              value={options.filterByStatus}
              onChange={(e) => setOptions({ ...options, filterByStatus: e.target.value as RsvpStatus | 'all' })}
              className="w-full p-2 text-sm bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Guests</option>
              <option value={RsvpStatus.ATTENDING}>Attending Only</option>
              <option value={RsvpStatus.NOT_ATTENDING}>Not Attending Only</option>
              <option value={RsvpStatus.MAYBE}>Maybe Only</option>
              <option value={RsvpStatus.PENDING}>Pending Only</option>
            </select>
          </div>

          {/* Additional Filters */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={options.includeDietaryOnly}
                onChange={(e) => setOptions({ ...options, includeDietaryOnly: e.target.checked })}
                className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-primary"
              />
              <span className="text-foreground">Only guests with dietary restrictions</span>
            </label>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={options.includePlusOnesOnly}
                onChange={(e) => setOptions({ ...options, includePlusOnesOnly: e.target.checked })}
                className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-primary"
              />
              <span className="text-foreground">Only guests with confirmed plus-ones</span>
            </label>
          </div>

          {/* Field Selection */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Include Fields
            </label>
            <div className="grid grid-cols-2 gap-2">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={options.fields.name}
                  onChange={(e) => setOptions({ ...options, fields: { ...options.fields, name: e.target.checked } })}
                  className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-primary"
                />
                <span className="text-foreground">Name</span>
              </label>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={options.fields.email}
                  onChange={(e) => setOptions({ ...options, fields: { ...options.fields, email: e.target.checked } })}
                  className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-primary"
                />
                <span className="text-foreground">Email</span>
              </label>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={options.fields.phone}
                  onChange={(e) => setOptions({ ...options, fields: { ...options.fields, phone: e.target.checked } })}
                  className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-primary"
                />
                <span className="text-foreground">Phone</span>
              </label>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={options.fields.rsvpStatus}
                  onChange={(e) => setOptions({ ...options, fields: { ...options.fields, rsvpStatus: e.target.checked } })}
                  className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-primary"
                />
                <span className="text-foreground">RSVP Status</span>
              </label>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={options.fields.plusOne}
                  onChange={(e) => setOptions({ ...options, fields: { ...options.fields, plusOne: e.target.checked } })}
                  className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-primary"
                />
                <span className="text-foreground">Plus One</span>
              </label>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={options.fields.dietaryRestrictions}
                  onChange={(e) => setOptions({ ...options, fields: { ...options.fields, dietaryRestrictions: e.target.checked } })}
                  className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-primary"
                />
                <span className="text-foreground">Dietary Restrictions</span>
              </label>
            </div>
          </div>

          {/* Preview count */}
          <div className="pt-2 border-t border-border">
            <p className="text-sm text-muted-foreground">
              {filteredCount} of {guests.length} guests will be exported
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
