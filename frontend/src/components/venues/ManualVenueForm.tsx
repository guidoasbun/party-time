/**
 * FR-8: The system shall provide a venue search interface.
 * Phase 7.1.1: Google Places API Integration
 * ManualVenueForm Component (Phase 7.1.1: Google Places API Integration)
 *
 * Form for manually entering venue information:
 * - Required fields: name, address, coordinates
 * - Optional fields: phone, website, notes
 * - Address geocoding with Google Geocoding API
 * - Form validation with Zod
 * - Integration with event venue creation
 */
"use client";

import * as React from "react";
import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { VenueMap } from "./VenueMap";
import { EventVenueCreateRequest } from "@/types/venue.types";
import {
  Loader2,
  MapPin,
  Building2,
  Phone,
  Globe,
  FileText,
  Search,
} from "lucide-react";

// Form validation schema
const manualVenueSchema = z.object({
  name: z
    .string()
    .min(1, "Venue name is required")
    .max(255, "Name must be 255 characters or less"),
  address: z
    .string()
    .min(1, "Address is required")
    .max(500, "Address must be 500 characters or less"),
  latitude: z
    .number({ message: "Latitude is required" })
    .min(-90, "Invalid latitude")
    .max(90, "Invalid latitude"),
  longitude: z
    .number({ message: "Longitude is required" })
    .min(-180, "Invalid longitude")
    .max(180, "Invalid longitude"),
  phone: z
    .string()
    .max(50, "Phone must be 50 characters or less")
    .optional()
    .or(z.literal("")),
  website: z
    .string()
    .url("Please enter a valid URL")
    .max(500, "URL must be 500 characters or less")
    .optional()
    .or(z.literal("")),
  notes: z
    .string()
    .max(2000, "Notes must be 2000 characters or less")
    .optional()
    .or(z.literal("")),
});

type ManualVenueFormData = z.infer<typeof manualVenueSchema>;

interface ManualVenueFormProps {
  onSubmit: (data: EventVenueCreateRequest) => void;
  onCancel?: () => void;
  isLoading?: boolean;
  className?: string;
}

export function ManualVenueForm({
  onSubmit,
  onCancel,
  isLoading = false,
  className,
}: ManualVenueFormProps) {
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [geocodeError, setGeocodeError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid },
  } = useForm<ManualVenueFormData>({
    resolver: zodResolver(manualVenueSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      address: "",
      phone: "",
      website: "",
      notes: "",
    },
  });

  // Watch latitude and longitude for map display
  const latitude = watch("latitude");
  const longitude = watch("longitude");
  const venueName = watch("name");

  // Geocode address using Google Geocoding API
  const geocodeAddress = useCallback(async () => {
    const address = watch("address");
    if (!address.trim()) {
      setGeocodeError("Please enter an address first");
      return;
    }

    setIsGeocoding(true);
    setGeocodeError(null);

    try {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
      if (!apiKey) {
        setGeocodeError("Google Maps API key not configured");
        return;
      }

      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          address
        )}&key=${apiKey}`
      );

      const data = await response.json();

      if (data.status === "OK" && data.results.length > 0) {
        const location = data.results[0].geometry.location;
        setValue("latitude", location.lat, { shouldValidate: true });
        setValue("longitude", location.lng, { shouldValidate: true });
        // Update address with formatted version if different
        if (data.results[0].formatted_address) {
          setValue("address", data.results[0].formatted_address);
        }
      } else if (data.status === "ZERO_RESULTS") {
        setGeocodeError(
          "Address not found. Please try a more specific address."
        );
      } else {
        setGeocodeError(`Geocoding failed: ${data.status}`);
      }
    } catch (error) {
      console.error("Geocoding error:", error);
      setGeocodeError("Failed to geocode address. Please try again.");
    } finally {
      setIsGeocoding(false);
    }
  }, [watch, setValue]);

  // Handle form submission
  const handleFormSubmit = (data: ManualVenueFormData) => {
    const venueData: EventVenueCreateRequest = {
      name: data.name,
      address: data.address,
      latitude: data.latitude,
      longitude: data.longitude,
      phone: data.phone || undefined,
      website: data.website || undefined,
      notes: data.notes || undefined,
    };
    onSubmit(venueData);
  };

  // Map marker for preview
  const mapVenues =
    latitude && longitude
      ? [
          {
            id: "preview",
            name: venueName || "New Venue",
            latitude,
            longitude,
          },
        ]
      : [];

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className={cn("space-y-6", className)}
    >
      {/* Basic Information */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-base">
            <Building2 className="h-4 w-4" />
            Venue Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Venue Name */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Venue Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              placeholder="e.g., Grand Ballroom at The Plaza"
              {...register("name")}
              disabled={isLoading}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Address with Geocode */}
          <div className="space-y-2">
            <Label htmlFor="address">
              Address <span className="text-destructive">*</span>
            </Label>
            <div className="flex gap-2">
              <Input
                id="address"
                placeholder="e.g., 768 5th Ave, New York, NY 10019"
                className="flex-1"
                {...register("address")}
                disabled={isLoading}
              />
              <Button
                type="button"
                variant="outline"
                onClick={geocodeAddress}
                disabled={isLoading || isGeocoding}
              >
                {isGeocoding ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>
            {errors.address && (
              <p className="text-sm text-destructive">
                {errors.address.message}
              </p>
            )}
            {geocodeError && (
              <p className="text-sm text-destructive">{geocodeError}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Enter the address and click the search button to get coordinates
            </p>
          </div>

          {/* Coordinates (read-only, populated by geocoding) */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="latitude">
                Latitude <span className="text-destructive">*</span>
              </Label>
              <Input
                id="latitude"
                type="number"
                step="any"
                placeholder="e.g., 40.7649"
                {...register("latitude", { valueAsNumber: true })}
                disabled={isLoading}
              />
              {errors.latitude && (
                <p className="text-sm text-destructive">
                  {errors.latitude.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="longitude">
                Longitude <span className="text-destructive">*</span>
              </Label>
              <Input
                id="longitude"
                type="number"
                step="any"
                placeholder="e.g., -73.9748"
                {...register("longitude", { valueAsNumber: true })}
                disabled={isLoading}
              />
              {errors.longitude && (
                <p className="text-sm text-destructive">
                  {errors.longitude.message}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Map Preview */}
      {mapVenues.length > 0 && (
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <MapPin className="h-4 w-4" />
              Location Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <VenueMap venues={mapVenues} height="200px" zoom={15} />
          </CardContent>
        </Card>
      )}

      {/* Contact Information */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-base">
            <Phone className="h-4 w-4" />
            Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="e.g., (212) 555-1234"
                {...register("phone")}
                disabled={isLoading}
              />
              {errors.phone && (
                <p className="text-sm text-destructive">
                  {errors.phone.message}
                </p>
              )}
            </div>

            {/* Website */}
            <div className="space-y-2">
              <Label htmlFor="website" className="flex items-center gap-1">
                <Globe className="h-3 w-3" />
                Website
              </Label>
              <Input
                id="website"
                type="url"
                placeholder="e.g., https://theplazany.com"
                {...register("website")}
                disabled={isLoading}
              />
              {errors.website && (
                <p className="text-sm text-destructive">
                  {errors.website.message}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="h-4 w-4" />
            Additional Notes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Textarea
              id="notes"
              placeholder="Any additional notes about the venue (parking, accessibility, etc.)"
              rows={4}
              {...register("notes")}
              disabled={isLoading}
            />
            {errors.notes && (
              <p className="text-sm text-destructive">{errors.notes.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              {watch("notes")?.length || 0} / 2000 characters
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex justify-end gap-3">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isLoading || !isValid}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Adding Venue...
            </>
          ) : (
            <>
              <MapPin className="mr-2 h-4 w-4" />
              Add Venue
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
