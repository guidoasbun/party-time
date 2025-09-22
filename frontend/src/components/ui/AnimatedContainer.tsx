/**
 * AnimatedContainer - A reusable wrapper component for applying animations
 *
 * This component provides a flexible way to add animations to any content
 * with support for different animation types, triggers, and configurations.
 */

'use client'

import React, { useRef, useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { AnimationConfig, getAnimationClass } from '@/lib/animations'
import { useAnimatedMount } from '@/hooks/useAnimatedMount'

export interface AnimatedContainerProps {
  /** Content to animate */
  children: React.ReactNode
  /** Animation configuration */
  animation?: AnimationConfig
  /** Animation trigger type */
  trigger?: 'mount' | 'hover' | 'click' | 'inView' | 'manual'
  /** Whether to animate on initial mount */
  animateOnMount?: boolean
  /** Whether animations are enabled */
  enabled?: boolean
  /** Additional CSS classes */
  className?: string
  /** Container element type */
  as?: keyof React.JSX.IntrinsicElements
  /** Callback when animation starts */
  onAnimationStart?: () => void
  /** Callback when animation completes */
  onAnimationComplete?: () => void
  /** Manual trigger for animations (when trigger is 'manual') */
  triggerAnimation?: boolean
  /** Intersection observer options for 'inView' trigger */
  intersectionOptions?: IntersectionObserverInit
  /** Delay before starting animation (in ms) */
  delay?: number
}

export function AnimatedContainer({
  children,
  animation = {
    type: 'fade',
    duration: 300,
    easing: 'ease-out'
  },
  trigger = 'mount',
  animateOnMount = true,
  enabled = true,
  className,
  as: Component = 'div',
  onAnimationStart,
  onAnimationComplete,
  triggerAnimation = false,
  intersectionOptions = { threshold: 0.1 },
  delay = 0
}: AnimatedContainerProps) {
  const containerRef = useRef<HTMLElement>(null)
  const [isVisible, setIsVisible] = useState(trigger !== 'inView')
  const [isHovered, setIsHovered] = useState(false)
  const [isClicked, setIsClicked] = useState(false)
  const [manualTrigger, setManualTrigger] = useState(false)

  // Handle manual trigger changes
  useEffect(() => {
    if (trigger === 'manual' && triggerAnimation !== manualTrigger) {
      setManualTrigger(triggerAnimation)
    }
  }, [trigger, triggerAnimation, manualTrigger])

  // Intersection Observer for 'inView' trigger
  useEffect(() => {
    if (!enabled || trigger !== 'inView') return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true)
            onAnimationStart?.()
          }
        })
      },
      intersectionOptions
    )

    const currentRef = containerRef.current
    if (currentRef) {
      observer.observe(currentRef)
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef)
      }
    }
  }, [enabled, trigger, intersectionOptions, onAnimationStart])

  // Determine if animation should be shown
  const shouldShowAnimation = enabled && (() => {
    switch (trigger) {
      case 'mount':
        return animateOnMount
      case 'hover':
        return isHovered
      case 'click':
        return isClicked
      case 'inView':
        return isVisible
      case 'manual':
        return manualTrigger
      default:
        return false
    }
  })()

  // Use animated mount hook for complex animations
  const animatedMount = useAnimatedMount({
    show: shouldShowAnimation,
    animation: enabled ? animation : undefined,
    onEntered: onAnimationComplete,
    animateInitial: animateOnMount
  })

  // Generate animation classes
  const getAnimationClasses = (): string => {
    if (!enabled || !shouldShowAnimation) return ''

    const { type, direction, duration } = animation
    let animationClass = ''

    switch (type) {
      case 'fade':
        animationClass = direction === 'out' ? 'animate-fadeOut' : 'animate-fadeIn'
        break
      case 'slide':
        if (direction === 'up') animationClass = 'animate-slideInUp'
        else if (direction === 'down') animationClass = 'animate-slideInDown'
        else if (direction === 'left') animationClass = 'animate-slideInLeft'
        else if (direction === 'right') animationClass = 'animate-slideInRight'
        break
      case 'scale':
        animationClass = direction === 'out' ? 'animate-scaleOut' : 'animate-scaleIn'
        break
      case 'bounce':
        animationClass = direction === 'out' ? 'animate-bounceOut' : 'animate-bounceIn'
        break
      case 'shake':
        animationClass = 'animate-shake'
        break
      case 'pulse':
        animationClass = 'animate-pulse'
        break
      default:
        animationClass = 'animate-fadeIn'
    }

    return getAnimationClass(animationClass)
  }

  // Event handlers
  const handleMouseEnter = () => {
    if (trigger === 'hover') {
      setIsHovered(true)
      onAnimationStart?.()
    }
  }

  const handleMouseLeave = () => {
    if (trigger === 'hover') {
      setIsHovered(false)
    }
  }

  const handleClick = () => {
    if (trigger === 'click') {
      setIsClicked(!isClicked)
      if (!isClicked) {
        onAnimationStart?.()
      }
    }
  }

  // Determine container props based on trigger type
  const containerProps: Record<string, unknown> = {
    ref: containerRef,
    className: cn(
      getAnimationClasses(),
      trigger === 'hover' && 'cursor-pointer',
      className
    ),
    style: delay > 0 ? { animationDelay: `${delay}ms` } : undefined
  }

  if (trigger === 'hover') {
    containerProps.onMouseEnter = handleMouseEnter
    containerProps.onMouseLeave = handleMouseLeave
  }

  if (trigger === 'click') {
    containerProps.onClick = handleClick
  }

  // For mount animations, use the animated mount hook
  if (trigger === 'mount' && enabled) {
    return (
      <Component
        {...containerProps}
        className={cn(
          animatedMount.animationClass,
          className
        )}
        style={{
          ...(containerProps.style as React.CSSProperties),
          ...animatedMount.animationStyle
        }}
      >
        {children}
      </Component>
    )
  }

  return (
    <Component {...containerProps}>
      {children}
    </Component>
  )
}

// Specialized variants for common use cases
export interface FadeInContainerProps extends Omit<AnimatedContainerProps, 'animation'> {
  direction?: 'in' | 'out'
  duration?: number
  delay?: number
}

export function FadeInContainer({
  direction = 'in',
  duration = 300,
  delay = 0,
  ...props
}: FadeInContainerProps) {
  return (
    <AnimatedContainer
      {...props}
      animation={{
        type: 'fade',
        direction,
        duration,
        delay,
        easing: 'ease-out'
      }}
    />
  )
}

export interface SlideInContainerProps extends Omit<AnimatedContainerProps, 'animation'> {
  direction?: 'up' | 'down' | 'left' | 'right'
  duration?: number
  delay?: number
}

export function SlideInContainer({
  direction = 'up',
  duration = 300,
  delay = 0,
  ...props
}: SlideInContainerProps) {
  return (
    <AnimatedContainer
      {...props}
      animation={{
        type: 'slide',
        direction,
        duration,
        delay,
        easing: 'ease-out'
      }}
    />
  )
}

export interface ScaleInContainerProps extends Omit<AnimatedContainerProps, 'animation'> {
  direction?: 'in' | 'out'
  duration?: number
  delay?: number
}

export function ScaleInContainer({
  direction = 'in',
  duration = 250,
  delay = 0,
  ...props
}: ScaleInContainerProps) {
  return (
    <AnimatedContainer
      {...props}
      animation={{
        type: 'scale',
        direction,
        duration,
        delay,
        easing: 'ease-out'
      }}
    />
  )
}

export interface StaggeredContainerProps extends Omit<AnimatedContainerProps, 'animation'> {
  /** Number of children to stagger */
  itemCount: number
  /** Base animation config */
  baseAnimation?: Omit<AnimationConfig, 'stagger' | 'staggerDelay'>
  /** Delay between each item (in ms) */
  staggerDelay?: number
}

export function StaggeredContainer({
  children,
  itemCount,
  baseAnimation = {
    type: 'slide',
    direction: 'up',
    duration: 300,
    easing: 'ease-out'
  },
  staggerDelay = 50,
  ...props
}: StaggeredContainerProps) {
  return (
    <AnimatedContainer
      {...props}
      animation={{
        ...baseAnimation,
        stagger: true,
        staggerDelay
      }}
    >
      {children}
    </AnimatedContainer>
  )
}