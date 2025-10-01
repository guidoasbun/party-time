import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Hook to warn users about unsaved changes before leaving the page
 * @param enabled - Whether the warning should be active
 * @param message - Custom warning message (optional)
 */
export function useUnsavedChangesWarning(
  enabled: boolean,
  message: string = 'You have unsaved changes. Are you sure you want to leave?'
): void {
  const router = useRouter()

  useEffect(() => {
    if (!enabled) return

    // Handle browser navigation (refresh, close tab, etc.)
    const handleBeforeUnload = (e: BeforeUnloadEvent): string => {
      e.preventDefault()
      // Modern browsers require returnValue to be set
      e.returnValue = message
      return message
    }

    // Add the event listener
    window.addEventListener('beforeunload', handleBeforeUnload)

    // Cleanup on unmount or when enabled changes
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [enabled, message])

  // Note: Next.js router navigation cannot be intercepted with a confirmation dialog
  // This is a known limitation. The beforeunload event only works for browser-level navigation.
  // For in-app navigation, you would need to implement a custom confirmation modal.
}
