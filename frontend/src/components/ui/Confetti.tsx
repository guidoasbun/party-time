'use client'

/**
 * Confetti / Success Animation Components
 * Phase 8.2: UI Polish - Celebration animations for success states
 */

import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils'

// ============================================================================
// Confetti Component
// ============================================================================

interface ConfettiPiece {
  id: number
  x: number
  y: number
  rotation: number
  color: string
  size: number
  velocityX: number
  velocityY: number
  rotationSpeed: number
  shape: 'square' | 'circle' | 'triangle'
}

export interface ConfettiProps {
  /** Whether confetti is active */
  active: boolean
  /** Duration in ms before stopping */
  duration?: number
  /** Number of confetti pieces */
  particleCount?: number
  /** Colors to use (defaults to party colors) */
  colors?: string[]
  /** Origin point (0-1 for x and y) */
  origin?: { x: number; y: number }
  /** Callback when animation completes */
  onComplete?: () => void
  /** Whether to respect reduced motion preference */
  respectReducedMotion?: boolean
}

const DEFAULT_COLORS = [
  '#f43f5e', // rose
  '#8b5cf6', // violet
  '#3b82f6', // blue
  '#10b981', // emerald
  '#f59e0b', // amber
  '#ec4899', // pink
  '#06b6d4', // cyan
]

export function Confetti({
  active,
  duration = 3000,
  particleCount = 100,
  colors = DEFAULT_COLORS,
  origin = { x: 0.5, y: 0.5 },
  onComplete,
  respectReducedMotion = true,
}: ConfettiProps) {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([])
  const [mounted, setMounted] = useState(false)

  // Check for reduced motion preference
  const prefersReducedMotion = useMemo(() => {
    if (!respectReducedMotion) return false
    if (typeof window === 'undefined') return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }, [respectReducedMotion])

  // Generate confetti pieces
  const generatePieces = useCallback((): ConfettiPiece[] => {
    const shapes: Array<'square' | 'circle' | 'triangle'> = ['square', 'circle', 'triangle']
    return Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      x: origin.x * 100,
      y: origin.y * 100,
      rotation: Math.random() * 360,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 8 + 4,
      velocityX: (Math.random() - 0.5) * 15,
      velocityY: Math.random() * -15 - 5,
      rotationSpeed: (Math.random() - 0.5) * 20,
      shape: shapes[Math.floor(Math.random() * shapes.length)],
    }))
  }, [particleCount, colors, origin])

  // Handle animation
  useEffect(() => {
    if (!active || prefersReducedMotion) {
      setPieces([])
      return
    }

    setPieces(generatePieces())

    const timeout = setTimeout(() => {
      setPieces([])
      onComplete?.()
    }, duration)

    return () => clearTimeout(timeout)
  }, [active, duration, generatePieces, onComplete, prefersReducedMotion])

  // Client-side mounting
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || pieces.length === 0 || prefersReducedMotion) {
    return null
  }

  return createPortal(
    <div
      className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden"
      aria-hidden="true"
    >
      {pieces.map((piece) => (
        <ConfettiPieceComponent key={piece.id} piece={piece} duration={duration} />
      ))}
    </div>,
    document.body
  )
}

interface ConfettiPieceComponentProps {
  piece: ConfettiPiece
  duration: number
}

function ConfettiPieceComponent({ piece, duration }: ConfettiPieceComponentProps) {
  const style: React.CSSProperties = {
    position: 'absolute',
    left: `${piece.x}%`,
    top: `${piece.y}%`,
    width: piece.size,
    height: piece.size,
    backgroundColor: piece.shape !== 'triangle' ? piece.color : 'transparent',
    borderRadius: piece.shape === 'circle' ? '50%' : '0',
    transform: `rotate(${piece.rotation}deg)`,
    animation: `confetti-fall ${duration}ms ease-out forwards`,
    '--velocity-x': `${piece.velocityX}vw`,
    '--velocity-y': `${piece.velocityY}vh`,
    '--rotation': `${piece.rotation + piece.rotationSpeed * 20}deg`,
  } as React.CSSProperties

  if (piece.shape === 'triangle') {
    style.width = 0
    style.height = 0
    style.borderLeft = `${piece.size / 2}px solid transparent`
    style.borderRight = `${piece.size / 2}px solid transparent`
    style.borderBottom = `${piece.size}px solid ${piece.color}`
  }

  return <div style={style} />
}

// ============================================================================
// Success Checkmark Animation
// ============================================================================

export interface SuccessCheckmarkProps {
  /** Whether to show the checkmark */
  show: boolean
  /** Size of the checkmark */
  size?: 'sm' | 'md' | 'lg' | 'xl'
  /** Color variant */
  variant?: 'success' | 'primary'
  /** Callback when animation completes */
  onComplete?: () => void
  /** Animation duration in ms */
  duration?: number
}

export function SuccessCheckmark({
  show,
  size = 'md',
  variant = 'success',
  onComplete,
  duration = 800,
}: SuccessCheckmarkProps) {
  const [animating, setAnimating] = useState(false)

  useEffect(() => {
    if (show) {
      setAnimating(true)
      const timeout = setTimeout(() => {
        onComplete?.()
      }, duration)
      return () => clearTimeout(timeout)
    } else {
      setAnimating(false)
    }
  }, [show, duration, onComplete])

  if (!animating) return null

  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    xl: 'w-32 h-32',
  }

  const strokeWidth = {
    sm: 3,
    md: 4,
    lg: 5,
    xl: 6,
  }

  const colors = {
    success: 'text-green-500',
    primary: 'text-primary',
  }

  return (
    <div className={cn('relative', sizeClasses[size])}>
      {/* Circle */}
      <svg
        className={cn('absolute inset-0', colors[variant])}
        viewBox="0 0 52 52"
      >
        <circle
          className="animate-checkmark-circle"
          cx="26"
          cy="26"
          r="24"
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth[size]}
          strokeLinecap="round"
          style={{
            strokeDasharray: 166,
            strokeDashoffset: 166,
            animation: `checkmark-circle ${duration * 0.6}ms ease-out forwards`,
          }}
        />
      </svg>

      {/* Checkmark */}
      <svg
        className={cn('absolute inset-0', colors[variant])}
        viewBox="0 0 52 52"
      >
        <path
          className="animate-checkmark-check"
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth[size]}
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M14 27l7 7 16-16"
          style={{
            strokeDasharray: 48,
            strokeDashoffset: 48,
            animation: `checkmark-check ${duration * 0.4}ms ease-out ${duration * 0.5}ms forwards`,
          }}
        />
      </svg>
    </div>
  )
}

// ============================================================================
// Success Feedback Wrapper
// ============================================================================

export interface SuccessFeedbackProps {
  /** Whether to show the feedback */
  show: boolean
  /** Type of feedback animation */
  variant?: 'confetti' | 'checkmark' | 'both'
  /** Optional message to display */
  message?: string
  /** Callback when animation completes */
  onComplete?: () => void
  /** Children to render behind the animation */
  children?: React.ReactNode
  /** Confetti colors */
  confettiColors?: string[]
}

export function SuccessFeedback({
  show,
  variant = 'confetti',
  message,
  onComplete,
  children,
  confettiColors,
}: SuccessFeedbackProps) {
  const [checkmarkComplete, setCheckmarkComplete] = useState(false)
  const [confettiComplete, setConfettiComplete] = useState(false)

  // Reset when show changes
  useEffect(() => {
    if (show) {
      setCheckmarkComplete(false)
      setConfettiComplete(false)
    }
  }, [show])

  // Call onComplete when both animations are done
  useEffect(() => {
    if (variant === 'both' && checkmarkComplete && confettiComplete) {
      onComplete?.()
    } else if (variant === 'confetti' && confettiComplete) {
      onComplete?.()
    } else if (variant === 'checkmark' && checkmarkComplete) {
      onComplete?.()
    }
  }, [variant, checkmarkComplete, confettiComplete, onComplete])

  return (
    <div className="relative">
      {children}

      {/* Confetti */}
      {(variant === 'confetti' || variant === 'both') && (
        <Confetti
          active={show}
          colors={confettiColors}
          onComplete={() => setConfettiComplete(true)}
        />
      )}

      {/* Checkmark overlay */}
      {(variant === 'checkmark' || variant === 'both') && show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="text-center animate-scaleIn">
            <SuccessCheckmark
              show={show}
              size="xl"
              onComplete={() => setCheckmarkComplete(true)}
            />
            {message && (
              <p className="mt-4 text-lg font-medium text-foreground animate-fadeIn">
                {message}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================================================
// Hook for triggering success feedback
// ============================================================================

export function useSuccessFeedback() {
  const [show, setShow] = useState(false)

  const trigger = useCallback(() => {
    setShow(true)
  }, [])

  const reset = useCallback(() => {
    setShow(false)
  }, [])

  return {
    show,
    trigger,
    reset,
  }
}
