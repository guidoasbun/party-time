'use client'

/**
 * CSVImportWizard Component
 * Multi-step wizard for importing guests from CSV files
 */

import React, { useState, useCallback } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { FileUpload } from '@/components/ui/FileUpload'
import { ImportPreview } from './ImportPreview'
import { Progress } from '@/components/ui/Progress'
import { Download, Upload, Eye, CheckCircle2, AlertCircle, ArrowRight, ArrowLeft } from 'lucide-react'
import { guestsService } from '@/lib/api/services'
import { useToast } from '@/hooks/useToast'
import { cn } from '@/lib/utils'
import type { UUID, CSVImportPreview, CSVImportResult } from '@/types'

interface CSVImportWizardProps {
  eventId: UUID
  open: boolean
  onClose: () => void
  onImportComplete?: (result: CSVImportResult) => void
}

type WizardStep = 'upload' | 'column-mapping' | 'preview' | 'import'

interface StepConfig {
  key: WizardStep
  title: string
  description: string
  icon: React.ElementType
}

const STEPS: StepConfig[] = [
  {
    key: 'upload',
    title: 'Upload File',
    description: 'Select a CSV file to import',
    icon: Upload
  },
  {
    key: 'column-mapping',
    title: 'Column Mapping',
    description: 'Verify detected columns',
    icon: Eye
  },
  {
    key: 'preview',
    title: 'Preview',
    description: 'Review and validate data',
    icon: Eye
  },
  {
    key: 'import',
    title: 'Import',
    description: 'Import guests',
    icon: CheckCircle2
  }
]

export function CSVImportWizard({
  eventId,
  open,
  onClose,
  onImportComplete
}: CSVImportWizardProps) {
  const { toast } = useToast()

  // Wizard state
  const [currentStep, setCurrentStep] = useState<WizardStep>('upload')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)

  // Preview state
  const [isLoadingPreview, setIsLoadingPreview] = useState(false)
  const [preview, setPreview] = useState<CSVImportPreview | null>(null)
  const [previewError, setPreviewError] = useState<string | null>(null)
  const [skipDuplicates, setSkipDuplicates] = useState(true)

  // Import state
  const [isImporting, setIsImporting] = useState(false)
  const [importProgress, setImportProgress] = useState(0)
  const [importResult, setImportResult] = useState<CSVImportResult | null>(null)
  const [importError, setImportError] = useState<string | null>(null)

  // Get current step index
  const currentStepIndex = STEPS.findIndex(step => step.key === currentStep)

  // File validation
  const validateFile = useCallback((file: File): string | null => {
    const maxSize = 10 * 1024 * 1024 // 10MB
    const validExtensions = ['.csv']
    const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`

    if (!validExtensions.includes(fileExtension)) {
      return 'Invalid file type. Please upload a CSV file.'
    }

    if (file.size > maxSize) {
      return 'File size exceeds 10MB. Please choose a smaller file.'
    }

    return null
  }, [])

  // Handle file selection
  const handleFileSelect = useCallback((file: File) => {
    const error = validateFile(file)
    if (error) {
      setFileError(error)
      setSelectedFile(null)
      return
    }

    setFileError(null)
    setSelectedFile(file)
  }, [validateFile])

  // Handle file removal
  const handleFileRemove = useCallback(() => {
    setSelectedFile(null)
    setFileError(null)
    setPreview(null)
    setPreviewError(null)
  }, [])

  // Load preview
  const handleLoadPreview = useCallback(async () => {
    if (!selectedFile) return

    setIsLoadingPreview(true)
    setPreviewError(null)

    try {
      const previewData = await guestsService.previewCSVImport(eventId, selectedFile)
      setPreview(previewData)
      setCurrentStep('column-mapping')

      toast({
        title: 'Preview loaded',
        description: `Found ${previewData.total_rows} rows in the CSV file`,
        variant: 'default'
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to preview CSV file'
      setPreviewError(errorMessage)
      toast({
        title: 'Preview failed',
        description: errorMessage,
        variant: 'destructive'
      })
    } finally {
      setIsLoadingPreview(false)
    }
  }, [selectedFile, eventId, toast])

  // Execute import
  const handleImport = useCallback(async () => {
    if (!selectedFile || !preview) return

    setIsImporting(true)
    setImportError(null)
    setImportProgress(0)

    // Simulate progress for better UX
    const progressInterval = setInterval(() => {
      setImportProgress(prev => Math.min(prev + 10, 90))
    }, 200)

    try {
      const result = await guestsService.executeCSVImport(eventId, selectedFile, skipDuplicates)

      clearInterval(progressInterval)
      setImportProgress(100)
      setImportResult(result)

      toast({
        title: 'Import successful',
        description: `Successfully imported ${result.success_count} guest${result.success_count !== 1 ? 's' : ''}`,
        variant: 'default'
      })

      // Move to results step
      setCurrentStep('import')

      // Notify parent component
      if (onImportComplete) {
        onImportComplete(result)
      }
    } catch (error) {
      clearInterval(progressInterval)
      const errorMessage = error instanceof Error ? error.message : 'Failed to import guests'
      setImportError(errorMessage)
      setImportProgress(0)

      toast({
        title: 'Import failed',
        description: errorMessage,
        variant: 'destructive'
      })
    } finally {
      setIsImporting(false)
    }
  }, [selectedFile, preview, eventId, skipDuplicates, onImportComplete, toast])

  // Handle wizard navigation
  const handleNext = useCallback(async () => {
    if (currentStep === 'upload') {
      await handleLoadPreview()
    } else if (currentStep === 'column-mapping') {
      setCurrentStep('preview')
    } else if (currentStep === 'preview') {
      await handleImport()
    }
  }, [currentStep, handleLoadPreview, handleImport])

  const handleBack = useCallback(() => {
    if (currentStep === 'column-mapping') {
      setCurrentStep('upload')
      setPreview(null)
    } else if (currentStep === 'preview') {
      setCurrentStep('column-mapping')
    } else if (currentStep === 'import') {
      setCurrentStep('preview')
    }
  }, [currentStep])

  // Reset wizard state
  const handleReset = useCallback(() => {
    setCurrentStep('upload')
    setSelectedFile(null)
    setFileError(null)
    setPreview(null)
    setPreviewError(null)
    setSkipDuplicates(true)
    setImportResult(null)
    setImportError(null)
    setImportProgress(0)
  }, [])

  // Handle wizard close
  const handleClose = useCallback(() => {
    handleReset()
    onClose()
  }, [handleReset, onClose])

  // Download sample CSV
  const handleDownloadSample = useCallback(() => {
    const sampleCSV = [
      'email,first_name,last_name,phone,plus_one_allowed,plus_one_name,dietary_restrictions,notes',
      'john.doe@example.com,John,Doe,+1234567890,true,Jane Doe,Vegetarian,VIP guest',
      'jane.smith@example.com,Jane,Smith,+0987654321,false,,,',
      'bob.johnson@example.com,Bob,Johnson,,true,,Gluten-free,Needs parking'
    ].join('\n')

    const blob = new Blob([sampleCSV], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'guest-import-sample.csv'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)

    toast({
      title: 'Sample downloaded',
      description: 'Check your downloads folder for guest-import-sample.csv',
      variant: 'default'
    })
  }, [toast])

  // Determine if next button should be enabled
  const canProceed =
    (currentStep === 'upload' && selectedFile && !fileError) ||
    (currentStep === 'column-mapping' && preview) ||
    (currentStep === 'preview' && preview && !isImporting)

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 'upload':
        return (
          <div className="space-y-6">
            <FileUpload
              onFileSelect={handleFileSelect}
              onFileRemove={handleFileRemove}
              accept=".csv"
              maxSize={10 * 1024 * 1024}
              selectedFile={selectedFile}
              error={fileError || previewError}
              disabled={isLoadingPreview}
            />

            <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50 border border-border">
              <Download className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground mb-1">
                  Need a template?
                </p>
                <p className="text-xs text-muted-foreground mb-3">
                  Download our sample CSV file to see the correct format and required columns.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadSample}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Sample CSV
                </Button>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-muted/30 border border-border">
              <h4 className="text-sm font-semibold text-foreground mb-2">CSV Format Guidelines</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Required columns: email, first_name, last_name</li>
                <li>• Optional columns: phone, plus_one_allowed, plus_one_name, dietary_restrictions, notes</li>
                <li>• Column names are flexible (e.g., &quot;First Name&quot;, &quot;first_name&quot;, &quot;firstName&quot; all work)</li>
                <li>• Maximum file size: 10MB</li>
                <li>• Supports up to 1000+ guests per file</li>
              </ul>
            </div>
          </div>
        )

      case 'column-mapping':
        return (
          <div className="space-y-4">
            {preview && (
              <>
                <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-green-900 dark:text-green-100">
                        Columns detected successfully
                      </p>
                      <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                        We automatically detected {Object.keys(preview.column_mapping).length} column{Object.keys(preview.column_mapping).length !== 1 ? 's' : ''} in your CSV file.
                        Review the mapping below and proceed to preview your data.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg border border-border bg-card">
                  <h3 className="text-sm font-semibold text-foreground mb-4">Column Mapping</h3>
                  <div className="space-y-3">
                    {Object.entries(preview.column_mapping).map(([csvColumn, fieldName]) => (
                      <div
                        key={csvColumn}
                        className="flex items-center gap-4 p-3 rounded-md bg-muted/30"
                      >
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">{csvColumn}</p>
                          <p className="text-xs text-muted-foreground">CSV Column</p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-primary">{fieldName}</p>
                          <p className="text-xs text-muted-foreground">Guest Field</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )

      case 'preview':
        return (
          <div className="space-y-4">
            {preview ? (
              <ImportPreview
                preview={preview}
                skipDuplicates={skipDuplicates}
                onSkipDuplicatesChange={setSkipDuplicates}
              />
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                No preview available
              </div>
            )}
          </div>
        )

      case 'import':
        return (
          <div className="space-y-6">
            {isImporting && (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                    <Upload className="h-8 w-8 text-primary animate-pulse" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Importing guests...
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Please wait while we import your guests
                  </p>
                </div>
                <Progress value={importProgress} className="h-3" />
                <p className="text-center text-sm text-muted-foreground">
                  {importProgress}% complete
                </p>
              </div>
            )}

            {importResult && !isImporting && (
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-base font-semibold text-green-900 dark:text-green-100 mb-1">
                        Import completed successfully!
                      </p>
                      <p className="text-sm text-green-700 dark:text-green-300">
                        {importResult.success_count} guest{importResult.success_count !== 1 ? 's' : ''} imported successfully
                      </p>
                    </div>
                  </div>
                </div>

                {/* Import statistics */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg border border-border bg-card text-center">
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {importResult.success_count}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Imported</p>
                  </div>
                  <div className="p-4 rounded-lg border border-border bg-card text-center">
                    <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                      {importResult.skipped_count}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Skipped</p>
                  </div>
                  <div className="p-4 rounded-lg border border-border bg-card text-center">
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                      {importResult.error_count}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Errors</p>
                  </div>
                </div>

                {/* Error details */}
                {importResult.errors && importResult.errors.length > 0 && (
                  <div className="p-4 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20">
                    <div className="flex items-start gap-3 mb-3">
                      <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                      <p className="text-sm font-medium text-red-900 dark:text-red-100">
                        Some errors occurred during import
                      </p>
                    </div>
                    <ul className="space-y-1 text-sm text-red-700 dark:text-red-300 ml-8">
                      {importResult.errors.slice(0, 5).map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                      {importResult.errors.length > 5 && (
                        <li className="text-xs text-red-600 dark:text-red-400">
                          ... and {importResult.errors.length - 5} more error{importResult.errors.length - 5 !== 1 ? 's' : ''}
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {importError && !isImporting && (
              <div className="p-4 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-900 dark:text-red-100 mb-1">
                      Import failed
                    </p>
                    <p className="text-sm text-red-700 dark:text-red-300">
                      {importError}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Import Guests from CSV"
      size="xl"
      closeOnClickOutside={!isImporting && !isLoadingPreview}
      footer={
        <div className="flex items-center justify-between gap-4">
          {/* Progress indicator */}
          <div className="flex items-center gap-2">
            {STEPS.map((step, index) => (
              <div
                key={step.key}
                className={cn(
                  'h-2 rounded-full transition-all duration-300',
                  index <= currentStepIndex ? 'bg-primary' : 'bg-muted',
                  index === currentStepIndex ? 'w-8' : 'w-2'
                )}
                aria-label={`Step ${index + 1}: ${step.title}`}
              />
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3">
            {currentStep !== 'upload' && currentStep !== 'import' && (
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                disabled={isImporting || isLoadingPreview}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            )}

            {currentStep === 'import' ? (
              <Button
                type="button"
                onClick={handleClose}
              >
                Done
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleNext}
                disabled={!canProceed || isImporting || isLoadingPreview}
              >
                {isLoadingPreview ? (
                  <>Loading preview...</>
                ) : isImporting ? (
                  <>Importing...</>
                ) : currentStep === 'preview' ? (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Import {preview?.valid_rows || 0} Guest{preview?.valid_rows !== 1 ? 's' : ''}
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      }
    >
      {/* Step header */}
      <div className="mb-6 pb-6 border-b border-border">
        <div className="flex items-center gap-3 mb-2">
          {React.createElement(STEPS[currentStepIndex].icon, {
            className: 'h-5 w-5 text-primary'
          })}
          <h3 className="text-lg font-semibold text-foreground">
            {STEPS[currentStepIndex].title}
          </h3>
        </div>
        <p className="text-sm text-muted-foreground">
          {STEPS[currentStepIndex].description}
        </p>
      </div>

      {/* Step content */}
      <div className="min-h-[400px]">
        {renderStepContent()}
      </div>
    </Modal>
  )
}
