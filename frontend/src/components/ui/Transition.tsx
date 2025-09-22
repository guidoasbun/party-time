/**
 * Transition components for smooth page and view transitions
 *
 * These components provide a declarative way to handle transitions between
 * different states, views, or routes with customizable animations.
 */

'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { AnimationConfig, getAnimationClass, shouldReduceMotion } from '@/lib/animations'
import { useAnimatedMount } from '@/hooks/useAnimatedMount'

export interface TransitionProps {
  /** Whether the content should be shown */
  show: boolean
  /** Content to transition */
  children: React.ReactNode
  /** Animation configuration for enter/exit */
  animation?: {
    enter?: AnimationConfig
    exit?: AnimationConfig
  }
  /** Whether to animate on initial mount */
  animateInitial?: boolean
  /** Callback when transition completes */
  onTransitionComplete?: (phase: 'enter' | 'exit') => void
  /** Additional CSS classes */
  className?: string
  /** Container element type */
  as?: keyof React.JSX.IntrinsicElements
}

export function Transition({
  show,
  children,
  animation = {
    enter: { type: 'fade', duration: 300, easing: 'ease-out' },
    exit: { type: 'fade', duration: 200, easing: 'ease-in' }
  },
  animateInitial = true,
  onTransitionComplete,
  className,
  as: Component = 'div'
}: TransitionProps) {
  const { shouldRender, animationState, animationClass, animationStyle } = useAnimatedMount({
    show,
    animation: show ? animation.enter : animation.exit,
    onEntered: () => onTransitionComplete?.('enter'),
    onExited: () => onTransitionComplete?.('exit'),
    animateInitial
  })

  if (!shouldRender) return null

  return (
    <Component
      className={cn(animationClass, className)}
      style={animationStyle}
    >
      {children}
    </Component>
  )
}

// View Transition for switching between different views
export interface ViewTransitionProps {
  /** Currently active view key */
  activeView: string
  /** Map of view keys to their content */
  views: Record<string, React.ReactNode>
  /** Animation mode */
  mode?: 'fade' | 'slide' | 'scale' | 'flip'
  /** Transition duration */
  duration?: number
  /** Additional CSS classes */
  className?: string
  /** Callback when view changes */
  onViewChange?: (view: string) => void
}

export function ViewTransition({
  activeView,
  views,
  mode = 'fade',
  duration = 300,
  className,
  onViewChange
}: ViewTransitionProps) {
  const [currentView, setCurrentView] = useState(activeView)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)

  useEffect(() => {
    if (activeView !== currentView && !shouldReduceMotion()) {
      setIsTransitioning(true)

      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      // Switch to new view after half the transition duration
      timeoutRef.current = setTimeout(() => {
        setCurrentView(activeView)
        onViewChange?.(activeView)

        // Complete transition
        setTimeout(() => {
          setIsTransitioning(false)
        }, duration / 2)
      }, duration / 2)
    } else if (activeView !== currentView) {
      // No animation for reduced motion
      setCurrentView(activeView)
      onViewChange?.(activeView)
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [activeView, currentView, duration, onViewChange])

  const getTransitionClasses = () => {
    if (shouldReduceMotion()) return ''

    const baseClasses = 'transition-all ease-in-out'
    const durationClass = `duration-${duration}`

    switch (mode) {
      case 'fade':
        return cn(
          baseClasses,
          durationClass,
          isTransitioning ? 'opacity-0' : 'opacity-100'
        )
      case 'slide':
        return cn(
          baseClasses,
          durationClass,
          isTransitioning ? 'transform translate-x-full opacity-0' : 'transform translate-x-0 opacity-100'
        )
      case 'scale':
        return cn(
          baseClasses,
          durationClass,
          isTransitioning ? 'transform scale-95 opacity-0' : 'transform scale-100 opacity-100'
        )
      case 'flip':
        return cn(
          baseClasses,
          durationClass,
          isTransitioning ? 'transform rotateY-90 opacity-0' : 'transform rotateY-0 opacity-100'
        )
      default:
        return baseClasses
    }
  }

  return (
    <div className={cn('relative', className)}>
      <div className={getTransitionClasses()}>
        {views[currentView]}
      </div>
    </div>
  )
}

// Page Transition for route changes
export interface PageTransitionProps {
  /** Page content */
  children: React.ReactNode
  /** Unique key for the page (usually route) */
  pageKey: string
  /** Animation type */
  animation?: 'fade' | 'slide' | 'scale'
  /** Transition duration */
  duration?: number
  /** Additional CSS classes */
  className?: string
}

export function PageTransition({
  children,
  pageKey,
  animation = 'fade',
  duration = 300,
  className
}: PageTransitionProps) {
  const [displayedKey, setDisplayedKey] = useState(pageKey)
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    if (pageKey !== displayedKey) {
      setIsExiting(true)

      setTimeout(() => {
        setDisplayedKey(pageKey)
        setIsExiting(false)
      }, duration / 2)
    }
  }, [pageKey, displayedKey, duration])

  const getAnimationClasses = () => {
    if (shouldReduceMotion()) return ''

    const baseClasses = 'transition-all ease-in-out'
    const durationClass = `duration-${duration / 2}`

    switch (animation) {
      case 'fade':
        return cn(
          baseClasses,
          durationClass,
          isExiting ? 'opacity-0' : 'opacity-100'
        )
      case 'slide':
        return cn(
          baseClasses,
          durationClass,
          isExiting
            ? 'transform -translate-x-full opacity-0'
            : 'transform translate-x-0 opacity-100'
        )
      case 'scale':
        return cn(
          baseClasses,
          durationClass,
          isExiting
            ? 'transform scale-95 opacity-0'
            : 'transform scale-100 opacity-100'
        )
      default:
        return baseClasses
    }
  }

  return (
    <div className={cn('relative', className)}>
      <div className={getAnimationClasses()}>
        {children}
      </div>
    </div>
  )
}

// Modal/Dialog Transition
export interface ModalTransitionProps {
  /** Whether modal is open */
  isOpen: boolean
  /** Modal content */
  children: React.ReactNode
  /** Background overlay */
  showOverlay?: boolean
  /** Close on overlay click */
  closeOnOverlayClick?: boolean
  /** Close callback */
  onClose?: () => void
  /** Animation duration */
  duration?: number
  /** Additional CSS classes */
  className?: string
  /** Overlay CSS classes */
  overlayClassName?: string
}

export function ModalTransition({
  isOpen,
  children,
  showOverlay = true,
  closeOnOverlayClick = true,
  onClose,
  duration = 300,
  className,
  overlayClassName
}: ModalTransitionProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [shouldRender, setShouldRender] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true)
      requestAnimationFrame(() => {
        setIsVisible(true)
      })
    } else {
      setIsVisible(false)
      const timeout = setTimeout(() => {
        setShouldRender(false)
      }, duration)
      return () => clearTimeout(timeout)
    }
  }, [isOpen, duration])

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (closeOnOverlayClick && e.target === e.currentTarget) {
        onClose?.()
      }
    },
    [closeOnOverlayClick, onClose]
  )

  if (!shouldRender) return null

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center',
        showOverlay && [
          'bg-black/50 backdrop-blur-sm',
          'transition-opacity ease-out',
          `duration-${duration}`,
          isVisible ? 'opacity-100' : 'opacity-0'
        ],
        overlayClassName
      )}
      onClick={handleOverlayClick}
    >
      <div
        className={cn(
          'relative max-h-[90vh] max-w-[90vw]',
          'transition-all ease-out',
          `duration-${duration}`,
          isVisible
            ? 'opacity-100 scale-100 translate-y-0'
            : 'opacity-0 scale-95 translate-y-4',
          className
        )}
      >
        {children}
      </div>
    </div>
  )
}

// Accordion/Collapsible Transition
export interface CollapseTransitionProps {
  /** Whether content is expanded */
  isOpen: boolean
  /** Content to collapse/expand */
  children: React.ReactNode
  /** Animation duration */
  duration?: number
  /** Additional CSS classes */
  className?: string
}

export function CollapseTransition({
  isOpen,
  children,
  duration = 300,
  className
}: CollapseTransitionProps) {
  const contentRef = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState<number | 'auto'>(isOpen ? 'auto' : 0)

  useEffect(() => {
    if (!contentRef.current) return

    const content = contentRef.current

    if (isOpen) {
      // Opening: measure content height
      const scrollHeight = content.scrollHeight
      setHeight(scrollHeight)

      // Set to auto after animation completes
      const timeout = setTimeout(() => {
        setHeight('auto')
      }, duration)

      return () => clearTimeout(timeout)
    } else {
      // Closing: set explicit height first, then animate to 0
      setHeight(content.scrollHeight)
      requestAnimationFrame(() => {
        setHeight(0)
      })
    }
  }, [isOpen, duration])

  return (
    <div
      ref={contentRef}
      className={cn(
        'overflow-hidden transition-all ease-in-out',
        `duration-${duration}`,
        className
      )}
      style={{
        height: height === 'auto' ? 'auto' : `${height}px`
      }}
    >
      {children}
    </div>
  )
}

// Notification/Toast Transition
export interface NotificationTransitionProps {
  /** List of notifications */
  notifications: Array<{
    id: string
    content: React.ReactNode
  }>
  /** Position of notifications */
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center'
  /** Animation duration */
  duration?: number
  /** Additional CSS classes */
  className?: string
}

export function NotificationTransition({
  notifications,
  position = 'top-right',
  duration = 300,
  className
}: NotificationTransitionProps) {
  const getPositionClasses = () => {
    switch (position) {
      case 'top-right':
        return 'top-4 right-4'
      case 'top-left':
        return 'top-4 left-4'
      case 'bottom-right':
        return 'bottom-4 right-4'
      case 'bottom-left':
        return 'bottom-4 left-4'
      case 'top-center':
        return 'top-4 left-1/2 transform -translate-x-1/2'
      case 'bottom-center':
        return 'bottom-4 left-1/2 transform -translate-x-1/2'
      default:
        return 'top-4 right-4'
    }
  }

  return (
    <div
      className={cn(
        'fixed z-50 space-y-2',
        getPositionClasses(),
        className
      )}
    >
      {notifications.map((notification, index) => (
        <Transition
          key={notification.id}
          show={true}
          animation={{
            enter: {
              type: 'slide',
              direction: position.includes('right') ? 'left' : 'right',
              duration,
              easing: 'ease-out',
              delay: index * 50
            },
            exit: {
              type: 'slide',
              direction: position.includes('right') ? 'right' : 'left',
              duration: duration / 2,
              easing: 'ease-in'
            }
          }}
          className="transform"
        >
          {notification.content}
        </Transition>
      ))}
    </div>
  )
}