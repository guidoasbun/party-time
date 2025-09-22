/**
 * Animation utilities and configurations for the Party-Time application
 *
 * This module provides TypeScript-safe animation utilities, configurations,
 * and reusable animation class names for consistent animations throughout the app.
 */

// Animation configuration types
export interface AnimationConfig {
  type: 'fade' | 'slide' | 'scale' | 'rotate' | 'bounce' | 'pulse' | 'shake'
  duration: number
  delay?: number
  easing?: 'ease-in' | 'ease-out' | 'ease-in-out' | 'linear' | 'bounce' | 'elastic'
  stagger?: boolean
  staggerDelay?: number
  direction?: 'up' | 'down' | 'left' | 'right' | 'in' | 'out'
}

export interface TransitionConfig {
  duration: number
  easing: string
  property: string
}

export interface AnimationVariant {
  initial: React.CSSProperties
  animate: React.CSSProperties
  exit?: React.CSSProperties
  transition?: TransitionConfig
}

// Predefined animation configurations
export const ANIMATION_CONFIGS = {
  // Fade animations
  FADE_IN: {
    type: 'fade' as const,
    duration: 300,
    easing: 'ease-out' as const,
    direction: 'in' as const
  },
  FADE_OUT: {
    type: 'fade' as const,
    duration: 200,
    easing: 'ease-in' as const,
    direction: 'out' as const
  },

  // Scale animations
  SCALE_IN: {
    type: 'scale' as const,
    duration: 250,
    easing: 'ease-out' as const,
    direction: 'in' as const
  },
  SCALE_HOVER: {
    type: 'scale' as const,
    duration: 150,
    easing: 'ease-in-out' as const
  },

  // Slide animations
  SLIDE_DOWN: {
    type: 'slide' as const,
    duration: 300,
    easing: 'ease-out' as const,
    direction: 'down' as const
  },
  SLIDE_UP: {
    type: 'slide' as const,
    duration: 250,
    easing: 'ease-in' as const,
    direction: 'up' as const
  },
  SLIDE_LEFT: {
    type: 'slide' as const,
    duration: 300,
    easing: 'ease-in-out' as const,
    direction: 'left' as const
  },
  SLIDE_RIGHT: {
    type: 'slide' as const,
    duration: 300,
    easing: 'ease-in-out' as const,
    direction: 'right' as const
  },

  // Stagger animations
  STAGGER_CARDS: {
    type: 'fade' as const,
    duration: 300,
    easing: 'ease-out' as const,
    stagger: true,
    staggerDelay: 50
  },
  STAGGER_LIST: {
    type: 'slide' as const,
    duration: 200,
    easing: 'ease-out' as const,
    direction: 'up' as const,
    stagger: true,
    staggerDelay: 25
  }
} as const

// Animation class utilities
export const ANIMATION_CLASSES = {
  // Transition classes
  TRANSITION_ALL: 'transition-all duration-300 ease-in-out',
  TRANSITION_COLORS: 'transition-colors duration-200 ease-in-out',
  TRANSITION_TRANSFORM: 'transition-transform duration-150 ease-in-out',
  TRANSITION_OPACITY: 'transition-opacity duration-200 ease-in-out',
  TRANSITION_SHADOW: 'transition-shadow duration-200 ease-in-out',

  // Hover effects
  HOVER_SCALE: 'hover:scale-102 transition-transform duration-150 ease-in-out',
  HOVER_SCALE_105: 'hover:scale-105 transition-transform duration-150 ease-in-out',
  HOVER_LIFT: 'hover:-translate-y-1 transition-transform duration-200 ease-out',
  HOVER_SHADOW: 'hover:shadow-lg transition-shadow duration-200 ease-out',
  HOVER_GLOW: 'hover:shadow-xl hover:shadow-primary/10 transition-shadow duration-300 ease-out',

  // Focus effects
  FOCUS_RING: 'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-shadow duration-150',
  FOCUS_BORDER: 'focus:border-primary transition-colors duration-150',

  // Loading animations
  LOADING_PULSE: 'animate-pulse',
  LOADING_SPIN: 'animate-spin',
  LOADING_BOUNCE: 'animate-bounce',

  // State transitions
  ENTER_FADE: 'animate-fadeIn',
  EXIT_FADE: 'animate-fadeOut',
  ENTER_SLIDE_UP: 'animate-slideInUp',
  EXIT_SLIDE_DOWN: 'animate-slideOutDown',
  ENTER_SCALE: 'animate-scaleIn',
  EXIT_SCALE: 'animate-scaleOut',

  // Interactive states
  ACTIVE_SCALE: 'active:scale-95',
  ACTIVE_OPACITY: 'active:opacity-75',
  DISABLED_OPACITY: 'disabled:opacity-50',

  // View mode transitions
  GRID_TRANSITION: 'transition-all duration-500 ease-in-out',
  LIST_TRANSITION: 'transition-all duration-400 ease-in-out'
} as const

// Animation duration utilities
export const DURATIONS = {
  INSTANT: 0,
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
  SLOWER: 700,
  SLOWEST: 1000
} as const

// Easing functions
export const EASINGS = {
  LINEAR: 'linear',
  EASE: 'ease',
  EASE_IN: 'ease-in',
  EASE_OUT: 'ease-out',
  EASE_IN_OUT: 'ease-in-out',
  BOUNCE: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  ELASTIC: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  SMOOTH: 'cubic-bezier(0.4, 0, 0.2, 1)',
  SHARP: 'cubic-bezier(0.4, 0, 0.6, 1)'
} as const

// Stagger delay utilities
export const getStaggerDelay = (index: number, baseDelay: number = 50): number => {
  return index * baseDelay
}

export const getStaggerStyle = (index: number, baseDelay: number = 50): React.CSSProperties => {
  return {
    animationDelay: `${getStaggerDelay(index, baseDelay)}ms`
  }
}

// Animation utility functions
export const createAnimationClass = (config: AnimationConfig): string => {
  const baseClass = ANIMATION_CLASSES.TRANSITION_ALL
  const durationClass = `duration-${config.duration}`
  const easingClass = config.easing ? `ease-${config.easing.replace('-', '-')}` : 'ease-out'

  return `${baseClass} ${durationClass} ${easingClass}`
}

export const createTransformClass = (scale?: number, translateX?: number, translateY?: number): string => {
  const transforms: string[] = []

  if (scale !== undefined) {
    transforms.push(`scale(${scale})`)
  }
  if (translateX !== undefined) {
    transforms.push(`translateX(${translateX}px)`)
  }
  if (translateY !== undefined) {
    transforms.push(`translateY(${translateY}px)`)
  }

  return transforms.length > 0 ? `transform: ${transforms.join(' ')}` : ''
}

// Accessibility: respect user preferences
export const shouldReduceMotion = (): boolean => {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export const getAnimationClass = (animationClass: string): string => {
  return shouldReduceMotion() ? '' : animationClass
}

// Animation preset combinations
export const PRESET_ANIMATIONS = {
  CARD_HOVER: `${ANIMATION_CLASSES.HOVER_SCALE} ${ANIMATION_CLASSES.HOVER_SHADOW} ${ANIMATION_CLASSES.TRANSITION_ALL}`,
  BUTTON_HOVER: `${ANIMATION_CLASSES.HOVER_SCALE} ${ANIMATION_CLASSES.TRANSITION_TRANSFORM} ${ANIMATION_CLASSES.ACTIVE_SCALE}`,
  FILTER_TOGGLE: `${ANIMATION_CLASSES.TRANSITION_ALL} ${ANIMATION_CLASSES.HOVER_GLOW}`,
  VIEW_MODE_SWITCH: `${ANIMATION_CLASSES.GRID_TRANSITION}`,
  LOADING_STATE: `${ANIMATION_CLASSES.LOADING_PULSE} ${ANIMATION_CLASSES.TRANSITION_OPACITY}`,
  FOCUS_STATE: `${ANIMATION_CLASSES.FOCUS_RING} ${ANIMATION_CLASSES.TRANSITION_SHADOW}`,
  FORM_FIELD: `${ANIMATION_CLASSES.FOCUS_BORDER} ${ANIMATION_CLASSES.TRANSITION_COLORS}`,
  PANEL_SLIDE: `${ANIMATION_CLASSES.ENTER_SLIDE_UP} ${ANIMATION_CLASSES.TRANSITION_ALL}`
} as const

// Export types for external use
export type AnimationType = AnimationConfig['type']
export type AnimationEasing = AnimationConfig['easing']
export type AnimationDirection = AnimationConfig['direction']
export type PresetAnimation = keyof typeof PRESET_ANIMATIONS
export type AnimationClass = keyof typeof ANIMATION_CLASSES