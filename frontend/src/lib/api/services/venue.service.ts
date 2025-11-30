/**
 * FR-8: The system shall provide a venue search interface.
 * Phase 7.1.1: Google Places API Integration
 * Venue service module (Phase 7.1.1: Google Places API Integration)
 *
 * Provides methods for:
 * - Searching venues via Google Places API
 * - Getting venue details
 * - Managing event venues (CRUD)
 */

import { api, withRetry } from "@/lib/api-client";
import { API_ENDPOINTS, UUID } from "@/types";
import {
  VenueSearchParams,
  VenueSearchResponse,
  VenueDetails,
  VenuePhoto,
  EventVenue,
  EventVenueWithDetails,
  EventVenueCreateRequest,
  EventVenueUpdateRequest,
  EventVenuesListResponse,
  EventVenueReorderRequest,
} from "@/types/venue.types";

/**
 * Venue service class with typed methods
 */
export class VenueService {
  // ============================================================
  // Google Places API Search Methods
  // ============================================================

  /**
   * Search for venues using Google Places API
   * @param params Search parameters
   * @returns Search results with venue list
   */
  async searchVenues(params: VenueSearchParams): Promise<VenueSearchResponse> {
    return api.get<VenueSearchResponse>(
      API_ENDPOINTS.VENUES.SEARCH,
      params as unknown as Record<string, unknown>,
      withRetry({ attempts: 2 })
    );
  }

  /**
   * Get detailed information about a venue from Google Places
   * @param placeId Google Place ID
   * @returns Full venue details including photos, reviews, hours
   */
  async getVenueDetails(placeId: string): Promise<VenueDetails> {
    return api.get<VenueDetails>(
      API_ENDPOINTS.VENUES.GET_DETAILS(placeId),
      undefined,
      withRetry({ attempts: 2 })
    );
  }

  /**
   * Get photos for a venue
   * @param placeId Google Place ID
   * @param maxWidth Maximum photo width
   * @param maxHeight Maximum photo height
   * @param limit Maximum number of photos
   * @returns List of photo URLs
   */
  async getVenuePhotos(
    placeId: string,
    maxWidth: number = 800,
    maxHeight: number = 600,
    limit: number = 10
  ): Promise<VenuePhoto[]> {
    return api.get<VenuePhoto[]>(
      API_ENDPOINTS.VENUES.GET_PHOTOS(placeId),
      { max_width: maxWidth, max_height: maxHeight, limit },
      withRetry({ attempts: 2 })
    );
  }

  // ============================================================
  // Event Venue Management Methods
  // ============================================================

  /**
   * Get all venues for an event
   * @param eventId Event UUID
   * @returns List of event venues
   */
  async getEventVenues(eventId: UUID): Promise<EventVenuesListResponse> {
    return api.get<EventVenuesListResponse>(
      API_ENDPOINTS.VENUES.LIST(eventId),
      undefined,
      withRetry({ attempts: 2 })
    );
  }

  /**
   * Add a venue to an event
   * @param eventId Event UUID
   * @param venueData Venue data (place_id for Google venue, or manual venue fields)
   * @returns Created event venue
   */
  async addVenueToEvent(
    eventId: UUID,
    venueData: EventVenueCreateRequest
  ): Promise<EventVenue> {
    return api.post<EventVenue>(API_ENDPOINTS.VENUES.ADD(eventId), venueData);
  }

  /**
   * Get a specific venue for an event
   * @param eventId Event UUID
   * @param venueId Venue UUID
   * @param includeGoogleDetails Whether to fetch fresh details from Google
   * @returns Event venue with optional Google details
   */
  async getEventVenue(
    eventId: UUID,
    venueId: UUID,
    includeGoogleDetails: boolean = false
  ): Promise<EventVenueWithDetails> {
    return api.get<EventVenueWithDetails>(
      API_ENDPOINTS.VENUES.GET(eventId, venueId),
      { include_google_details: includeGoogleDetails },
      withRetry({ attempts: 2 })
    );
  }

  /**
   * Update an event venue
   * @param eventId Event UUID
   * @param venueId Venue UUID
   * @param updateData Updated venue data
   * @returns Updated event venue
   */
  async updateEventVenue(
    eventId: UUID,
    venueId: UUID,
    updateData: EventVenueUpdateRequest
  ): Promise<EventVenue> {
    return api.put<EventVenue>(
      API_ENDPOINTS.VENUES.UPDATE(eventId, venueId),
      updateData
    );
  }

  /**
   * Remove a venue from an event
   * @param eventId Event UUID
   * @param venueId Venue UUID
   */
  async removeVenueFromEvent(eventId: UUID, venueId: UUID): Promise<void> {
    return api.delete(API_ENDPOINTS.VENUES.DELETE(eventId, venueId));
  }

  /**
   * Reorder venues for an event
   * @param eventId Event UUID
   * @param venueIds Array of venue IDs in new order
   * @returns Updated list of event venues
   */
  async reorderEventVenues(
    eventId: UUID,
    venueIds: string[]
  ): Promise<EventVenuesListResponse> {
    const request: EventVenueReorderRequest = { venue_ids: venueIds };
    return api.put<EventVenuesListResponse>(
      API_ENDPOINTS.VENUES.REORDER(eventId),
      request
    );
  }

  // ============================================================
  // Utility Methods
  // ============================================================

  /**
   * Add a Google venue to an event by place_id
   * Convenience method that wraps addVenueToEvent
   */
  async addGoogleVenueToEvent(
    eventId: UUID,
    placeId: string,
    notes?: string
  ): Promise<EventVenue> {
    return this.addVenueToEvent(eventId, {
      place_id: placeId,
      notes,
    });
  }

  /**
   * Add a manual venue to an event
   * Convenience method that wraps addVenueToEvent
   */
  async addManualVenueToEvent(
    eventId: UUID,
    venue: {
      name: string;
      address: string;
      latitude: number;
      longitude: number;
      phone?: string;
      website?: string;
      notes?: string;
    }
  ): Promise<EventVenue> {
    return this.addVenueToEvent(eventId, venue);
  }
}

// Export singleton instance
export const venueService = new VenueService();
