"use client";

/**
 * Phase 9.2: Onboarding State Management Hook
 * Manages the onboarding flow state with localStorage persistence
 */

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "party-time-onboarding";

export interface OnboardingState {
  completed: boolean;
  skipped: boolean;
  currentStep: number;
  completedSteps: string[];
  startedAt?: string;
  completedAt?: string;
}

const defaultState: OnboardingState = {
  completed: false,
  skipped: false,
  currentStep: 0,
  completedSteps: [],
};

export interface UseOnboardingReturn {
  state: OnboardingState;
  isLoading: boolean;
  shouldShowOnboarding: boolean;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  completeStep: (stepId: string) => void;
  completeOnboarding: () => void;
  skipOnboarding: () => void;
  resetOnboarding: () => void;
}

export function useOnboarding(): UseOnboardingReturn {
  const [state, setState] = useState<OnboardingState>(defaultState);
  const [isLoading, setIsLoading] = useState(true);

  // Load state from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored) as OnboardingState;
          setState(parsed);
        }
      } catch (error) {
        console.warn("Failed to load onboarding state:", error);
      }
      setIsLoading(false);
    }
  }, []);

  // Persist state to localStorage
  const persistState = useCallback((newState: OnboardingState) => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
      } catch (error) {
        console.warn("Failed to save onboarding state:", error);
      }
    }
  }, []);

  // Set current step
  const setCurrentStep = useCallback(
    (step: number) => {
      setState((prev) => {
        const newState = { ...prev, currentStep: step };
        persistState(newState);
        return newState;
      });
    },
    [persistState]
  );

  // Mark a step as completed
  const completeStep = useCallback(
    (stepId: string) => {
      setState((prev) => {
        if (prev.completedSteps.includes(stepId)) {
          return prev;
        }
        const newState = {
          ...prev,
          completedSteps: [...prev.completedSteps, stepId],
        };
        persistState(newState);
        return newState;
      });
    },
    [persistState]
  );

  // Complete the entire onboarding
  const completeOnboarding = useCallback(() => {
    setState((prev) => {
      const newState = {
        ...prev,
        completed: true,
        completedAt: new Date().toISOString(),
      };
      persistState(newState);
      return newState;
    });
  }, [persistState]);

  // Skip onboarding
  const skipOnboarding = useCallback(() => {
    setState((prev) => {
      const newState = {
        ...prev,
        skipped: true,
        completedAt: new Date().toISOString(),
      };
      persistState(newState);
      return newState;
    });
  }, [persistState]);

  // Reset onboarding (for testing or user request)
  const resetOnboarding = useCallback(() => {
    const newState = {
      ...defaultState,
      startedAt: new Date().toISOString(),
    };
    setState(newState);
    persistState(newState);
  }, [persistState]);

  // Determine if onboarding should be shown
  const shouldShowOnboarding =
    !isLoading && !state.completed && !state.skipped;

  return {
    state,
    isLoading,
    shouldShowOnboarding,
    currentStep: state.currentStep,
    setCurrentStep,
    completeStep,
    completeOnboarding,
    skipOnboarding,
    resetOnboarding,
  };
}

/**
 * Check if onboarding has been completed
 */
export function isOnboardingCompleted(): boolean {
  if (typeof window === "undefined") return false;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as OnboardingState;
      return parsed.completed || parsed.skipped;
    }
  } catch {
    // Ignore errors
  }

  return false;
}
