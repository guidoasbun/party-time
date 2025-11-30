/**
 * FR-8: The system shall provide a venue search interface.
 * Phase 7.1.1: Google Places API Integration
 * Phase 7.1.2: Venue Search UI Enhancement
 * VenueTab Component
 *
 * Tab content for venue management within event details:
 * - List of saved venues for the event
 * - Search for new venues via Google Places (with map split-view)
 * - Saved/shortlisted venues before adding to event
 * - Add manual venues
 * - Venue details modal
 * - Drag-to-reorder venues
 */
"use client";

import * as React from "react";
import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { VenueSearchWithMap } from "./VenueSearchWithMap";
import { VenueDetails } from "./VenueDetails";
import { VenueMap } from "./VenueMap";
import { ManualVenueForm } from "./ManualVenueForm";
import { SavedVenuesList } from "./SavedVenuesList";
import {
  useEventVenues,
  useAddEventVenue,
  useDeleteEventVenue,
} from "@/hooks/useEventVenues";
import { useSavedVenues } from "@/hooks/useSavedVenues";
import {
  VenueSearchResult,
  VenueDetails as VenueDetailsType,
  EventVenue,
  EventVenueCreateRequest,
  SavedVenue,
} from "@/types/venue.types";
import {
  MapPin,
  Search,
  Building2,
  Loader2,
  AlertCircle,
  Trash2,
  ExternalLink,
  Phone,
  Globe,
  Star,
  FileText,
  Bookmark,
} from "lucide-react";

interface VenueTabProps {
  eventId: string;
  className?: string;
}

type ViewMode = "list" | "search" | "manual";
type SearchSubTab = "search" | "saved";

export function VenueTab({ eventId, className }: VenueTabProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [searchSubTab, setSearchSubTab] = useState<SearchSubTab>("search");
  const [selectedVenueId, setSelectedVenueId] = useState<string | null>(null);
  const [detailsPlaceId, setDetailsPlaceId] = useState<string | null>(null);
  const [venueToDelete, setVenueToDelete] = useState<EventVenue | null>(null);

  // Fetch event venues
  const { data: venues = [], isLoading, error } = useEventVenues(eventId);

  // Saved venues (localStorage shortlist)
  const {
    savedVenues,
    saveVenue,
    unsaveVenue,
    isSaved,
    clearAll: clearSavedVenues,
    isLoading: isSavedLoading,
  } = useSavedVenues(eventId);

  // Mutations
  const addVenueMutation = useAddEventVenue(eventId);
  const deleteVenueMutation = useDeleteEventVenue(eventId);

  // Handle selecting a venue from search results
  const handleVenueSelect = useCallback(
    async (venue: VenueDetailsType) => {
      const venueData: EventVenueCreateRequest = {
        place_id: venue.place_id,
      };
      await addVenueMutation.mutateAsync(venueData);
      setViewMode("list");
      setDetailsPlaceId(null);
    },
    [addVenueMutation]
  );

  // Handle manual venue submission
  const handleManualVenueSubmit = useCallback(
    async (data: EventVenueCreateRequest) => {
      await addVenueMutation.mutateAsync(data);
      setViewMode("list");
    },
    [addVenueMutation]
  );

  // Handle venue deletion
  const handleDeleteVenue = useCallback(async () => {
    if (!venueToDelete) return;
    await deleteVenueMutation.mutateAsync(venueToDelete.id);
    setVenueToDelete(null);
  }, [venueToDelete, deleteVenueMutation]);

  // Handle adding saved venue to event
  const handleAddSavedVenueToEvent = useCallback(
    async (venue: SavedVenue) => {
      const venueData: EventVenueCreateRequest = {
        place_id: venue.placeId,
      };
      await addVenueMutation.mutateAsync(venueData);
      unsaveVenue(venue.placeId);
      setViewMode("list");
    },
    [addVenueMutation, unsaveVenue]
  );

  // Handle toggling save on a search result
  const handleToggleSaveVenue = useCallback(
    (venue: VenueSearchResult) => {
      if (isSaved(venue.place_id)) {
        unsaveVenue(venue.place_id);
      } else {
        saveVenue(venue);
      }
    },
    [isSaved, unsaveVenue, saveVenue]
  );

  // Map markers for all venues
  const mapVenues = venues.map((venue) => ({
    id: venue.id,
    name: venue.name,
    latitude: venue.latitude,
    longitude: venue.longitude,
    address: venue.address,
    rating: venue.rating || undefined,
  }));

  // Loading state
  if (isLoading) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center py-12",
          className
        )}
      >
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-2 text-sm text-muted-foreground">Loading venues...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center py-12",
          className
        )}
      >
        <AlertCircle className="h-8 w-8 text-destructive" />
        <p className="mt-2 text-sm text-destructive">Failed to load venues</p>
        <Button
          variant="outline"
          size="sm"
          className="mt-4"
          onClick={() => window.location.reload()}
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header with action buttons */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            Event Venues
          </h3>
          <p className="text-sm text-muted-foreground">
            {venues.length === 0
              ? "No venues added yet"
              : `${venues.length} venue${venues.length === 1 ? "" : "s"} added`}
          </p>
        </div>

        <div className="flex gap-2">
          {viewMode === "list" ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode("manual")}
              >
                <Building2 className="mr-2 h-4 w-4" />
                Add Manually
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => setViewMode("search")}
              >
                <Search className="mr-2 h-4 w-4" />
                Search Venues
              </Button>
            </>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode("list")}
            >
              Back to List
            </Button>
          )}
        </div>
      </div>

      {/* Search Mode */}
      {viewMode === "search" && (
        <div className="space-y-4">
          {/* Search / Saved Sub-tabs */}
          <div className="flex items-center gap-4 border-b">
            <button
              onClick={() => setSearchSubTab("search")}
              className={cn(
                "relative pb-3 text-sm font-medium transition-colors",
                searchSubTab === "search"
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Search className="mr-2 inline-block h-4 w-4" />
              Search
              {searchSubTab === "search" && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
            <button
              onClick={() => setSearchSubTab("saved")}
              className={cn(
                "relative pb-3 text-sm font-medium transition-colors",
                searchSubTab === "saved"
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Bookmark className="mr-2 inline-block h-4 w-4" />
              Saved
              {savedVenues.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {savedVenues.length}
                </Badge>
              )}
              {searchSubTab === "saved" && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
          </div>

          {/* Search Sub-tab Content */}
          {searchSubTab === "search" && (
            <VenueSearchWithMap
              onVenueSelect={handleVenueSelect}
              eventId={eventId}
              isSaved={isSaved}
              onToggleSave={handleToggleSaveVenue}
            />
          )}

          {/* Saved Sub-tab Content */}
          {searchSubTab === "saved" && (
            <SavedVenuesList
              savedVenues={savedVenues}
              onAddToEvent={handleAddSavedVenueToEvent}
              onRemove={unsaveVenue}
              onViewDetails={setDetailsPlaceId}
              onClearAll={clearSavedVenues}
              isLoading={isSavedLoading}
            />
          )}

          {/* Venue Details Modal */}
          {detailsPlaceId && (
            <VenueDetails
              placeId={detailsPlaceId}
              isOpen={!!detailsPlaceId}
              onClose={() => setDetailsPlaceId(null)}
              onSelect={handleVenueSelect}
            />
          )}
        </div>
      )}

      {/* Manual Entry Mode */}
      {viewMode === "manual" && (
        <ManualVenueForm
          onSubmit={handleManualVenueSubmit}
          onCancel={() => setViewMode("list")}
          isLoading={addVenueMutation.isPending}
        />
      )}

      {/* List Mode - Show saved venues */}
      {viewMode === "list" && (
        <>
          {/* Map showing all venues */}
          {venues.length > 0 && (
            <Card>
              <CardContent className="p-0">
                <VenueMap
                  venues={mapVenues}
                  selectedVenueId={selectedVenueId || undefined}
                  onVenueSelect={setSelectedVenueId}
                  height="300px"
                  showInfoWindows={true}
                />
              </CardContent>
            </Card>
          )}

          {/* Venue list */}
          {venues.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <MapPin className="h-12 w-12 text-muted-foreground/50" />
                <h4 className="mt-4 text-lg font-semibold text-foreground">
                  No Venues Added
                </h4>
                <p className="mt-2 text-sm text-muted-foreground text-center max-w-sm">
                  Search for venues using Google Places or add a venue manually.
                </p>
                <div className="mt-6 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setViewMode("manual")}
                  >
                    <Building2 className="mr-2 h-4 w-4" />
                    Add Manually
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => setViewMode("search")}
                  >
                    <Search className="mr-2 h-4 w-4" />
                    Search Venues
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {venues.map((venue, index) => (
                <EventVenueCard
                  key={venue.id}
                  venue={venue}
                  index={index}
                  isSelected={selectedVenueId === venue.id}
                  onSelect={() => setSelectedVenueId(venue.id)}
                  onDelete={() => setVenueToDelete(venue)}
                  onViewDetails={
                    venue.google_place_id
                      ? () => setDetailsPlaceId(venue.google_place_id!)
                      : undefined
                  }
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* View Details Modal (for saved venues with place_id) */}
      {viewMode === "list" && detailsPlaceId && (
        <VenueDetails
          placeId={detailsPlaceId}
          isOpen={!!detailsPlaceId}
          onClose={() => setDetailsPlaceId(null)}
        />
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        open={!!venueToDelete}
        onClose={() => setVenueToDelete(null)}
        title="Remove Venue"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Are you sure you want to remove{" "}
            <span className="font-semibold text-foreground">
              {venueToDelete?.name}
            </span>{" "}
            from this event?
          </p>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setVenueToDelete(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteVenue}
              disabled={deleteVenueMutation.isPending}
            >
              {deleteVenueMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Removing...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Remove
                </>
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// Sub-component for displaying saved event venues
interface EventVenueCardProps {
  venue: EventVenue;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onViewDetails?: () => void;
}

function EventVenueCard({
  venue,
  index,
  isSelected,
  onSelect,
  onDelete,
  onViewDetails,
}: EventVenueCardProps) {
  return (
    <Card
      className={cn(
        "cursor-pointer transition-colors",
        isSelected && "ring-2 ring-primary"
      )}
      onClick={onSelect}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Venue photo or placeholder */}
          <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
            {venue.photo_url ? (
              <img
                src={venue.photo_url}
                alt={venue.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <Building2 className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Venue info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-foreground truncate">
                    {venue.name}
                  </h4>
                  {venue.is_manual && (
                    <Badge variant="secondary" className="text-xs">
                      Manual
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground truncate">
                  {venue.address}
                </p>
              </div>
              <Badge variant="outline" className="flex-shrink-0">
                #{index + 1}
              </Badge>
            </div>

            {/* Rating and price */}
            <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
              {venue.rating && (
                <span className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  {venue.rating.toFixed(1)}
                </span>
              )}
              {venue.price_level !== undefined &&
                venue.price_level !== null && (
                  <span>{"$".repeat(venue.price_level || 1)}</span>
                )}
            </div>

            {/* Contact links */}
            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
              {venue.phone && (
                <a
                  href={`tel:${venue.phone}`}
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-1 text-primary hover:underline"
                >
                  <Phone className="h-3 w-3" />
                  {venue.phone}
                </a>
              )}
              {venue.website && (
                <a
                  href={venue.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-1 text-primary hover:underline"
                >
                  <Globe className="h-3 w-3" />
                  Website
                </a>
              )}
            </div>

            {/* Notes */}
            {venue.notes && (
              <div className="mt-2 flex items-start gap-1 text-sm text-muted-foreground">
                <FileText className="h-3 w-3 mt-0.5 flex-shrink-0" />
                <span className="line-clamp-2">{venue.notes}</span>
              </div>
            )}

            {/* Actions */}
            <div className="mt-3 flex items-center gap-2">
              {onViewDetails && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewDetails();
                  }}
                >
                  <ExternalLink className="mr-1 h-3 w-3" />
                  Details
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
              >
                <Trash2 className="mr-1 h-3 w-3" />
                Remove
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
