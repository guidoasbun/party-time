'use client'

import * as React from 'react'
import { Globe, Search, Clock, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Input } from './Input'

// Comprehensive list of IANA timezone identifiers grouped by region
const TIMEZONE_GROUPS = {
  'North America': [
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Phoenix',
    'America/Los_Angeles',
    'America/Anchorage',
    'America/Adak',
    'Pacific/Honolulu',
    'America/Toronto',
    'America/Vancouver',
    'America/Montreal',
    'America/Mexico_City',
    'America/Cancun'
  ],
  'South America': [
    'America/Sao_Paulo',
    'America/Argentina/Buenos_Aires',
    'America/Santiago',
    'America/Lima',
    'America/Bogota',
    'America/Caracas',
    'America/La_Paz',
    'America/Montevideo'
  ],
  'Europe': [
    'UTC',
    'Europe/London',
    'Europe/Dublin',
    'Europe/Paris',
    'Europe/Berlin',
    'Europe/Madrid',
    'Europe/Rome',
    'Europe/Amsterdam',
    'Europe/Brussels',
    'Europe/Vienna',
    'Europe/Prague',
    'Europe/Warsaw',
    'Europe/Stockholm',
    'Europe/Helsinki',
    'Europe/Moscow',
    'Europe/Istanbul',
    'Europe/Athens',
    'Europe/Zurich'
  ],
  'Asia': [
    'Asia/Dubai',
    'Asia/Kolkata',
    'Asia/Kathmandu',
    'Asia/Dhaka',
    'Asia/Jakarta',
    'Asia/Bangkok',
    'Asia/Singapore',
    'Asia/Hong_Kong',
    'Asia/Shanghai',
    'Asia/Taipei',
    'Asia/Seoul',
    'Asia/Tokyo',
    'Asia/Manila'
  ],
  'Africa': [
    'Africa/Lagos',
    'Africa/Cairo',
    'Africa/Johannesburg',
    'Africa/Nairobi',
    'Africa/Casablanca',
    'Africa/Tunis',
    'Africa/Algiers'
  ],
  'Australia & Pacific': [
    'Pacific/Auckland',
    'Australia/Sydney',
    'Australia/Melbourne',
    'Australia/Brisbane',
    'Australia/Perth',
    'Australia/Adelaide',
    'Australia/Darwin',
    'Pacific/Fiji',
    'Pacific/Tahiti'
  ]
}

interface Timezone {
  value: string
  label: string
  region: string
  offset: string
  current: string
}

// Generate timezone options with current time and offset
const generateTimezoneOptions = (): Timezone[] => {
  const options: Timezone[] = []

  Object.entries(TIMEZONE_GROUPS).forEach(([region, timezones]) => {
    timezones.forEach(tz => {
      try {
        const now = new Date()
        const formatter = new Intl.DateTimeFormat('en-US', {
          timeZone: tz,
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        })

        const offsetFormatter = new Intl.DateTimeFormat('en', {
          timeZone: tz,
          timeZoneName: 'longOffset'
        })

        const current = formatter.format(now)
        const offsetPart = offsetFormatter.formatToParts(now).find(part => part.type === 'timeZoneName')
        const offset = offsetPart?.value || ''

        const cityName = tz.split('/').pop()?.replace(/_/g, ' ') || tz
        const label = `${cityName} (${offset})`

        options.push({
          value: tz,
          label,
          region,
          offset,
          current
        })
      } catch (error) {
        // Skip invalid timezones
        console.warn(`Invalid timezone: ${tz}`)
      }
    })
  })

  return options.sort((a, b) => a.label.localeCompare(b.label))
}

interface TimezoneSelectorProps {
  value?: string
  onChange?: (value: string) => void
  label?: string
  error?: string
  disabled?: boolean
  className?: string
  placeholder?: string
  showCurrentTime?: boolean
}

export function TimezoneSelector({
  value,
  onChange,
  label,
  error,
  disabled = false,
  className,
  placeholder = "Select timezone",
  showCurrentTime = true
}: TimezoneSelectorProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [searchTerm, setSearchTerm] = React.useState('')
  const [timezoneOptions] = React.useState(() => generateTimezoneOptions())
  const containerRef = React.useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Filter options based on search term
  const filteredOptions = React.useMemo(() => {
    if (!searchTerm) return timezoneOptions

    const search = searchTerm.toLowerCase()
    return timezoneOptions.filter(option =>
      option.label.toLowerCase().includes(search) ||
      option.region.toLowerCase().includes(search) ||
      option.value.toLowerCase().includes(search)
    )
  }, [timezoneOptions, searchTerm])

  // Group filtered options by region
  const groupedOptions = React.useMemo(() => {
    const groups: Record<string, Timezone[]> = {}

    filteredOptions.forEach(option => {
      if (!groups[option.region]) {
        groups[option.region] = []
      }
      groups[option.region].push(option)
    })

    return groups
  }, [filteredOptions])

  // Get selected timezone info
  const selectedTimezone = timezoneOptions.find(tz => tz.value === value)

  const handleSelect = (timezone: Timezone) => {
    onChange?.(timezone.value)
    setIsOpen(false)
    setSearchTerm('')
  }

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen)
    }
  }

  // Auto-detect user's timezone if none selected
  React.useEffect(() => {
    if (!value) {
      const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone
      onChange?.(userTimezone)
    }
  }, [value, onChange])

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {label && (
        <label className="block text-sm font-medium mb-2">
          {label}
        </label>
      )}

      {/* Selected timezone display */}
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        className={cn(
          "flex w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          error && "border-destructive focus:ring-destructive"
        )}
      >
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-muted-foreground" />
          <span className={selectedTimezone ? "text-foreground" : "text-muted-foreground"}>
            {selectedTimezone ? selectedTimezone.label : placeholder}
          </span>
        </div>
        <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
      </button>

      {/* Show current time for selected timezone */}
      {showCurrentTime && selectedTimezone && (
        <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>Current time: {selectedTimezone.current}</span>
        </div>
      )}

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full z-50 mt-1 w-full rounded-md border bg-popover shadow-lg">
          <div className="p-2">
            <Input
              type="text"
              placeholder="Search timezones..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search className="h-4 w-4" />}
              className="mb-2"
            />
          </div>

          <div className="max-h-60 overflow-y-auto">
            {Object.keys(groupedOptions).length === 0 ? (
              <div className="p-3 text-center text-sm text-muted-foreground">
                No timezones found
              </div>
            ) : (
              Object.entries(groupedOptions).map(([region, timezones]) => (
                <div key={region}>
                  <div className="px-3 py-2 text-xs font-semibold text-muted-foreground bg-muted/50">
                    {region}
                  </div>
                  {timezones.map((timezone) => (
                    <button
                      key={timezone.value}
                      type="button"
                      onClick={() => handleSelect(timezone)}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors",
                        value === timezone.value && "bg-accent text-accent-foreground"
                      )}
                    >
                      <span>{timezone.label}</span>
                      {showCurrentTime && (
                        <span className="text-xs text-muted-foreground ml-2">
                          {timezone.current}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {error && (
        <p className="mt-1 text-sm text-destructive">{error}</p>
      )}
    </div>
  )
}

// Utility functions for timezone handling
export const getTimezoneOffset = (timezone: string): string => {
  try {
    const formatter = new Intl.DateTimeFormat('en', {
      timeZone: timezone,
      timeZoneName: 'longOffset'
    })
    const offsetPart = formatter.formatToParts(new Date()).find(part => part.type === 'timeZoneName')
    return offsetPart?.value || ''
  } catch {
    return ''
  }
}

export const getCurrentTimeInTimezone = (timezone: string): string => {
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
    return formatter.format(new Date())
  } catch {
    return ''
  }
}

export const getTimezoneDisplayName = (timezone: string): string => {
  const cityName = timezone.split('/').pop()?.replace(/_/g, ' ') || timezone
  const offset = getTimezoneOffset(timezone)
  return offset ? `${cityName} (${offset})` : cityName
}

// Common timezones for quick access
export const getCommonTimezones = (): string[] => [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'UTC',
  'Europe/London',
  'Europe/Paris',
  'Asia/Tokyo',
  'Australia/Sydney'
]