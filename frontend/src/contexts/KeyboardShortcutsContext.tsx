'use client'

/**
 * Keyboard Shortcuts Context
 * Phase 8.2: UI Polish - Global keyboard shortcuts system
 */

import React, {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useState,
  useRef,
} from 'react'
import { useRouter } from 'next/navigation'

// Types
export interface KeyboardShortcut {
  id: string
  keys: string[] // e.g., ['meta', 'n'] or ['g', 'd'] for sequence
  description: string
  action: () => void
  scope?: 'global' | 'page'
  enabled?: boolean
  category?: string
}

interface KeyboardShortcutsContextType {
  shortcuts: Map<string, KeyboardShortcut>
  registerShortcut: (shortcut: KeyboardShortcut) => void
  unregisterShortcut: (id: string) => void
  isHelpOpen: boolean
  openHelp: () => void
  closeHelp: () => void
  toggleHelp: () => void
}

const KeyboardShortcutsContext = createContext<KeyboardShortcutsContextType | undefined>(undefined)

export function useKeyboardShortcuts(): KeyboardShortcutsContextType {
  const context = useContext(KeyboardShortcutsContext)
  if (!context) {
    throw new Error('useKeyboardShortcuts must be used within a KeyboardShortcutsProvider')
  }
  return context
}

interface KeyboardShortcutsProviderProps {
  children: React.ReactNode
}

// Helper to normalize key names
function normalizeKey(key: string): string {
  const keyMap: Record<string, string> = {
    'control': 'ctrl',
    'command': 'meta',
    'cmd': 'meta',
    'option': 'alt',
    'escape': 'esc',
  }
  return keyMap[key.toLowerCase()] || key.toLowerCase()
}

// Helper to get key from event
function getKeyFromEvent(e: KeyboardEvent): string {
  const key = e.key.toLowerCase()
  if (key === ' ') return 'space'
  if (key === 'escape') return 'esc'
  return key
}

export function KeyboardShortcutsProvider({ children }: KeyboardShortcutsProviderProps) {
  const router = useRouter()
  const [shortcuts, setShortcuts] = useState<Map<string, KeyboardShortcut>>(new Map())
  const [isHelpOpen, setIsHelpOpen] = useState(false)
  const sequenceBuffer = useRef<string[]>([])
  const sequenceTimeout = useRef<NodeJS.Timeout | null>(null)

  // Register a shortcut
  const registerShortcut = useCallback((shortcut: KeyboardShortcut) => {
    setShortcuts((prev) => {
      const next = new Map(prev)
      next.set(shortcut.id, { ...shortcut, enabled: shortcut.enabled ?? true })
      return next
    })
  }, [])

  // Unregister a shortcut
  const unregisterShortcut = useCallback((id: string) => {
    setShortcuts((prev) => {
      const next = new Map(prev)
      next.delete(id)
      return next
    })
  }, [])

  // Help modal controls
  const openHelp = useCallback(() => setIsHelpOpen(true), [])
  const closeHelp = useCallback(() => setIsHelpOpen(false), [])
  const toggleHelp = useCallback(() => setIsHelpOpen((prev) => !prev), [])

  // Register default global shortcuts
  useEffect(() => {
    const defaultShortcuts: KeyboardShortcut[] = [
      {
        id: 'help',
        keys: ['meta', '/'],
        description: 'Show keyboard shortcuts',
        action: () => setIsHelpOpen((prev) => !prev),
        category: 'General',
      },
      {
        id: 'help-alt',
        keys: ['ctrl', '/'],
        description: 'Show keyboard shortcuts',
        action: () => setIsHelpOpen((prev) => !prev),
        category: 'General',
      },
      {
        id: 'go-dashboard',
        keys: ['g', 'd'],
        description: 'Go to Dashboard',
        action: () => router.push('/dashboard'),
        category: 'Navigation',
      },
      {
        id: 'go-events',
        keys: ['g', 'e'],
        description: 'Go to Events',
        action: () => router.push('/events'),
        category: 'Navigation',
      },
      {
        id: 'new-event',
        keys: ['meta', 'n'],
        description: 'Create new event',
        action: () => router.push('/events/new'),
        category: 'Actions',
      },
      {
        id: 'new-event-alt',
        keys: ['ctrl', 'n'],
        description: 'Create new event',
        action: () => router.push('/events/new'),
        category: 'Actions',
      },
      {
        id: 'close-modal',
        keys: ['esc'],
        description: 'Close modal/dialog',
        action: () => setIsHelpOpen(false),
        category: 'General',
      },
    ]

    defaultShortcuts.forEach(registerShortcut)

    return () => {
      defaultShortcuts.forEach((s) => unregisterShortcut(s.id))
    }
  }, [registerShortcut, unregisterShortcut, router])

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger in inputs/textareas unless it's Escape
      const target = e.target as HTMLElement
      const isInput = target.tagName === 'INPUT' ||
                      target.tagName === 'TEXTAREA' ||
                      target.isContentEditable

      if (isInput && e.key !== 'Escape') {
        return
      }

      const key = getKeyFromEvent(e)
      const hasModifier = e.metaKey || e.ctrlKey || e.altKey

      // Check for modifier-based shortcuts
      if (hasModifier) {
        for (const shortcut of shortcuts.values()) {
          if (!shortcut.enabled) continue

          const keys = shortcut.keys.map(normalizeKey)
          if (keys.length !== 2) continue

          const [modifier, shortcutKey] = keys
          const matchesMeta = modifier === 'meta' && (e.metaKey || e.ctrlKey)
          const matchesCtrl = modifier === 'ctrl' && e.ctrlKey
          const matchesAlt = modifier === 'alt' && e.altKey

          if ((matchesMeta || matchesCtrl || matchesAlt) && key === shortcutKey) {
            e.preventDefault()
            shortcut.action()
            return
          }
        }
      }

      // Handle sequence-based shortcuts (like 'g' then 'd')
      if (!hasModifier && key.length === 1) {
        // Clear previous timeout
        if (sequenceTimeout.current) {
          clearTimeout(sequenceTimeout.current)
        }

        // Add key to sequence buffer
        sequenceBuffer.current.push(key)

        // Check for matching sequences
        for (const shortcut of shortcuts.values()) {
          if (!shortcut.enabled) continue

          const keys = shortcut.keys.map(normalizeKey)

          // Skip modifier-based shortcuts
          if (keys.some(k => ['meta', 'ctrl', 'alt', 'shift'].includes(k))) {
            continue
          }

          // Check if sequence matches
          if (keys.length === sequenceBuffer.current.length) {
            const matches = keys.every((k, i) => k === sequenceBuffer.current[i])
            if (matches) {
              e.preventDefault()
              shortcut.action()
              sequenceBuffer.current = []
              return
            }
          }
        }

        // Clear sequence buffer after timeout
        sequenceTimeout.current = setTimeout(() => {
          sequenceBuffer.current = []
        }, 800)
      }

      // Handle single key shortcuts (like Escape)
      if (!hasModifier) {
        for (const shortcut of shortcuts.values()) {
          if (!shortcut.enabled) continue

          const keys = shortcut.keys.map(normalizeKey)
          if (keys.length === 1 && keys[0] === key) {
            e.preventDefault()
            shortcut.action()
            return
          }
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [shortcuts])

  const value: KeyboardShortcutsContextType = {
    shortcuts,
    registerShortcut,
    unregisterShortcut,
    isHelpOpen,
    openHelp,
    closeHelp,
    toggleHelp,
  }

  return (
    <KeyboardShortcutsContext.Provider value={value}>
      {children}
      {isHelpOpen && <KeyboardShortcutsModal onClose={closeHelp} shortcuts={shortcuts} />}
    </KeyboardShortcutsContext.Provider>
  )
}

// Keyboard shortcuts help modal
interface KeyboardShortcutsModalProps {
  onClose: () => void
  shortcuts: Map<string, KeyboardShortcut>
}

function KeyboardShortcutsModal({ onClose, shortcuts }: KeyboardShortcutsModalProps) {
  // Group shortcuts by category
  const groupedShortcuts = Array.from(shortcuts.values())
    .filter((s) => s.enabled !== false)
    .reduce((acc, shortcut) => {
      const category = shortcut.category || 'Other'
      if (!acc[category]) {
        acc[category] = []
      }
      // Avoid duplicate descriptions
      const exists = acc[category].some((s) => s.description === shortcut.description)
      if (!exists) {
        acc[category].push(shortcut)
      }
      return acc
    }, {} as Record<string, KeyboardShortcut[]>)

  // Format keys for display
  const formatKeys = (keys: string[]): string[] => {
    return keys.map((key) => {
      const keyMap: Record<string, string> = {
        meta: '⌘',
        ctrl: 'Ctrl',
        alt: 'Alt',
        shift: 'Shift',
        esc: 'Esc',
        enter: '↵',
        space: 'Space',
      }
      return keyMap[key.toLowerCase()] || key.toUpperCase()
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative w-full max-w-lg bg-card border border-border rounded-lg shadow-xl animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-card-foreground">
            Keyboard Shortcuts
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 max-h-[60vh] overflow-y-auto space-y-6">
          {Object.entries(groupedShortcuts).map(([category, categoryShortcuts]) => (
            <div key={category}>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">
                {category}
              </h3>
              <div className="space-y-2">
                {categoryShortcuts.map((shortcut) => (
                  <div
                    key={shortcut.id}
                    className="flex items-center justify-between py-2"
                  >
                    <span className="text-sm text-card-foreground">
                      {shortcut.description}
                    </span>
                    <div className="flex items-center gap-1">
                      {formatKeys(shortcut.keys).map((key, i) => (
                        <React.Fragment key={i}>
                          {i > 0 && (
                            <span className="text-xs text-muted-foreground mx-0.5">
                              {shortcut.keys.length === 2 && !['⌘', 'Ctrl', 'Alt', 'Shift'].includes(formatKeys(shortcut.keys)[0])
                                ? 'then'
                                : '+'}
                            </span>
                          )}
                          <kbd className="inline-flex items-center justify-center min-w-[24px] h-6 px-2 text-xs font-medium bg-muted text-muted-foreground border border-border rounded">
                            {key}
                          </kbd>
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border text-center">
          <p className="text-xs text-muted-foreground">
            Press <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded border border-border">Esc</kbd> to close
          </p>
        </div>
      </div>
    </div>
  )
}

// Hook for registering page-specific shortcuts
export function useRegisterShortcut(shortcut: KeyboardShortcut) {
  const { registerShortcut, unregisterShortcut } = useKeyboardShortcuts()

  useEffect(() => {
    registerShortcut(shortcut)
    return () => unregisterShortcut(shortcut.id)
  }, [shortcut, registerShortcut, unregisterShortcut])
}
