/**
 * FR-8: The system shall provide a venue search interface.
 * Phase 7.1.1: Google Places API Integration
 * VenueDetails Component (Phase 7.1.1: Google Places API Integration)
 *
 * Full venue information display with:
 * - Photo gallery
 * - Reviews section with star ratings
 * - Opening hours with current status
 * - Contact info (phone, website)
 * - Google Maps link
 * - "Select this venue" button
 */
"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { VenuePhotoGallery } from "./VenuePhotoGallery";
import { VenueMap } from "./VenueMap";
import {
  VenueDetails as VenueDetailsType,
  VenueSearchResult,
  PRICE_LEVEL_LABELS,
  getVenueTypeLabel,
} from "@/types/venue.types";
import { venueService } from "@/lib/api/services/venue.service";
import {
  Star,
  MapPin,
  Clock,
  Phone,
  Globe,
  ExternalLink,
  Loader2,
  AlertCircle,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface VenueDetailsProps {
  placeId: string;
  venue?: VenueSearchResult; // Optional initial data from search
  onSelect?: (venue: VenueDetailsType) => void;
  onClose?: () => void;
  isOpen?: boolean;
  className?: string;
}

export function VenueDetails({
  placeId,
  venue: initialVenue,
  onSelect,
  onClose,
  isOpen = true,
  className,
}: VenueDetailsProps) {
  const [venueDetails, setVenueDetails] = useState<VenueDetailsType | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [showAllHours, setShowAllHours] = useState(false);

  // Fetch venue details
  useEffect(() => {
    const fetchDetails = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const details = await venueService.getVenueDetails(placeId);
        setVenueDetails(details);
      } catch (err) {
        console.error("Failed to fetch venue details:", err);
        setError("Failed to load venue details. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    if (placeId && isOpen) {
      fetchDetails();
    }
  }, [placeId, isOpen]);

  const handleSelect = () => {
    if (venueDetails && onSelect) {
      onSelect(venueDetails);
    }
  };

  // Render star rating
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      stars.push(
        <Star
          key={i}
          className={cn(
            "h-4 w-4",
            i < fullStars
              ? "fill-amber-400 text-amber-400"
              : i === fullStars && hasHalfStar
              ? "fill-amber-400/50 text-amber-400"
              : "text-muted-foreground"
          )}
        />
      );
    }
    return stars;
  };

  // Get today's hours
  const getTodayHours = () => {
    if (!venueDetails?.opening_hours?.weekday_text) return null;
    const today = new Date().getDay();
    // Google returns Sunday as 0, but weekday_text starts with Monday
    const dayIndex = today === 0 ? 6 : today - 1;
    return venueDetails.opening_hours.weekday_text[dayIndex];
  };

  const content = (
    <div className={cn("space-y-6", className)}>
      {/* Loading State */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="mt-2 text-sm text-muted-foreground">
            Loading venue details...
          </p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="h-8 w-8 text-destructive" />
          <p className="mt-2 text-sm text-destructive">{error}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </div>
      )}

      {/* Venue Details */}
      {venueDetails && !isLoading && (
        <>
          {/* Photo Gallery */}
          {venueDetails.photos.length > 0 && (
            <VenuePhotoGallery photos={venueDetails.photos} />
          )}

          {/* Header */}
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-4">
              <h2 className="text-2xl font-bold text-foreground">
                {venueDetails.name}
              </h2>
              {venueDetails.price_level !== undefined &&
                venueDetails.price_level !== null && (
                  <Badge variant="secondary" className="text-lg">
                    {PRICE_LEVEL_LABELS[venueDetails.price_level]}
                  </Badge>
                )}
            </div>

            {/* Type badges */}
            <div className="flex flex-wrap gap-2">
              {venueDetails.types.slice(0, 3).map((type) => (
                <Badge key={type} variant="outline" className="text-xs">
                  {getVenueTypeLabel(type)}
                </Badge>
              ))}
            </div>

            {/* Rating */}
            {venueDetails.rating && (
              <div className="flex items-center gap-2">
                <div className="flex">{renderStars(venueDetails.rating)}</div>
                <span className="font-semibold">
                  {venueDetails.rating.toFixed(1)}
                </span>
                {venueDetails.user_ratings_total && (
                  <span className="text-muted-foreground">
                    ({venueDetails.user_ratings_total.toLocaleString()} reviews)
                  </span>
                )}
              </div>
            )}

            {/* Address */}
            <div className="flex items-start gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>{venueDetails.formatted_address}</span>
            </div>

            {/* Editorial Summary */}
            {venueDetails.editorial_summary && (
              <p className="text-sm text-muted-foreground italic">
                {venueDetails.editorial_summary}
              </p>
            )}
          </div>

          {/* Map */}
          <Card>
            <CardContent className="p-0">
              <VenueMap
                venues={[
                  {
                    id: venueDetails.place_id,
                    name: venueDetails.name,
                    latitude: venueDetails.location.latitude,
                    longitude: venueDetails.location.longitude,
                  },
                ]}
                height="200px"
                zoom={15}
              />
            </CardContent>
          </Card>

          {/* Contact & Hours */}
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Contact Info */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {venueDetails.phone && (
                  <a
                    href={`tel:${venueDetails.phone}`}
                    className="flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    <Phone className="h-4 w-4" />
                    {venueDetails.phone}
                  </a>
                )}
                {venueDetails.website && (
                  <a
                    href={venueDetails.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    <Globe className="h-4 w-4" />
                    Visit Website
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
                {venueDetails.url && (
                  <a
                    href={venueDetails.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    <MapPin className="h-4 w-4" />
                    View on Google Maps
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </CardContent>
            </Card>

            {/* Opening Hours */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center justify-between">
                  <span>Hours</span>
                  {venueDetails.opening_hours?.open_now !== undefined && (
                    <Badge
                      variant={
                        venueDetails.opening_hours.open_now
                          ? "default"
                          : "destructive"
                      }
                      className="text-xs"
                    >
                      {venueDetails.opening_hours.open_now
                        ? "Open Now"
                        : "Closed"}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {venueDetails.opening_hours?.weekday_text ? (
                  <div className="space-y-1 text-sm">
                    {/* Today's hours highlighted */}
                    {getTodayHours() && (
                      <p className="font-medium text-primary">
                        <Clock className="mr-1 inline-block h-3 w-3" />
                        Today: {getTodayHours()?.split(": ")[1]}
                      </p>
                    )}
                    {/* All hours (collapsible) */}
                    {showAllHours && (
                      <div className="mt-2 space-y-1 border-t pt-2">
                        {venueDetails.opening_hours.weekday_text.map(
                          (text, i) => (
                            <p
                              key={i}
                              className="text-xs text-muted-foreground"
                            >
                              {text}
                            </p>
                          )
                        )}
                      </div>
                    )}
                    <button
                      onClick={() => setShowAllHours(!showAllHours)}
                      className="mt-2 flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                      {showAllHours ? (
                        <>
                          <ChevronUp className="h-3 w-3" />
                          Show less
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-3 w-3" />
                          Show all hours
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Hours not available
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Reviews */}
          {venueDetails.reviews.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Reviews</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {venueDetails.reviews
                  .slice(0, showAllReviews ? undefined : 2)
                  .map((review, index) => (
                    <div
                      key={index}
                      className="border-b border-border pb-4 last:border-0 last:pb-0"
                    >
                      <div className="flex items-center gap-2">
                        <div className="flex">{renderStars(review.rating)}</div>
                        <span className="text-sm font-medium">
                          {review.author_name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {review.relative_time_description}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground line-clamp-3">
                        {review.text}
                      </p>
                    </div>
                  ))}
                {venueDetails.reviews.length > 2 && (
                  <button
                    onClick={() => setShowAllReviews(!showAllReviews)}
                    className="flex items-center gap-1 text-sm text-primary hover:underline"
                  >
                    {showAllReviews ? (
                      <>
                        <ChevronUp className="h-4 w-4" />
                        Show fewer reviews
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4" />
                        Show all {venueDetails.reviews.length} reviews
                      </>
                    )}
                  </button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Select Button */}
          {onSelect && (
            <div className="sticky bottom-0 bg-background pt-4 pb-2 border-t">
              <Button onClick={handleSelect} className="w-full" size="lg">
                Select This Venue
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );

  // If onClose provided, render in modal
  if (onClose) {
    return (
      <Modal
        open={isOpen}
        onClose={onClose}
        title={initialVenue?.name || "Venue Details"}
        size="lg"
      >
        {content}
      </Modal>
    );
  }

  return content;
}
