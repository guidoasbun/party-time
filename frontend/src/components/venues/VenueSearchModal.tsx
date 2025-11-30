/**
 * FR-8: The system shall provide a venue search interface.
 * Phase 7.1.2: Venue Search UI Enhancement
 * VenueSearchModal Component
 *
 * Modal wrapper for venue search, used in event creation form.
 * Allows users to search for and select a venue with all filters.
 */
"use client";

import * as React from "react";
import { useCallback } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { VenueSearch } from "./VenueSearch";
import { VenueDetails } from "./VenueDetails";
import { VenueSearchResult, VenueDetails as VenueDetailsType } from "@/types/venue.types";

interface VenueSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectVenue: (venue: VenueSearchResult | VenueDetailsType) => void;
}

export function VenueSearchModal({
  isOpen,
  onClose,
  onSelectVenue,
}: VenueSearchModalProps) {
  const [detailsPlaceId, setDetailsPlaceId] = React.useState<string | null>(null);

  // Handle venue click to show details
  const handleVenueClick = useCallback((venue: VenueSearchResult) => {
    setDetailsPlaceId(venue.place_id);
  }, []);

  // Handle venue selection from search results (quick select)
  const handleQuickSelect = useCallback((venue: VenueSearchResult) => {
    onSelectVenue(venue);
    onClose();
  }, [onSelectVenue, onClose]);

  // Handle venue selection from details modal
  const handleSelectFromDetails = useCallback((venue: VenueDetailsType) => {
    onSelectVenue(venue);
    setDetailsPlaceId(null);
    onClose();
  }, [onSelectVenue, onClose]);

  // Close details and return to search
  const handleCloseDetails = useCallback(() => {
    setDetailsPlaceId(null);
  }, []);

  // Reset state when modal closes
  React.useEffect(() => {
    if (!isOpen) {
      setDetailsPlaceId(null);
    }
  }, [isOpen]);

  return (
    <>
      <Modal
        open={isOpen}
        onClose={onClose}
        title="Search Venues"
        size="xl"
        className="max-h-[90vh]"
      >
        <div className="min-h-[500px]">
          <VenueSearch
            onVenueClick={handleVenueClick}
            onVenueSelect={handleQuickSelect}
            className="max-h-[calc(90vh-200px)] overflow-y-auto"
          />
        </div>
      </Modal>

      {/* Venue Details Modal (nested) */}
      {detailsPlaceId && (
        <VenueDetails
          placeId={detailsPlaceId}
          isOpen={!!detailsPlaceId}
          onClose={handleCloseDetails}
          onSelect={handleSelectFromDetails}
        />
      )}
    </>
  );
}
