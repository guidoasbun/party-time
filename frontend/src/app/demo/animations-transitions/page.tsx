/**
 * Animations & Transitions Demo Page (Simplified for Build)
 */

'use client'

import React, { useState, Suspense } from 'react'
import { Play, RotateCcw, Eye, EyeOff, Zap, Layers, MousePointer, Monitor, Palette, Sun, Moon } from 'lucide-react'
import { EventCard } from '@/components/events/EventCard'
import { EventList } from '@/components/events/EventList'
import { EventFilters } from '@/components/events/EventFilters'
import { Button } from '@/components/ui/Button'
import { AnimatedContainer, FadeInContainer, SlideInContainer } from '@/components/ui/AnimatedContainer'
import { ViewTransition, ModalTransition, CollapseTransition } from '@/components/ui/Transition'
import { EventSummary, EventType, EventStatus } from '@/types/event.types'
import { cn } from '@/lib/utils'

// Standalone Theme Toggle implementation
function SafeThemeToggle() {
  const [mounted, setMounted] = React.useState(false)
  const [isOpen, setIsOpen] = React.useState(false)
  const [currentTheme, setCurrentTheme] = React.useState<'light' | 'dark' | 'system'>('system')
  const dropdownRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    setMounted(true)
    // Initialize theme from localStorage and apply it
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('party-time-theme') as 'light' | 'dark' | 'system' || 'system'
      setCurrentTheme(savedTheme)
      applyTheme(savedTheme)
    }
  }, [])

  // Close dropdown when clicking outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    function handleEscapeKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscapeKey)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscapeKey)
    }
  }, [isOpen])

  const applyTheme = (theme: 'light' | 'dark' | 'system') => {
    if (typeof window === 'undefined') return

    const root = document.documentElement

    if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      root.classList.toggle('dark', prefersDark)
      root.classList.toggle('light', !prefersDark)
    } else {
      root.classList.toggle('dark', theme === 'dark')
      root.classList.toggle('light', theme === 'light')
    }

    localStorage.setItem('party-time-theme', theme)
  }

  const handleThemeChange = (theme: 'light' | 'dark' | 'system') => {
    setCurrentTheme(theme)
    applyTheme(theme)
    setIsOpen(false)
  }

  const getResolvedTheme = (): 'light' | 'dark' => {
    if (!mounted) return 'light'

    if (currentTheme === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    return currentTheme
  }

  const resolvedTheme = getResolvedTheme()

  if (!mounted) {
    return (
      <Button variant="ghost" size="sm" className="h-9 w-9 px-0" disabled title="Theme toggle loading...">
        <Monitor className="h-4 w-4" />
      </Button>
    )
  }

  return (
    <div ref={dropdownRef} className="relative">
      <Button
        variant="ghost"
        size="sm"
        className="h-9 w-9 px-0"
        onClick={() => setIsOpen(!isOpen)}
        title={`Current theme: ${currentTheme} (${resolvedTheme})`}
      >
        {resolvedTheme === 'dark' ? (
          <Moon className="h-4 w-4" />
        ) : (
          <Sun className="h-4 w-4" />
        )}
      </Button>

      <div className={cn(
        "absolute right-0 top-full mt-2 w-48 bg-popover border border-border rounded-lg shadow-lg transition-all duration-200 z-[99999] pointer-events-auto",
        isOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
      )}>
        <div className="p-1">
          <button
            onClick={() => handleThemeChange('light')}
            className={cn(
              'flex items-center gap-2 w-full px-3 py-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground transition-colors',
              currentTheme === 'light' && 'bg-accent text-accent-foreground'
            )}
          >
            <Sun className="h-4 w-4" />
            <span>Light</span>
            {currentTheme === 'light' && (
              <div className="ml-auto w-2 h-2 bg-primary rounded-full" />
            )}
          </button>

          <button
            onClick={() => handleThemeChange('dark')}
            className={cn(
              'flex items-center gap-2 w-full px-3 py-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground transition-colors',
              currentTheme === 'dark' && 'bg-accent text-accent-foreground'
            )}
          >
            <Moon className="h-4 w-4" />
            <span>Dark</span>
            {currentTheme === 'dark' && (
              <div className="ml-auto w-2 h-2 bg-primary rounded-full" />
            )}
          </button>

          <button
            onClick={() => handleThemeChange('system')}
            className={cn(
              'flex items-center gap-2 w-full px-3 py-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground transition-colors',
              currentTheme === 'system' && 'bg-accent text-accent-foreground'
            )}
          >
            <Monitor className="h-4 w-4" />
            <span>System</span>
            {currentTheme === 'system' && (
              <div className="ml-auto w-2 h-2 bg-primary rounded-full" />
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

// Mock data for demonstrations
const mockEvents: EventSummary[] = [
  {
    id: '1',
    name: 'Summer Wedding Celebration',
    type: EventType.WEDDING,
    status: EventStatus.CONFIRMED,
    start_date: '2025-07-15T14:00:00Z',
    venue_name: 'Sunset Gardens',
    guest_count: 120,
    confirmed_guests: 95,
    budget_total: 25000,
    total_expenses: 18500,
    planner_name: 'Alice Johnson',
    created_at: '2025-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'Tech Conference 2025',
    type: EventType.CONFERENCE,
    status: EventStatus.PLANNING,
    start_date: '2025-09-20T09:00:00Z',
    venue_name: 'Convention Center',
    guest_count: 500,
    confirmed_guests: 200,
    budget_total: 50000,
    total_expenses: 15000,
    planner_name: 'Bob Smith',
    created_at: '2025-01-05T00:00:00Z'
  }
]

export default function AnimationsTransitionsDemo() {
  const [isAnimationsEnabled, setIsAnimationsEnabled] = useState(true)
  const [eventViewMode, setEventViewMode] = useState<'grid' | 'list'>('grid')
  const [currentView, setCurrentView] = useState('components')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isCollapseOpen, setIsCollapseOpen] = useState(false)
  const [animationSpeed, setAnimationSpeed] = useState('normal')
  const [triggerKey, setTriggerKey] = useState(0)

  const handleTrigger = () => {
    setTriggerKey(prev => prev + 1)
  }

  const views = {
    components: (
      <div className="space-y-8">
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <Layers className="h-6 w-6" />
            Component Animations
          </h2>

          {/* Basic Animation Examples with Test IDs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="fade-section">
            <div className="p-6 bg-card border rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Fade Animation</h3>
              <div className="space-y-4">
                <button data-testid="trigger-fade-in" className="px-3 py-1 bg-blue-500 text-white rounded text-sm mr-2">
                  Fade In
                </button>
                <button data-testid="trigger-fade-out" className="px-3 py-1 bg-red-500 text-white rounded text-sm">
                  Fade Out
                </button>
                <div
                  key={`fade-${triggerKey}`}
                  className="h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-semibold animate-fadeIn"
                  data-testid="fade-element"
                >
                  Fade Animation
                </div>
              </div>
            </div>
          </div>

          {/* Slide Animations */}
          <div data-testid="slide-section">
            <div className="p-6 bg-card border rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Slide Animations</h3>
              <div className="space-y-2">
                {(['up', 'down', 'left', 'right'] as const).map((direction) => (
                  <div key={direction} className="flex items-center gap-4">
                    <button
                      data-testid={`trigger-slide-${direction}`}
                      className="px-3 py-1 bg-green-500 text-white rounded text-sm"
                    >
                      Slide {direction}
                    </button>
                    <div
                      key={`slide-${direction}-${triggerKey}`}
                      className={`h-12 w-32 bg-gradient-to-r from-green-500 to-teal-600 rounded flex items-center justify-center text-white text-sm font-semibold animate-slideIn${direction.charAt(0).toUpperCase() + direction.slice(1)}`}
                      data-testid={`slide-${direction}-element`}
                    >
                      Slide {direction}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Scale, Bounce, Shake, Pulse */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div data-testid="scale-section" className="p-6 bg-card border rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Scale</h3>
              <button data-testid="trigger-scale-in" className="px-3 py-1 bg-orange-500 text-white rounded text-sm mr-2">Scale In</button>
              <button data-testid="trigger-scale-out" className="px-3 py-1 bg-red-500 text-white rounded text-sm">Scale Out</button>
              <div
                key={`scale-${triggerKey}`}
                className="mt-4 h-20 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg flex items-center justify-center text-white font-semibold animate-scaleIn"
                data-testid="scale-element"
              >
                Scale
              </div>
            </div>

            <div data-testid="bounce-section" className="p-6 bg-card border rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Bounce</h3>
              <button data-testid="trigger-bounce" className="px-3 py-1 bg-pink-500 text-white rounded text-sm">Bounce</button>
              <div
                key={`bounce-${triggerKey}`}
                className="mt-4 h-20 bg-gradient-to-r from-pink-500 to-rose-600 rounded-lg flex items-center justify-center text-white font-semibold animate-bounceIn"
                data-testid="bounce-element"
              >
                Bounce
              </div>
            </div>

            <div data-testid="shake-section" className="p-6 bg-card border rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Shake</h3>
              <button data-testid="trigger-shake" className="px-3 py-1 bg-red-500 text-white rounded text-sm">Shake</button>
              <div
                key={`shake-${triggerKey}`}
                className="mt-4 h-20 bg-gradient-to-r from-red-500 to-orange-600 rounded-lg flex items-center justify-center text-white font-semibold animate-shake"
                data-testid="shake-element"
              >
                Shake
              </div>
            </div>
          </div>

          <div data-testid="pulse-section" className="p-6 bg-card border rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Pulse</h3>
            <button data-testid="trigger-pulse" className="px-3 py-1 bg-purple-500 text-white rounded text-sm">Pulse</button>
            <div
              key={`pulse-${triggerKey}`}
              className="mt-4 h-20 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-semibold animate-pulse"
              data-testid="pulse-element"
            >
              Pulse
            </div>
          </div>

          {/* Staggered */}
          <div data-testid="stagger-section" className="p-6 bg-card border rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Staggered</h3>
            <button data-testid="trigger-stagger" className="px-3 py-1 bg-indigo-500 text-white rounded text-sm">Stagger</button>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }, (_, i) => (
                <div
                  key={`stagger-${i}-${triggerKey}`}
                  data-testid={`stagger-item-${i}`}
                  className="h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-semibold animate-fadeIn"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  Card {i + 1}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Real Components */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold">Real Components</h2>

          <div data-testid="event-filters-section" className="p-6 bg-card border rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Event Filters</h3>
            <button data-testid="advanced-filters-toggle" className="px-3 py-1 bg-blue-500 text-white rounded text-sm mb-4">
              Toggle Advanced
            </button>
            <EventFilters />
          </div>

          <div data-testid="event-list-section" className="p-6 bg-card border rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Event List</h3>
            <div className="flex gap-2 mb-4">
              <button data-testid="view-grid" className="px-3 py-1 bg-green-500 text-white rounded text-sm">Grid</button>
              <button data-testid="view-list" className="px-3 py-1 bg-blue-500 text-white rounded text-sm">List</button>
            </div>
            <div data-testid="events-container">
              <EventList
                events={mockEvents}
                viewMode={eventViewMode}
                onEdit={() => {}}
                onDelete={() => {}}
                onView={() => {}}
              />
            </div>
          </div>

          <div data-testid="event-card-section" className="p-6 bg-card border rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Event Cards</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mockEvents.map((event) => (
                <div key={event.id} className="event-card">
                  <EventCard
                    event={event}
                    onEdit={() => {}}
                    onDelete={() => {}}
                    onView={() => {}}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    ),
    modals: (
      <div className="space-y-8">
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold">Modal & Transitions</h2>

          <div data-testid="modal-section" className="p-6 bg-card border rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Modal</h3>
            <button
              data-testid="open-modal"
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              Open Modal
            </button>

            <ModalTransition
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
            >
              <div className="bg-white p-6 rounded-lg shadow-xl max-w-md mx-auto" data-testid="modal-overlay">
                <h3 className="text-lg font-semibold mb-4">Modal Demo</h3>
                <p className="mb-4">This demonstrates modal transitions.</p>
                <button
                  data-testid="close-modal"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded"
                >
                  Close
                </button>
              </div>
            </ModalTransition>
          </div>

          <div data-testid="collapse-section" className="p-6 bg-card border rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Collapse</h3>
            <button
              data-testid="collapse-toggle"
              onClick={() => setIsCollapseOpen(!isCollapseOpen)}
              className="px-4 py-2 bg-green-500 text-white rounded"
            >
              {isCollapseOpen ? 'Collapse' : 'Expand'}
            </button>

            <CollapseTransition isOpen={isCollapseOpen}>
              <div className="mt-4 p-4 bg-gray-100 rounded" data-testid="collapse-content">
                <h4 className="font-semibold mb-2">Collapsed Content</h4>
                <p className="text-sm mb-4">This content smoothly expands and collapses.</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="h-8 bg-blue-200 rounded"></div>
                  <div className="h-8 bg-green-200 rounded"></div>
                </div>
              </div>
            </CollapseTransition>
          </div>
        </section>
      </div>
    ),
    performance: (
      <div className="space-y-8" data-testid="performance-section">
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <Monitor className="h-6 w-6" />
            Performance Testing
          </h2>

          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium">Item Count:</label>
              <input
                type="number"
                defaultValue={50}
                className="w-20 px-2 py-1 border rounded"
                data-testid="item-count-input"
                min="1"
                max="500"
              />
              <button
                data-testid="generate-items"
                className="px-3 py-1 bg-blue-500 text-white rounded text-sm"
              >
                Generate Items
              </button>
            </div>

            <div className="p-6 bg-card border rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Performance Test</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 max-h-64 overflow-y-auto">
                {Array.from({ length: 50 }, (_, i) => (
                  <div
                    key={i}
                    data-testid={`performance-item-${i}`}
                    className="h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded flex items-center justify-center text-white text-xs font-semibold animate-scaleIn"
                    style={{ animationDelay: `${i * 10}ms` }}
                  >
                    {i + 1}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    )
  }

  return (
    <Suspense fallback={<div className="animate-pulse">Loading...</div>}>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="border-b bg-card">
          <div className="container mx-auto px-4 py-6">
            <FadeInContainer direction="in" duration={500}>
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                    <Zap className="h-8 w-8 text-primary" />
                    Animations & Transitions Demo
                  </h1>
                  <p className="text-muted-foreground mt-2">
                    Interactive showcase of all animations and transitions
                  </p>
                </div>

                {/* Controls */}
                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    variant={isAnimationsEnabled ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setIsAnimationsEnabled(!isAnimationsEnabled)}
                    className="gap-2"
                    data-testid="animations-toggle"
                  >
                    {isAnimationsEnabled ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    {isAnimationsEnabled ? 'Animations On' : 'Animations Off'}
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleTrigger}
                    className="gap-2"
                    data-testid="stagger-toggle"
                  >
                    <Play className="h-4 w-4" />
                    Trigger
                  </Button>

                  <div className="flex items-center gap-2">
                    <label htmlFor="speed-slider" className="text-sm">Speed:</label>
                    <input
                      id="speed-slider"
                      type="range"
                      min="0.5"
                      max="2"
                      step="0.5"
                      defaultValue="1"
                      className="w-20"
                      data-testid="speed-slider"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <Palette className="h-4 w-4 text-muted-foreground" />
                    <SafeThemeToggle />
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Reset
                  </Button>
                </div>
              </div>
            </FadeInContainer>
          </div>
        </div>

        {/* Navigation */}
        <div className="border-b bg-muted/30 relative z-10">
          <div className="container mx-auto px-4">
            <SlideInContainer direction="down" delay={200}>
              <div className="flex gap-1 py-2">
                {[
                  { key: 'components', label: 'Components', icon: Layers },
                  { key: 'modals', label: 'Modals', icon: MousePointer },
                  { key: 'performance', label: 'Performance', icon: Monitor }
                ].map(({ key, label, icon: Icon }) => (
                  <Button
                    key={key}
                    variant={currentView === key ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setCurrentView(key)}
                    className="gap-2"
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </Button>
                ))}
              </div>
            </SlideInContainer>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          <ViewTransition
            activeView={currentView}
            views={views}
            mode="fade"
            duration={300}
          />
        </div>
      </div>
    </Suspense>
  )
}