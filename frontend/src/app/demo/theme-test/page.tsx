'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import {
  Sun,
  Moon,
  Monitor,
  Palette,
  Check,
  Calendar,
  Users,
  DollarSign,
  MapPin,
  Star
} from 'lucide-react'

export default function ThemeTestPage() {
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark' | 'system'>('system')
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light')
  const [testInput, setTestInput] = useState('')
  const [testSelect, setTestSelect] = useState('')

  // Simple theme management for testing
  useEffect(() => {
    // Load saved theme on mount
    const saved = localStorage.getItem('party-time-theme') as 'light' | 'dark' | 'system' | null
    if (saved) {
      setCurrentTheme(saved)
    }
  }, [])

  // Update resolved theme and DOM when currentTheme changes
  useEffect(() => {
    const updateResolvedTheme = () => {
      let resolved: 'light' | 'dark' = 'light'

      if (currentTheme === 'dark') {
        resolved = 'dark'
      } else if (currentTheme === 'system') {
        resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      } else {
        resolved = 'light'
      }

      setResolvedTheme(resolved)

      // Apply theme to document immediately
      document.documentElement.classList.remove('light', 'dark')
      document.documentElement.classList.add(resolved)
      // Force reflow to ensure changes are applied
      void document.documentElement.offsetHeight
    }

    updateResolvedTheme()

    // Listen for system theme changes only if in system mode
    if (currentTheme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const handleChange = () => updateResolvedTheme()
      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    }
  }, [currentTheme])

  const handleThemeChange = (theme: 'light' | 'dark' | 'system') => {
    // Update state immediately
    setCurrentTheme(theme)
    localStorage.setItem('party-time-theme', theme)

    // Force immediate DOM update
    let resolved: 'light' | 'dark' = 'light'
    if (theme === 'dark') {
      resolved = 'dark'
    } else if (theme === 'system') {
      resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }

    setResolvedTheme(resolved)

    // Force immediate DOM update
    document.documentElement.classList.remove('light', 'dark')
    document.documentElement.classList.add(resolved)

    // Force a style recalculation
    void document.documentElement.offsetHeight
  }

  const themeOptions = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor }
  ]

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-200">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Theme Test Page</h1>
              <p className="text-muted-foreground">Test dark, light, and system theme modes</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Current: {resolvedTheme}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Theme Status Card */}
        <div className="mb-8 p-6 rounded-lg border border-border bg-card">
          <div className="flex items-center gap-2 mb-4">
            <Palette className="h-5 w-5" />
            <h2 className="text-xl font-semibold">Theme Status</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">Selected Theme</p>
              <div className="px-3 py-1 bg-secondary text-secondary-foreground rounded-md text-sm font-mono">
                {currentTheme}
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Resolved Theme</p>
              <div className={`px-3 py-1 rounded-md text-sm font-mono ${
                resolvedTheme === 'dark'
                  ? 'bg-destructive text-destructive-foreground'
                  : 'bg-primary text-primary-foreground'
              }`}>
                {resolvedTheme}
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">HTML Class</p>
              <div className="px-3 py-1 bg-muted text-muted-foreground rounded-md text-sm font-mono">
                {typeof document !== 'undefined' ? document.documentElement.className || 'none' : 'ssr'}
              </div>
            </div>
          </div>
        </div>

        {/* Theme Controls */}
        <div className="mb-8 p-6 rounded-lg border border-border bg-card">
          <h2 className="text-xl font-semibold mb-4">Theme Controls</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {themeOptions.map((option) => {
              const Icon = option.icon
              const isActive = currentTheme === option.value
              return (
                <Button
                  key={option.value}
                  variant={isActive ? 'default' : 'outline'}
                  onClick={() => handleThemeChange(option.value as 'light' | 'dark' | 'system')}
                  className="flex items-center gap-2 min-h-[48px]"
                >
                  <Icon className="h-4 w-4" />
                  {option.label}
                  {isActive && <Check className="h-3 w-3 ml-auto" />}
                </Button>
              )
            })}
          </div>
        </div>

        {/* UI Components Test */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Buttons & Actions */}
          <div className="p-6 rounded-lg border border-border bg-card">
            <h3 className="text-lg font-semibold mb-4">Buttons & Actions</h3>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Button variant="default">Default</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button size="sm">Small</Button>
                <Button size="md">Medium</Button>
                <Button size="lg">Large</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" disabled>Disabled</Button>
                <Button className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Destructive
                </Button>
              </div>
            </div>
          </div>

          {/* Form Elements */}
          <div className="p-6 rounded-lg border border-border bg-card">
            <h3 className="text-lg font-semibold mb-4">Form Elements</h3>
            <div className="space-y-4">
              <Input
                label="Text Input"
                placeholder="Enter some text..."
                value={testInput}
                onChange={(e) => setTestInput(e.target.value)}
                leftIcon={<Users className="h-4 w-4" />}
              />
              <Select
                label="Select Dropdown"
                placeholder="Choose an option..."
                value={testSelect}
                onValueChange={(value) => setTestSelect(Array.isArray(value) ? value[0] || '' : value)}
                options={[
                  { value: 'wedding', label: 'Wedding' },
                  { value: 'birthday', label: 'Birthday Party' },
                  { value: 'corporate', label: 'Corporate Event' }
                ]}
              />
            </div>
          </div>

          {/* Stats Cards */}
          <div className="p-6 rounded-lg border border-border bg-card">
            <h3 className="text-lg font-semibold mb-4">Stats & Data</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-muted">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Events</span>
                </div>
                <p className="text-2xl font-bold">24</p>
                <p className="text-xs text-muted-foreground">+12% from last month</p>
              </div>
              <div className="p-4 rounded-lg bg-muted">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Budget</span>
                </div>
                <p className="text-2xl font-bold">$15,420</p>
                <p className="text-xs text-muted-foreground">-5% from last month</p>
              </div>
            </div>
          </div>

          {/* Event Card Example */}
          <div className="p-6 rounded-lg border border-border bg-card">
            <h3 className="text-lg font-semibold mb-4">Event Card Example</h3>
            <div className="border border-border rounded-lg p-4 bg-card">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-card-foreground">Annual Company Retreat</h4>
                  <p className="text-sm text-muted-foreground">Corporate Event</p>
                </div>
                <div className="px-2 py-1 bg-primary text-primary-foreground rounded text-xs font-medium">
                  Upcoming
                </div>
              </div>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="h-3 w-3" />
                  <span>March 15, 2024</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-3 w-3" />
                  <span>Hilton Conference Center</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-3 w-3" />
                  <span>150 guests</span>
                </div>
              </div>
              <div className="flex items-center justify-between mt-4">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className="h-3 w-3 text-primary fill-current"
                    />
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">Edit</Button>
                  <Button size="sm">View</Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Color Palette */}
        <div className="mt-8 p-6 rounded-lg border border-border bg-card">
          <h2 className="text-xl font-semibold mb-4">Color Palette</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
            {[
              { name: 'Background', class: 'bg-background', text: 'text-foreground' },
              { name: 'Foreground', class: 'bg-foreground', text: 'text-background' },
              { name: 'Card', class: 'bg-card', text: 'text-card-foreground' },
              { name: 'Primary', class: 'bg-primary', text: 'text-primary-foreground' },
              { name: 'Secondary', class: 'bg-secondary', text: 'text-secondary-foreground' },
              { name: 'Muted', class: 'bg-muted', text: 'text-muted-foreground' },
              { name: 'Accent', class: 'bg-accent', text: 'text-accent-foreground' },
              { name: 'Destructive', class: 'bg-destructive', text: 'text-destructive-foreground' },
              { name: 'Border', class: 'bg-border', text: 'text-foreground' },
              { name: 'Input', class: 'bg-input', text: 'text-foreground' },
              { name: 'Ring', class: 'bg-ring', text: 'text-primary-foreground' },
              { name: 'Popover', class: 'bg-popover', text: 'text-popover-foreground' },
            ].map((color) => (
              <div key={color.name} className="text-center">
                <div
                  className={`w-full h-16 rounded-lg border-2 border-border ${color.class} ${color.text} flex items-center justify-center text-xs font-medium`}
                >
                  {color.name}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Debug Info */}
        <div className="mt-8 p-6 rounded-lg border border-border bg-card">
          <h2 className="text-xl font-semibold mb-4">Debug Information</h2>
          <div className="space-y-2 text-sm font-mono">
            <div>User Agent: {typeof navigator !== 'undefined' ? navigator.userAgent : 'SSR'}</div>
            <div>Prefers Color Scheme: {typeof window !== 'undefined' && window.matchMedia ?
              window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light' : 'unknown'}</div>
            <div>LocalStorage Theme: {typeof localStorage !== 'undefined' ?
              localStorage.getItem('party-time-theme') || 'null' : 'SSR'}</div>
            <div>Document Class: {typeof document !== 'undefined' ?
              document.documentElement.className || 'none' : 'SSR'}</div>
          </div>
        </div>
      </div>
    </div>
  )
}