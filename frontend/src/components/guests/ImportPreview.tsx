'use client'

/**
 * ImportPreview Component
 * Displays CSV import preview with statistics, duplicates, and errors
 */

import React, { useState } from 'react'
import { CheckCircle2, AlertTriangle, XCircle, ChevronDown, ChevronRight, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { CSVImportPreview, DuplicateDetail, ImportErrorDetail } from '@/types'

interface ImportPreviewProps {
  preview: CSVImportPreview
  skipDuplicates: boolean
  onSkipDuplicatesChange: (skip: boolean) => void
  className?: string
}

export function ImportPreview({
  preview,
  skipDuplicates,
  onSkipDuplicatesChange,
  className
}: ImportPreviewProps) {
  const [showDuplicates, setShowDuplicates] = useState(false)
  const [showErrors, setShowErrors] = useState(false)
  const [showSamples, setShowSamples] = useState(true)

  const {
    total_rows,
    valid_rows,
    duplicate_rows,
    error_rows,
    duplicates,
    errors,
    sample_guests,
    column_mapping
  } = preview

  const hasIssues = duplicate_rows > 0 || error_rows > 0

  return (
    <div className={cn('space-y-6', className)}>
      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Rows */}
        <div className="p-4 rounded-lg border border-border bg-card">
          <div className="flex items-center gap-2 mb-1">
            <Users className="h-4 w-4 text-muted-foreground" />
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Total
            </p>
          </div>
          <p className="text-2xl font-bold text-foreground">{total_rows}</p>
        </div>

        {/* Valid Rows */}
        <div className="p-4 rounded-lg border border-border bg-card">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Valid
            </p>
          </div>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{valid_rows}</p>
        </div>

        {/* Duplicate Rows */}
        <div className="p-4 rounded-lg border border-border bg-card">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Duplicates
            </p>
          </div>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{duplicate_rows}</p>
        </div>

        {/* Error Rows */}
        <div className="p-4 rounded-lg border border-border bg-card">
          <div className="flex items-center gap-2 mb-1">
            <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Errors
            </p>
          </div>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">{error_rows}</p>
        </div>
      </div>

      {/* Column Mapping */}
      <div className="p-4 rounded-lg border border-border bg-card">
        <h3 className="text-sm font-semibold text-foreground mb-3">Detected Columns</h3>
        <div className="flex flex-wrap gap-2">
          {Object.entries(column_mapping).map(([csvColumn, fieldName]) => (
            <div
              key={csvColumn}
              className="px-3 py-1.5 rounded-md bg-primary/10 text-primary text-xs font-medium"
            >
              {csvColumn} → {fieldName}
            </div>
          ))}
        </div>
      </div>

      {/* Skip Duplicates Option */}
      {duplicate_rows > 0 && (
        <div className="p-4 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={skipDuplicates}
              onChange={(e) => onSkipDuplicatesChange(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-amber-300 dark:border-amber-700 text-primary focus:ring-2 focus:ring-ring focus:ring-offset-2"
            />
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                Skip duplicate guests
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                Only import new guests and skip {duplicate_rows} duplicate{duplicate_rows !== 1 ? 's' : ''} found in the CSV or database
              </p>
            </div>
          </label>
        </div>
      )}

      {/* Duplicates Section */}
      {duplicates.length > 0 && (
        <div className="border border-border rounded-lg overflow-hidden">
          <button
            type="button"
            onClick={() => setShowDuplicates(!showDuplicates)}
            className="w-full px-4 py-3 flex items-center justify-between bg-amber-50 dark:bg-amber-950/20 hover:bg-amber-100 dark:hover:bg-amber-950/30 transition-colors"
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              <h3 className="text-sm font-semibold text-foreground">
                Duplicate Guests ({duplicates.length})
              </h3>
            </div>
            {showDuplicates ? (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            )}
          </button>

          {showDuplicates && (
            <div className="p-4 bg-card space-y-2 max-h-60 overflow-y-auto">
              {duplicates.map((duplicate: DuplicateDetail, index: number) => (
                <div
                  key={index}
                  className="p-3 rounded-md border border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/10"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">
                        {duplicate.first_name} {duplicate.last_name}
                      </p>
                      <p className="text-xs text-muted-foreground">{duplicate.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                        Row {duplicate.row_number}
                      </p>
                      <p className="text-xs text-muted-foreground">{duplicate.reason}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Errors Section */}
      {errors.length > 0 && (
        <div className="border border-border rounded-lg overflow-hidden">
          <button
            type="button"
            onClick={() => setShowErrors(!showErrors)}
            className="w-full px-4 py-3 flex items-center justify-between bg-red-50 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-950/30 transition-colors"
          >
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
              <h3 className="text-sm font-semibold text-foreground">
                Validation Errors ({errors.length})
              </h3>
            </div>
            {showErrors ? (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            )}
          </button>

          {showErrors && (
            <div className="p-4 bg-card space-y-2 max-h-60 overflow-y-auto">
              {errors.map((error: ImportErrorDetail, index: number) => (
                <div
                  key={index}
                  className="p-3 rounded-md border border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-950/10"
                >
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <p className="text-xs text-red-600 dark:text-red-400 font-medium">
                      Row {error.row_number}
                    </p>
                  </div>
                  <ul className="space-y-1">
                    {error.errors.map((err, errIndex) => (
                      <li key={errIndex} className="text-xs text-red-700 dark:text-red-300">
                        • {err}
                      </li>
                    ))}
                  </ul>
                  {Object.keys(error.data).length > 0 && (
                    <div className="mt-2 pt-2 border-t border-red-200 dark:border-red-800">
                      <p className="text-xs text-muted-foreground">
                        Data: {JSON.stringify(error.data)}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Sample Guests Preview */}
      {sample_guests.length > 0 && (
        <div className="border border-border rounded-lg overflow-hidden">
          <button
            type="button"
            onClick={() => setShowSamples(!showSamples)}
            className="w-full px-4 py-3 flex items-center justify-between bg-muted hover:bg-muted/80 transition-colors"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
              <h3 className="text-sm font-semibold text-foreground">
                Sample Valid Guests (first {sample_guests.length})
              </h3>
            </div>
            {showSamples ? (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            )}
          </button>

          {showSamples && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Phone
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Plus One
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-card">
                  {sample_guests.map((guest, index) => (
                    <tr key={index} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 text-sm text-foreground">
                        {guest.first_name} {guest.last_name}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {guest.email}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {guest.phone || '—'}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {guest.plus_one_allowed ? 'Yes' : 'No'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Summary Message */}
      {hasIssues ? (
        <div className="p-4 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                Import Summary
              </p>
              <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                {valid_rows} guest{valid_rows !== 1 ? 's' : ''} will be imported.
                {duplicate_rows > 0 && ` ${duplicate_rows} duplicate${duplicate_rows !== 1 ? 's' : ''} will be ${skipDuplicates ? 'skipped' : 'included'}.`}
                {error_rows > 0 && ` ${error_rows} row${error_rows !== 1 ? 's' : ''} with errors will be skipped.`}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-lg border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-green-900 dark:text-green-100">
                Ready to import
              </p>
              <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                All {valid_rows} guest{valid_rows !== 1 ? 's' : ''} are valid and ready to be imported.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
