/**
 * Custom hook for handling mount/unmount animations
 *
 * This hook provides a way to animate components when they mount and unmount,
 * with support for different animation types and configurations.
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { AnimationConfig, shouldReduceMotion } from '@/lib/animations'

interface UseAnimatedMountOptions {
  /** Whether the component should be mounted/visible */
  show: boolean
  /** Animation configuration for mount/unmount */
  animation?: AnimationConfig
  /** Callback fired when mount animation completes */
  onEntered?: () => void
  /** Callback fired when unmount animation completes */
  onExited?: () => void
  /** Whether to animate on initial mount */
  animateInitial?: boolean
}

interface UseAnimatedMountReturn {
  /** Whether the component should be rendered in the DOM */
  shouldRender: boolean
  /** Current animation state */
  animationState: 'entering' | 'entered' | 'exiting' | 'exited'
  /** CSS classes to apply for current animation state */
  animationClass: string
  /** Style object for current animation state */
  animationStyle: React.CSSProperties
  /** Function to trigger mount animation */
  triggerEnter: () => void
  /** Function to trigger unmount animation */
  triggerExit: () => void
}

export function useAnimatedMount({
  show,
  animation,
  onEntered,
  onExited,
  animateInitial = true
}: UseAnimatedMountOptions): UseAnimatedMountReturn {
  const [shouldRender, setShouldRender] = useState(show)
  const [animationState, setAnimationState] = useState<'entering' | 'entered' | 'exiting' | 'exited'>(
    show ? 'entered' : 'exited'
  )
  const timeoutRef = useRef<NodeJS.Timeout>()
  const isFirstMount = useRef(true)

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const triggerEnter = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    setShouldRender(true)
    setAnimationState('entering')

    if (!animation || shouldReduceMotion() || (!animateInitial && isFirstMount.current)) {
      setAnimationState('entered')
      onEntered?.()
      isFirstMount.current = false
      return
    }

    timeoutRef.current = setTimeout(() => {
      setAnimationState('entered')
      onEntered?.()
    }, animation.duration + (animation.delay || 0))

    isFirstMount.current = false
  }, [animation, onEntered, animateInitial])

  const triggerExit = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    setAnimationState('exiting')

    if (!animation || shouldReduceMotion()) {
      setShouldRender(false)
      setAnimationState('exited')
      onExited?.()
      return
    }

    timeoutRef.current = setTimeout(() => {
      setShouldRender(false)
      setAnimationState('exited')
      onExited?.()
    }, animation.duration + (animation.delay || 0))
  }, [animation, onExited])

  // Handle show prop changes
  useEffect(() => {
    if (show) {
      triggerEnter()
    } else {
      triggerExit()
    }
    // triggerEnter and triggerExit are stable via useCallback,
    // but ESLint can't detect this - disabling rule is safer than infinite loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show])

  // Generate animation classes based on state and config
  const getAnimationClass = (): string => {
    if (!animation || shouldReduceMotion()) {
      return ''
    }

    const { type, direction, easing = 'ease-out', duration } = animation
    const baseClass = 'transition-all'
    const durationClass = `duration-${duration}`
    const easingClass = easing === 'ease-in-out' ? 'ease-in-out' :
                       easing === 'ease-in' ? 'ease-in' :
                       easing === 'ease-out' ? 'ease-out' : 'ease-linear'

    let stateClass = ''

    switch (animationState) {
      case 'entering':
        switch (type) {
          case 'fade':
            stateClass = 'opacity-0 animate-fadeIn'
            break
          case 'slide':
            if (direction === 'up') stateClass = 'transform translate-y-4 opacity-0 animate-slideInUp'
            else if (direction === 'down') stateClass = 'transform -translate-y-4 opacity-0 animate-slideInDown'
            else if (direction === 'left') stateClass = 'transform translate-x-4 opacity-0 animate-slideInLeft'
            else if (direction === 'right') stateClass = 'transform -translate-x-4 opacity-0 animate-slideInRight'
            break
          case 'scale':
            stateClass = 'transform scale-95 opacity-0 animate-scaleIn'
            break
          case 'bounce':
            stateClass = 'animate-bounceIn'
            break
          default:
            stateClass = 'opacity-0'
        }
        break

      case 'entered':
        stateClass = 'opacity-100 transform scale-100 translate-x-0 translate-y-0'
        break

      case 'exiting':
        switch (type) {
          case 'fade':
            stateClass = 'opacity-100 animate-fadeOut'
            break
          case 'slide':
            if (direction === 'up') stateClass = 'transform translate-y-0 opacity-100 animate-slideOutUp'
            else if (direction === 'down') stateClass = 'transform translate-y-0 opacity-100 animate-slideOutDown'
            else if (direction === 'left') stateClass = 'transform translate-x-0 opacity-100 animate-slideOutLeft'
            else if (direction === 'right') stateClass = 'transform translate-x-0 opacity-100 animate-slideOutRight'
            break
          case 'scale':
            stateClass = 'transform scale-100 opacity-100 animate-scaleOut'
            break
          case 'bounce':
            stateClass = 'animate-bounceOut'
            break
          default:
            stateClass = 'opacity-100'
        }
        break

      case 'exited':
        stateClass = 'opacity-0'
        break
    }

    return `${baseClass} ${durationClass} ${easingClass} ${stateClass}`.trim()
  }

  // Generate animation styles
  const getAnimationStyle = (): React.CSSProperties => {
    if (!animation || shouldReduceMotion()) {
      return {}
    }

    const style: React.CSSProperties = {
      transitionDuration: `${animation.duration}ms`,
      transitionTimingFunction: animation.easing || 'ease-out'
    }

    if (animation.delay) {
      style.transitionDelay = `${animation.delay}ms`
    }

    return style
  }

  return {
    shouldRender,
    animationState,
    animationClass: getAnimationClass(),
    animationStyle: getAnimationStyle(),
    triggerEnter,
    triggerExit
  }
}

// Hook for staggered animations
interface UseStaggeredAnimationOptions {
  /** Items to animate */
  items: unknown[]
  /** Base animation configuration */
  animation: AnimationConfig
  /** Whether to start animation immediately */
  autoStart?: boolean
  /** Callback when all animations complete */
  onComplete?: () => void
}

interface UseStaggeredAnimationReturn {
  /** Animation state for each item */
  itemStates: ('entering' | 'entered' | 'exiting' | 'exited')[]
  /** Start staggered animation */
  startAnimation: () => void
  /** Reset all animations */
  resetAnimation: () => void
}

export function useStaggeredAnimation({
  items,
  animation,
  autoStart = true,
  onComplete
}: UseStaggeredAnimationOptions): UseStaggeredAnimationReturn {
  const [itemStates, setItemStates] = useState<('entering' | 'entered' | 'exiting' | 'exited')[]>(
    () => items.map(() => 'exited')
  )
  const timeoutRefs = useRef<NodeJS.Timeout[]>([])

  // Clear timeouts on unmount
  useEffect(() => {
    return () => {
      timeoutRefs.current.forEach(timeout => {
        if (timeout) clearTimeout(timeout)
      })
    }
  }, [])

  const startAnimation = useCallback(() => {
    if (!animation.stagger || shouldReduceMotion()) {
      // If no stagger or reduced motion, animate all at once
      setItemStates(items.map(() => 'entered'))
      onComplete?.()
      return
    }

    const staggerDelay = animation.staggerDelay || 50

    // Clear existing timeouts
    timeoutRefs.current.forEach(timeout => {
      if (timeout) clearTimeout(timeout)
    })
    timeoutRefs.current = []

    // Start staggered animations
    items.forEach((_, index) => {
      const delay = index * staggerDelay + (animation.delay || 0)

      const enterTimeout = setTimeout(() => {
        setItemStates(prev => {
          const newStates = [...prev]
          newStates[index] = 'entering'
          return newStates
        })

        const completeTimeout = setTimeout(() => {
          setItemStates(prev => {
            const newStates = [...prev]
            newStates[index] = 'entered'
            return newStates
          })

          // Check if all animations are complete
          if (index === items.length - 1) {
            setTimeout(() => {
              onComplete?.()
            }, 100) // Small delay to ensure state updates
          }
        }, animation.duration)

        timeoutRefs.current.push(completeTimeout)
      }, delay)

      timeoutRefs.current.push(enterTimeout)
    })
  }, [items, animation, onComplete])

  const resetAnimation = useCallback(() => {
    timeoutRefs.current.forEach(timeout => {
      if (timeout) clearTimeout(timeout)
    })
    timeoutRefs.current = []
    setItemStates(items.map(() => 'exited'))
  }, [items])

  // Auto-start animation
  useEffect(() => {
    if (autoStart) {
      startAnimation()
    }
    // startAnimation is stable via useCallback, but ESLint can't detect this
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoStart])

  // Update item states when items array changes
  useEffect(() => {
    setItemStates(prev => {
      const newStates = items.map((_, index) => prev[index] || 'exited')
      return newStates
    })
  }, [items])

  return {
    itemStates,
    startAnimation,
    resetAnimation
  }
}