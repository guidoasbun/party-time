/**
 * Mock data factories for venue testing
 * Phase 8.1: Comprehensive Testing Backfill
 */

import type {
  VenueSearchResult,
  VenueDetails,
  VenueSearchResponse,
  EventVenue,
  SavedVenue,
  CompareVenue,
  VenuePhoto,
  VenueReview,
  VenueOpeningHours,
} from '@/types/venue.types'

// Venue search result factory
export const createMockVenueSearchResult = (
  overrides: Partial<VenueSearchResult> = {}
): VenueSearchResult => ({
  place_id: 'ChIJN1t_tDeuEmsRUsoyG83frY4',
  name: 'Grand Ballroom',
  address: '123 Main Street, Downtown, City 12345',
  location: {
    latitude: 40.7128,
    longitude: -74.006,
  },
  rating: 4.5,
  user_ratings_total: 250,
  price_level: 3,
  types: ['event_venue', 'wedding_venue', 'restaurant'],
  photo_url: 'https://example.com/venue-photo.jpg',
  open_now: true,
  ...overrides,
})

// Venue photo factory
export const createMockVenuePhoto = (
  overrides: Partial<VenuePhoto> = {}
): VenuePhoto => ({
  url: 'https://example.com/photo.jpg',
  width: 1600,
  height: 1200,
  attributions: ['Photo by Example Photographer'],
  ...overrides,
})

// Venue review factory
export const createMockVenueReview = (
  overrides: Partial<VenueReview> = {}
): VenueReview => ({
  author_name: 'Jane Smith',
  rating: 5,
  text: 'Amazing venue! The staff was incredibly helpful and the space was beautiful.',
  time: 1704067200, // Jan 1, 2024
  relative_time_description: '2 months ago',
  profile_photo_url: 'https://example.com/profile.jpg',
  ...overrides,
})

// Opening hours factory
export const createMockVenueOpeningHours = (
  overrides: Partial<VenueOpeningHours> = {}
): VenueOpeningHours => ({
  open_now: true,
  weekday_text: [
    'Monday: 9:00 AM - 10:00 PM',
    'Tuesday: 9:00 AM - 10:00 PM',
    'Wednesday: 9:00 AM - 10:00 PM',
    'Thursday: 9:00 AM - 10:00 PM',
    'Friday: 9:00 AM - 11:00 PM',
    'Saturday: 10:00 AM - 11:00 PM',
    'Sunday: 10:00 AM - 8:00 PM',
  ],
  periods: [
    { open_day: 1, open_time: '0900', close_day: 1, close_time: '2200' },
    { open_day: 2, open_time: '0900', close_day: 2, close_time: '2200' },
    { open_day: 3, open_time: '0900', close_day: 3, close_time: '2200' },
    { open_day: 4, open_time: '0900', close_day: 4, close_time: '2200' },
    { open_day: 5, open_time: '0900', close_day: 5, close_time: '2300' },
    { open_day: 6, open_time: '1000', close_day: 6, close_time: '2300' },
    { open_day: 0, open_time: '1000', close_day: 0, close_time: '2000' },
  ],
  ...overrides,
})

// Venue details factory
export const createMockVenueDetails = (
  overrides: Partial<VenueDetails> = {}
): VenueDetails => ({
  place_id: 'ChIJN1t_tDeuEmsRUsoyG83frY4',
  name: 'Grand Ballroom',
  address: '123 Main Street',
  formatted_address: '123 Main Street, Downtown, City 12345, USA',
  location: {
    latitude: 40.7128,
    longitude: -74.006,
  },
  rating: 4.5,
  user_ratings_total: 250,
  price_level: 3,
  types: ['event_venue', 'wedding_venue', 'restaurant'],
  phone: '+1 (555) 123-4567',
  website: 'https://grandballroom.example.com',
  opening_hours: createMockVenueOpeningHours(),
  photos: [
    createMockVenuePhoto({ url: 'https://example.com/photo1.jpg' }),
    createMockVenuePhoto({ url: 'https://example.com/photo2.jpg' }),
    createMockVenuePhoto({ url: 'https://example.com/photo3.jpg' }),
  ],
  reviews: [
    createMockVenueReview({ author_name: 'Jane Smith', rating: 5 }),
    createMockVenueReview({
      author_name: 'John Doe',
      rating: 4,
      text: 'Great venue, slightly expensive.',
    }),
  ],
  url: 'https://maps.google.com/?cid=123456789',
  editorial_summary: 'Elegant downtown venue perfect for weddings and corporate events.',
  ...overrides,
})

// Venue search response factory
export const createMockVenueSearchResponse = (
  overrides: Partial<VenueSearchResponse> = {}
): VenueSearchResponse => ({
  results: [
    createMockVenueSearchResult({
      place_id: 'place-1',
      name: 'Grand Ballroom',
      rating: 4.5,
    }),
    createMockVenueSearchResult({
      place_id: 'place-2',
      name: 'The Garden Terrace',
      rating: 4.8,
      price_level: 4,
    }),
    createMockVenueSearchResult({
      place_id: 'place-3',
      name: 'City View Events',
      rating: 4.2,
      price_level: 2,
    }),
  ],
  total_results: 3,
  query: 'wedding venue',
  cached: false,
  ...overrides,
})

// Event venue (saved to database) factory
export const createMockEventVenue = (
  overrides: Partial<EventVenue> = {}
): EventVenue => ({
  id: 'venue-1',
  event_id: 'event-1',
  name: 'Grand Ballroom',
  address: '123 Main Street, Downtown, City 12345',
  latitude: 40.7128,
  longitude: -74.006,
  google_place_id: 'ChIJN1t_tDeuEmsRUsoyG83frY4',
  phone: '+1 (555) 123-4567',
  website: 'https://grandballroom.example.com',
  rating: 4.5,
  price_level: 3,
  photo_url: 'https://example.com/venue-photo.jpg',
  is_manual: false,
  notes: 'Main reception venue',
  display_order: 1,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-15T00:00:00Z',
  ...overrides,
})

// Saved venue (localStorage) factory
export const createMockSavedVenue = (
  overrides: Partial<SavedVenue> = {}
): SavedVenue => ({
  placeId: 'ChIJN1t_tDeuEmsRUsoyG83frY4',
  name: 'Grand Ballroom',
  address: '123 Main Street, Downtown, City 12345',
  photoUrl: 'https://example.com/venue-photo.jpg',
  rating: 4.5,
  priceLevel: 3,
  savedAt: '2024-01-15T12:00:00Z',
  ...overrides,
})

// Compare venue factory
export const createMockCompareVenue = (
  overrides: Partial<CompareVenue> = {}
): CompareVenue => ({
  placeId: 'ChIJN1t_tDeuEmsRUsoyG83frY4',
  name: 'Grand Ballroom',
  photoUrl: 'https://example.com/venue-photo.jpg',
  ...overrides,
})

// Mock venue collections
export const mockVenueSearchResults: VenueSearchResult[] = [
  createMockVenueSearchResult({
    place_id: 'place-1',
    name: 'Grand Ballroom',
    rating: 4.5,
    price_level: 3,
    types: ['event_venue', 'wedding_venue'],
  }),
  createMockVenueSearchResult({
    place_id: 'place-2',
    name: 'The Garden Terrace',
    rating: 4.8,
    price_level: 4,
    types: ['restaurant', 'event_venue'],
  }),
  createMockVenueSearchResult({
    place_id: 'place-3',
    name: 'City View Events',
    rating: 4.2,
    price_level: 2,
    types: ['conference_center', 'event_venue'],
  }),
  createMockVenueSearchResult({
    place_id: 'place-4',
    name: 'Lakeside Pavilion',
    rating: 4.6,
    price_level: 3,
    open_now: false,
    types: ['park', 'event_venue'],
  }),
  createMockVenueSearchResult({
    place_id: 'place-5',
    name: 'Historic Manor',
    rating: 4.9,
    price_level: 4,
    types: ['wedding_venue', 'museum'],
  }),
]

export const mockEventVenues: EventVenue[] = [
  createMockEventVenue({
    id: 'venue-1',
    name: 'Grand Ballroom',
    display_order: 1,
    notes: 'Primary venue',
  }),
  createMockEventVenue({
    id: 'venue-2',
    name: 'The Garden Terrace',
    display_order: 2,
    notes: 'Backup option',
  }),
]

export const mockSavedVenues: SavedVenue[] = [
  createMockSavedVenue({
    placeId: 'place-1',
    name: 'Grand Ballroom',
    savedAt: '2024-01-15T12:00:00Z',
  }),
  createMockSavedVenue({
    placeId: 'place-2',
    name: 'The Garden Terrace',
    savedAt: '2024-01-14T10:00:00Z',
  }),
]

// Comparison scenarios
export const mockCompareVenues: CompareVenue[] = [
  createMockCompareVenue({ placeId: 'place-1', name: 'Grand Ballroom' }),
  createMockCompareVenue({ placeId: 'place-2', name: 'The Garden Terrace' }),
]

// Venue without optional fields (edge case)
export const createMinimalVenueSearchResult = (): VenueSearchResult => ({
  place_id: 'minimal-place',
  name: 'Basic Venue',
  address: '456 Simple Street',
  location: {
    latitude: 40.0,
    longitude: -74.0,
  },
  types: ['event_venue'],
})

// Manual venue (user-entered, not from Google)
export const createManualEventVenue = (): EventVenue =>
  createMockEventVenue({
    id: 'manual-venue-1',
    name: 'My Backyard',
    address: '789 Home Ave, Suburbia 54321',
    google_place_id: undefined,
    phone: undefined,
    website: undefined,
    rating: undefined,
    price_level: undefined,
    photo_url: undefined,
    is_manual: true,
    notes: 'Family residence - no booking required',
  })

// Venue with no rating (new venue)
export const createUnratedVenue = (): VenueSearchResult =>
  createMockVenueSearchResult({
    place_id: 'unrated-place',
    name: 'New Event Space',
    rating: undefined,
    user_ratings_total: undefined,
  })

// Closed venue
export const createClosedVenue = (): VenueSearchResult =>
  createMockVenueSearchResult({
    place_id: 'closed-place',
    name: 'Weekend-Only Venue',
    open_now: false,
  })
