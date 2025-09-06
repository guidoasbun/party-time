'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import { getErrorMessage } from '@/lib/queries/auth'

const verificationSchema = z.object({
  verification_code: z.string()
    .min(6, 'Verification code must be 6 digits')
    .max(6, 'Verification code must be 6 digits')
    .regex(/^\d{6}$/, 'Verification code must contain only numbers'),
})

type VerificationFormData = z.infer<typeof verificationSchema>

interface EmailVerificationProps {
  email: string
  onSuccess?: () => void
  onBack?: () => void
}

export function EmailVerification({ email, onSuccess, onBack }: EmailVerificationProps) {
  const {
    verifyEmail,
    resendVerification,
    isVerifyingEmail,
    isResendingVerification,
    verifyEmailError,
    resendVerificationError,
  } = useAuth()
  
  const [resendTimer, setResendTimer] = useState(0)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [resendMessage, setResendMessage] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<VerificationFormData>({
    resolver: zodResolver(verificationSchema),
  })

  const verificationCode = watch('verification_code')

  // Auto-submit when 6 digits are entered
  useEffect(() => {
    if (verificationCode && verificationCode.length === 6 && /^\d{6}$/.test(verificationCode)) {
      handleSubmit(onSubmit)()
    }
  }, [verificationCode])

  // Resend timer countdown
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [resendTimer])

  const onSubmit = async (data: VerificationFormData) => {
    try {
      setSuccessMessage(null)
      const result = await verifyEmail({
        email,
        verification_code: data.verification_code,
      })
      
      setSuccessMessage(result.message)
      reset()
      
      // Wait a moment to show success message, then call onSuccess
      setTimeout(() => {
        onSuccess?.()
      }, 2000)
    } catch (error) {
      // Error is handled by the useAuth hook
      console.error('Email verification failed:', error)
    }
  }

  const handleResendCode = async () => {
    try {
      setResendMessage(null)
      const result = await resendVerification(email)
      setResendMessage(result.message)
      setResendTimer(60) // 60 second cooldown
    } catch (error) {
      // Error is handled by the useAuth hook
      console.error('Resend verification failed:', error)
    }
  }

  const formatEmail = (email: string) => {
    const [local, domain] = email.split('@')
    if (local.length <= 2) return email
    const maskedLocal = local[0] + '*'.repeat(local.length - 2) + local[local.length - 1]
    return `${maskedLocal}@${domain}`
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white shadow-md rounded-lg px-8 pt-6 pb-8 mb-4">
        <div className="mb-6 text-center">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Check Your Email</h2>
          <p className="text-gray-600">
            We've sent a 6-digit verification code to
            <br />
            <span className="font-medium">{formatEmail(email)}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Verification Code Field */}
          <div>
            <label htmlFor="verification_code" className="block text-sm font-medium text-gray-700 mb-1 text-center">
              Enter Verification Code
            </label>
            <input
              {...register('verification_code')}
              type="text"
              id="verification_code"
              maxLength={6}
              className="w-full px-4 py-3 text-2xl text-center border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 font-mono tracking-wider"
              placeholder="000000"
              autoComplete="one-time-code"
            />
            {errors.verification_code && (
              <p className="mt-1 text-sm text-red-600 text-center">{errors.verification_code.message}</p>
            )}
          </div>

          {/* Error Display */}
          {verifyEmailError && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-sm text-red-600 text-center">
                {getErrorMessage(verifyEmailError)}
              </p>
            </div>
          )}

          {/* Success Display */}
          {successMessage && (
            <div className="bg-green-50 border border-green-200 rounded-md p-3">
              <p className="text-sm text-green-600 text-center">{successMessage}</p>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isVerifyingEmail}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400"
          >
            {isVerifyingEmail ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Verifying...
              </span>
            ) : (
              'Verify Email'
            )}
          </Button>
        </form>

        {/* Resend Section */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 mb-3">Didn't receive the code?</p>
          
          {resendMessage && (
            <div className="bg-green-50 border border-green-200 rounded-md p-3 mb-3">
              <p className="text-sm text-green-600">{resendMessage}</p>
            </div>
          )}
          
          {resendVerificationError && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-3">
              <p className="text-sm text-red-600">
                {getErrorMessage(resendVerificationError)}
              </p>
            </div>
          )}
          
          <Button
            type="button"
            variant="outline"
            onClick={handleResendCode}
            disabled={isResendingVerification || resendTimer > 0}
            className="w-full"
          >
            {isResendingVerification ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending...
              </span>
            ) : resendTimer > 0 ? (
              `Resend Code in ${resendTimer}s`
            ) : (
              'Resend Code'
            )}
          </Button>
        </div>

        {/* Back Button */}
        {onBack && (
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={onBack}
              className="text-sm text-gray-600 hover:text-gray-800 focus:outline-none focus:underline"
            >
              ← Back to registration
            </button>
          </div>
        )}
      </div>
    </div>
  )
}