'use client'

/**
 * FileUpload Component
 * Drag-and-drop file upload with validation and visual feedback
 */

import React, { useCallback, useState, useRef } from 'react'
import { Upload, X, FileText, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FileUploadProps {
  onFileSelect: (file: File) => void
  onFileRemove?: () => void
  accept?: string
  maxSize?: number // in bytes
  disabled?: boolean
  selectedFile?: File | null
  error?: string | null
  className?: string
}

const DEFAULT_ACCEPT = '.csv'
const DEFAULT_MAX_SIZE = 10 * 1024 * 1024 // 10MB

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

export function FileUpload({
  onFileSelect,
  onFileRemove,
  accept = DEFAULT_ACCEPT,
  maxSize = DEFAULT_MAX_SIZE,
  disabled = false,
  selectedFile = null,
  error = null,
  className
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFile = useCallback(
    (file: File): string | null => {
      // Check file type
      const acceptedTypes = accept.split(',').map(type => type.trim())
      const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`
      const isValidType = acceptedTypes.some(type => {
        if (type === fileExtension) return true
        // Check MIME type
        if (type.startsWith('.')) return false
        return file.type === type
      })

      if (!isValidType) {
        return `Invalid file type. Please upload a ${accept} file.`
      }

      // Check file size
      if (file.size > maxSize) {
        return `File size exceeds ${formatFileSize(maxSize)}. Please choose a smaller file.`
      }

      return null
    },
    [accept, maxSize]
  )

  const handleFileChange = useCallback(
    (file: File | null) => {
      if (!file) return

      const validationError = validateFile(file)
      if (validationError) {
        // If there's an error, we still need to notify the parent
        // The parent will handle displaying the error
        return
      }

      onFileSelect(file)
    },
    [validateFile, onFileSelect]
  )

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (!disabled) {
      setIsDragging(true)
    }
  }, [disabled])

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)

      if (disabled) return

      const files = e.dataTransfer.files
      if (files && files.length > 0) {
        const file = files[0]
        const validationError = validateFile(file)
        if (!validationError) {
          handleFileChange(file)
        }
      }
    },
    [disabled, validateFile, handleFileChange]
  )

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files
      if (files && files.length > 0) {
        const file = files[0]
        const validationError = validateFile(file)
        if (!validationError) {
          handleFileChange(file)
        }
      }
    },
    [validateFile, handleFileChange]
  )

  const handleClick = useCallback(() => {
    if (!disabled) {
      fileInputRef.current?.click()
    }
  }, [disabled])

  const handleRemove = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      if (onFileRemove) {
        onFileRemove()
      }
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    },
    [onFileRemove]
  )

  return (
    <div className={cn('w-full', className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleInputChange}
        className="hidden"
        disabled={disabled}
        aria-label="File upload input"
      />

      {!selectedFile ? (
        <div
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
          className={cn(
            'relative border-2 border-dashed rounded-lg p-8 transition-all duration-200',
            'flex flex-col items-center justify-center gap-4 cursor-pointer',
            'hover:bg-accent/50',
            isDragging && 'border-primary bg-primary/10 scale-[1.02]',
            !isDragging && 'border-border',
            disabled && 'opacity-50 cursor-not-allowed',
            error && 'border-destructive bg-destructive/5'
          )}
          role="button"
          tabIndex={0}
          aria-label="Upload file"
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              handleClick()
            }
          }}
        >
          <div className={cn(
            'p-4 rounded-full transition-colors',
            isDragging ? 'bg-primary/20' : 'bg-accent'
          )}>
            <Upload className={cn(
              'h-8 w-8 transition-colors',
              isDragging ? 'text-primary' : 'text-muted-foreground'
            )} />
          </div>

          <div className="text-center space-y-2">
            <p className="text-sm font-medium text-foreground">
              {isDragging ? 'Drop your file here' : 'Drag and drop your CSV file here'}
            </p>
            <p className="text-xs text-muted-foreground">
              or click to browse
            </p>
            <p className="text-xs text-muted-foreground">
              Maximum file size: {formatFileSize(maxSize)}
            </p>
          </div>
        </div>
      ) : (
        <div className={cn(
          'relative border-2 rounded-lg p-4 transition-all duration-200',
          'flex items-center gap-4',
          error ? 'border-destructive bg-destructive/5' : 'border-border bg-accent/30'
        )}>
          <div className={cn(
            'p-3 rounded-lg',
            error ? 'bg-destructive/10' : 'bg-primary/10'
          )}>
            <FileText className={cn(
              'h-6 w-6',
              error ? 'text-destructive' : 'text-primary'
            )} />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {selectedFile.name}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatFileSize(selectedFile.size)}
            </p>
          </div>

          {!disabled && (
            <button
              type="button"
              onClick={handleRemove}
              className={cn(
                'p-2 rounded-md transition-colors',
                'text-muted-foreground hover:text-foreground hover:bg-accent',
                'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'
              )}
              aria-label="Remove file"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      )}

      {error && (
        <div className="mt-2 flex items-start gap-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}
    </div>
  )
}
