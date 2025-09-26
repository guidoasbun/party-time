'use client'

import * as React from 'react'
import { useFormContext } from 'react-hook-form'
import { MapPin, Search, Home, Building2 } from 'lucide-react'
import { EventCreateFormData } from '@/lib/validations/event'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
// Import removed cn as it's not used

// Location type presets
const locationPresets = [
  {
    icon: Home,
    label: 'Home',
    description: 'Host at your home or residence',
    value: 'Home'
  },
  {
    icon: Building2,
    label: 'Office/Workplace',
    description: 'Host at your office or workplace',
    value: 'Office'
  },
  {
    icon: MapPin,
    label: 'Outdoor Location',
    description: 'Park, beach, or outdoor venue',
    value: 'Outdoor Location'
  }
]

export function LocationStep() {
  const {
    register,
    setValue,
    watch,
    formState: { errors }
  } = useFormContext<EventCreateFormData>()

  const location = watch('location')
  const venueName = watch('venue_name')
  const venueAddress = watch('venue_address')

  const [isSearchingVenues, setIsSearchingVenues] = React.useState(false)

  const handleLocationPreset = (preset: typeof locationPresets[0]) => {
    setValue('location', preset.value, { shouldValidate: true })
  }

  const handleVenueSearch = () => {
    setIsSearchingVenues(true)
    // TODO: Implement venue search with Google Places API
    // This will be implemented in Phase 7
    console.log('Venue search will be implemented in Phase 7')
    setIsSearchingVenues(false)
  }

  const hasLocationInfo = location || venueName || venueAddress

  return (
    <div className="space-y-6">
      {/* Location Type Selection */}
      <div className="space-y-4">
        <h3 className="font-medium">Where will your event take place?</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {locationPresets.map((preset) => {
            const Icon = preset.icon
            return (
              <Button
                key={preset.label}
                type="button"
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-2 text-center"
                onClick={() => handleLocationPreset(preset)}
              >
                <Icon className="h-6 w-6" />
                <div>
                  <div className="font-medium">{preset.label}</div>
                  <div className="text-xs text-muted-foreground">
                    {preset.description}
                  </div>
                </div>
              </Button>
            )
          })}
        </div>
      </div>

      {/* General Location */}
      <Input
        {...register('location')}
        label="General Location"
        placeholder="e.g., Downtown Seattle, My backyard, Company conference room"
        error={errors.location?.message}
        leftIcon={<MapPin className="h-4 w-4" />}
      />

      {/* Venue Details Section */}
      <div className="space-y-4 border-t pt-6">
        <div className="flex items-center justify-between">
          <h4 className="font-medium">Venue Details (Optional)</h4>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleVenueSearch}
            disabled={isSearchingVenues}
          >
            <Search className="h-4 w-4 mr-2" />
            {isSearchingVenues ? 'Searching...' : 'Search Venues'}
          </Button>
        </div>

        <p className="text-sm text-muted-foreground">
          Add specific venue information if you have a dedicated location.
        </p>

        {/* Venue Name */}
        <Input
          {...register('venue_name')}
          label="Venue Name"
          placeholder="e.g., The Grand Ballroom, Sunset Community Center"
          error={errors.venue_name?.message}
          leftIcon={<Building2 className="h-4 w-4" />}
        />

        {/* Venue Address */}
        <Input
          {...register('venue_address')}
          label="Venue Address"
          placeholder="e.g., 123 Main Street, Seattle, WA 98101"
          error={errors.venue_address?.message}
          leftIcon={<MapPin className="h-4 w-4" />}
        />

        {/* Google Places ID (hidden field for future use) */}
        <input
          type="hidden"
          {...register('venue_google_place_id')}
        />
      </div>

      {/* Location Summary */}
      {hasLocationInfo && (
        <div className="bg-muted/50 rounded-lg p-4">
          <h4 className="font-medium mb-2">📍 Location Summary</h4>
          <div className="text-sm text-muted-foreground space-y-1">
            {location && (
              <p><strong>Location:</strong> {location}</p>
            )}
            {venueName && (
              <p><strong>Venue:</strong> {venueName}</p>
            )}
            {venueAddress && (
              <p><strong>Address:</strong> {venueAddress}</p>
            )}
          </div>
        </div>
      )}

      {/* Location Tips */}
      <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
        <h4 className="font-medium mb-2 text-green-900 dark:text-green-100">🎯 Location Planning Tips:</h4>
        <ul className="text-sm text-green-700 dark:text-green-200 space-y-1">
          <li>• Consider accessibility for all your guests</li>
          <li>• Check parking availability and public transportation</li>
          <li>• Ensure the venue size matches your expected guest count</li>
          <li>• Consider backup options for outdoor events</li>
          <li>• Verify any permits or permissions needed</li>
          <li>• Think about catering restrictions or kitchen facilities</li>
        </ul>
      </div>

      {/* Future Feature Preview */}
      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h4 className="font-medium mb-2 text-blue-900 dark:text-blue-100">🚀 Coming Soon:</h4>
        <p className="text-sm text-blue-700 dark:text-blue-200">
          Venue search powered by Google Places will help you discover and book local venues.
          For now, you can manually enter your venue details above.
        </p>
      </div>
    </div>
  )
}