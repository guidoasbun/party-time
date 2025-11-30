'use client'

import * as React from 'react'
import { useFormContext } from 'react-hook-form'
import { MapPin, Search, Home, Building2, X, Star, ExternalLink } from 'lucide-react'
import { EventCreateFormData } from '@/lib/validations/event'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { VenueSearchModal } from '@/components/venues/VenueSearchModal'
import { VenueSearchResult, VenueDetails } from '@/types/venue.types'
import { cn } from '@/lib/utils'

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
  const venueGooglePlaceId = watch('venue_google_place_id')

  const [isVenueSearchOpen, setIsVenueSearchOpen] = React.useState(false)
  const [selectedVenue, setSelectedVenue] = React.useState<{
    name: string;
    address: string;
    place_id: string;
    rating?: number;
    photo_url?: string;
    website?: string;
  } | null>(null)

  // Sync selected venue with form values on mount
  React.useEffect(() => {
    if (venueName && venueAddress && venueGooglePlaceId && !selectedVenue) {
      setSelectedVenue({
        name: venueName,
        address: venueAddress,
        place_id: venueGooglePlaceId,
      })
    }
  }, [venueName, venueAddress, venueGooglePlaceId, selectedVenue])

  const handleLocationPreset = (preset: typeof locationPresets[0]) => {
    setValue('location', preset.value, { shouldValidate: true })
  }

  const handleVenueSelect = (venue: VenueSearchResult | VenueDetails) => {
    // Update form values
    setValue('venue_name', venue.name, { shouldValidate: true })
    setValue('venue_address', venue.address, { shouldValidate: true })
    setValue('venue_google_place_id', venue.place_id, { shouldValidate: true })

    // Also update the general location if empty
    if (!location) {
      setValue('location', venue.address, { shouldValidate: true })
    }

    // Store selected venue for display
    setSelectedVenue({
      name: venue.name,
      address: venue.address,
      place_id: venue.place_id,
      rating: venue.rating,
      photo_url: 'photo_url' in venue ? venue.photo_url : undefined,
      website: 'website' in venue ? venue.website : undefined,
    })

    setIsVenueSearchOpen(false)
  }

  const handleClearVenue = () => {
    setValue('venue_name', '', { shouldValidate: true })
    setValue('venue_address', '', { shouldValidate: true })
    setValue('venue_google_place_id', '', { shouldValidate: true })
    setSelectedVenue(null)
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
            onClick={() => setIsVenueSearchOpen(true)}
          >
            <Search className="h-4 w-4 mr-2" />
            Search Venues
          </Button>
        </div>

        <p className="text-sm text-muted-foreground">
          Search for a venue or manually enter the details below.
        </p>

        {/* Selected Venue Card */}
        {selectedVenue && (
          <div className="relative rounded-lg border border-primary/50 bg-primary/5 p-4">
            <button
              type="button"
              onClick={handleClearVenue}
              className="absolute right-2 top-2 p-1 rounded-full hover:bg-muted transition-colors"
              title="Clear venue"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
            <div className="pr-8">
              <h5 className="font-semibold text-foreground">{selectedVenue.name}</h5>
              <p className="text-sm text-muted-foreground mt-1">{selectedVenue.address}</p>
              <div className="flex items-center gap-3 mt-2">
                {selectedVenue.rating && (
                  <span className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    {selectedVenue.rating.toFixed(1)}
                  </span>
                )}
                {selectedVenue.website && (
                  <a
                    href={selectedVenue.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm text-primary hover:underline"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Website
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Manual Entry Fields (show when no venue selected or for editing) */}
        <div className={cn(
          "space-y-4",
          selectedVenue && "opacity-60"
        )}>
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
        </div>

        {/* Google Places ID (hidden field) */}
        <input
          type="hidden"
          {...register('venue_google_place_id')}
        />
      </div>

      {/* Venue Search Modal */}
      <VenueSearchModal
        isOpen={isVenueSearchOpen}
        onClose={() => setIsVenueSearchOpen(false)}
        onSelectVenue={handleVenueSelect}
      />

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

    </div>
  )
}