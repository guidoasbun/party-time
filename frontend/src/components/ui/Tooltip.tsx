'use client'

/**
 * Tooltip Component
 * Phase 8.2: UI Polish - Help tooltips for contextual information
 */

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils'

export type TooltipSide = 'top' | 'bottom' | 'left' | 'right'
export type TooltipAlign = 'start' | 'center' | 'end'

export interface TooltipProps {
  /** Content to display in the tooltip */
  content: React.ReactNode
  /** The element that triggers the tooltip */
  children: React.ReactElement
  /** Which side to show the tooltip on */
  side?: TooltipSide
  /** Alignment along the side */
  align?: TooltipAlign
  /** Delay before showing tooltip (ms) */
  delayDuration?: number
  /** Whether tooltip is disabled */
  disabled?: boolean
  /** Additional className for the tooltip */
  className?: string
  /** Force tooltip to be open (controlled) */
  open?: boolean
  /** Callback when open state changes */
  onOpenChange?: (open: boolean) => void
  /** Arrow pointer */
  showArrow?: boolean
  /** Max width of tooltip content */
  maxWidth?: number
}

const OFFSET = 8 // Distance from trigger element
const ARROW_SIZE = 6

export function Tooltip({
  content,
  children,
  side = 'top',
  align = 'center',
  delayDuration = 300,
  disabled = false,
  className,
  open: controlledOpen,
  onOpenChange,
  showArrow = true,
  maxWidth = 300,
}: TooltipProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const [mounted, setMounted] = useState(false)
  const [computedSide, setComputedSide] = useState<TooltipSide>(side)

  const triggerRef = useRef<HTMLElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const isOpen = controlledOpen ?? internalOpen

  const setOpen = useCallback((value: boolean) => {
    setInternalOpen(value)
    onOpenChange?.(value)
  }, [onOpenChange])

  // Calculate position
  const updatePosition = useCallback(() => {
    if (!triggerRef.current || !tooltipRef.current) return

    const triggerRect = triggerRef.current.getBoundingClientRect()
    const tooltipRect = tooltipRef.current.getBoundingClientRect()
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight

    let finalSide = side
    let top = 0
    let left = 0

    // Calculate position based on side
    const calculatePosition = (targetSide: TooltipSide) => {
      switch (targetSide) {
        case 'top':
          top = triggerRect.top - tooltipRect.height - OFFSET
          break
        case 'bottom':
          top = triggerRect.bottom + OFFSET
          break
        case 'left':
          left = triggerRect.left - tooltipRect.width - OFFSET
          break
        case 'right':
          left = triggerRect.right + OFFSET
          break
      }

      // Handle alignment
      if (targetSide === 'top' || targetSide === 'bottom') {
        switch (align) {
          case 'start':
            left = triggerRect.left
            break
          case 'center':
            left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2
            break
          case 'end':
            left = triggerRect.right - tooltipRect.width
            break
        }
      } else {
        switch (align) {
          case 'start':
            top = triggerRect.top
            break
          case 'center':
            top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2
            break
          case 'end':
            top = triggerRect.bottom - tooltipRect.height
            break
        }
      }

      return { top, left }
    }

    // Calculate initial position
    const pos = calculatePosition(side)
    top = pos.top
    left = pos.left

    // Check if tooltip fits, flip if needed
    const fitsTop = top >= 0
    const fitsBottom = top + tooltipRect.height <= viewportHeight
    const fitsLeft = left >= 0
    const fitsRight = left + tooltipRect.width <= viewportWidth

    if (side === 'top' && !fitsTop && fitsBottom) {
      finalSide = 'bottom'
      const newPos = calculatePosition('bottom')
      top = newPos.top
    } else if (side === 'bottom' && !fitsBottom && fitsTop) {
      finalSide = 'top'
      const newPos = calculatePosition('top')
      top = newPos.top
    } else if (side === 'left' && !fitsLeft && fitsRight) {
      finalSide = 'right'
      const newPos = calculatePosition('right')
      left = newPos.left
    } else if (side === 'right' && !fitsRight && fitsLeft) {
      finalSide = 'left'
      const newPos = calculatePosition('left')
      left = newPos.left
    }

    // Constrain to viewport
    left = Math.max(8, Math.min(left, viewportWidth - tooltipRect.width - 8))
    top = Math.max(8, Math.min(top, viewportHeight - tooltipRect.height - 8))

    setPosition({ top, left })
    setComputedSide(finalSide)
  }, [side, align])

  // Handle mouse enter
  const handleMouseEnter = useCallback(() => {
    if (disabled) return
    timeoutRef.current = setTimeout(() => {
      setOpen(true)
    }, delayDuration)
  }, [disabled, delayDuration, setOpen])

  // Handle mouse leave
  const handleMouseLeave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    setOpen(false)
  }, [setOpen])

  // Handle focus
  const handleFocus = useCallback(() => {
    if (disabled) return
    setOpen(true)
  }, [disabled, setOpen])

  // Handle blur
  const handleBlur = useCallback(() => {
    setOpen(false)
  }, [setOpen])

  // Update position when open
  useEffect(() => {
    if (isOpen) {
      updatePosition()
      window.addEventListener('scroll', updatePosition, true)
      window.addEventListener('resize', updatePosition)
      return () => {
        window.removeEventListener('scroll', updatePosition, true)
        window.removeEventListener('resize', updatePosition)
      }
    }
  }, [isOpen, updatePosition])

  // Client-side mounting
  useEffect(() => {
    setMounted(true)
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  // Get arrow styles
  const arrowStyles: React.CSSProperties = {
    position: 'absolute',
    width: 0,
    height: 0,
    ...(computedSide === 'top' && {
      bottom: -ARROW_SIZE,
      left: '50%',
      transform: 'translateX(-50%)',
      borderLeft: `${ARROW_SIZE}px solid transparent`,
      borderRight: `${ARROW_SIZE}px solid transparent`,
      borderTop: `${ARROW_SIZE}px solid var(--popover)`,
    }),
    ...(computedSide === 'bottom' && {
      top: -ARROW_SIZE,
      left: '50%',
      transform: 'translateX(-50%)',
      borderLeft: `${ARROW_SIZE}px solid transparent`,
      borderRight: `${ARROW_SIZE}px solid transparent`,
      borderBottom: `${ARROW_SIZE}px solid var(--popover)`,
    }),
    ...(computedSide === 'left' && {
      right: -ARROW_SIZE,
      top: '50%',
      transform: 'translateY(-50%)',
      borderTop: `${ARROW_SIZE}px solid transparent`,
      borderBottom: `${ARROW_SIZE}px solid transparent`,
      borderLeft: `${ARROW_SIZE}px solid var(--popover)`,
    }),
    ...(computedSide === 'right' && {
      left: -ARROW_SIZE,
      top: '50%',
      transform: 'translateY(-50%)',
      borderTop: `${ARROW_SIZE}px solid transparent`,
      borderBottom: `${ARROW_SIZE}px solid transparent`,
      borderRight: `${ARROW_SIZE}px solid var(--popover)`,
    }),
  }

  // Clone child with ref and event handlers
  const childProps = children.props as Record<string, unknown>
  const trigger = React.cloneElement(children, {
    ref: triggerRef,
    onMouseEnter: (e: React.MouseEvent) => {
      handleMouseEnter()
      if (typeof childProps.onMouseEnter === 'function') {
        childProps.onMouseEnter(e)
      }
    },
    onMouseLeave: (e: React.MouseEvent) => {
      handleMouseLeave()
      if (typeof childProps.onMouseLeave === 'function') {
        childProps.onMouseLeave(e)
      }
    },
    onFocus: (e: React.FocusEvent) => {
      handleFocus()
      if (typeof childProps.onFocus === 'function') {
        childProps.onFocus(e)
      }
    },
    onBlur: (e: React.FocusEvent) => {
      handleBlur()
      if (typeof childProps.onBlur === 'function') {
        childProps.onBlur(e)
      }
    },
    'aria-describedby': isOpen ? 'tooltip' : undefined,
  } as React.HTMLAttributes<HTMLElement> & { ref: React.RefObject<HTMLElement> })

  // Don't render portal on server
  if (!mounted) {
    return trigger
  }

  return (
    <>
      {trigger}
      {isOpen &&
        createPortal(
          <div
            ref={tooltipRef}
            id="tooltip"
            role="tooltip"
            className={cn(
              'fixed z-[100] px-3 py-2 text-sm rounded-md shadow-md',
              'bg-popover text-popover-foreground border border-border',
              'animate-fadeIn',
              className
            )}
            style={{
              top: position.top,
              left: position.left,
              maxWidth,
            }}
          >
            {content}
            {showArrow && <div style={arrowStyles} />}
          </div>,
          document.body
        )}
    </>
  )
}

// Convenience wrapper for icon buttons with tooltips
interface TooltipIconButtonProps {
  icon: React.ReactNode
  tooltip: string
  onClick?: () => void
  disabled?: boolean
  className?: string
  side?: TooltipSide
}

export function TooltipIconButton({
  icon,
  tooltip,
  onClick,
  disabled,
  className,
  side = 'top',
}: TooltipIconButtonProps) {
  return (
    <Tooltip content={tooltip} side={side} disabled={disabled}>
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={cn(
          'inline-flex items-center justify-center rounded-md p-2',
          'text-muted-foreground hover:text-foreground hover:bg-muted',
          'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
          'transition-colors duration-150',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          className
        )}
      >
        {icon}
      </button>
    </Tooltip>
  )
}

// Help icon with tooltip
interface HelpTooltipProps {
  content: React.ReactNode
  side?: TooltipSide
  className?: string
}

export function HelpTooltip({ content, side = 'top', className }: HelpTooltipProps) {
  return (
    <Tooltip content={content} side={side}>
      <button
        type="button"
        className={cn(
          'inline-flex items-center justify-center rounded-full',
          'w-4 h-4 text-xs',
          'text-muted-foreground hover:text-foreground',
          'border border-current',
          'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1',
          'transition-colors duration-150',
          className
        )}
        aria-label="Help"
      >
        ?
      </button>
    </Tooltip>
  )
}
