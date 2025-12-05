/**
 * FR-8: The system shall provide a venue search interface.
 * Phase 7.1.1: Google Places API Integration
 * Phase 9.1: Performance Optimization - Updated to use next/image
 * VenuePhotoGallery Component
 *
 * Photo gallery with lightbox for venue photos:
 * - Responsive grid layout with optimized images (WebP/AVIF)
 * - Lightbox modal for full-size viewing
 * - Keyboard navigation (arrow keys, escape)
 * - Touch-friendly on mobile
 * - Attribution display for Google Photos
 */
"use client";

import * as React from "react";
import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { VenuePhoto } from "@/types/venue.types";
import {
  ChevronLeft,
  ChevronRight,
  X,
  Maximize2,
  Image as ImageIcon,
} from "lucide-react";

interface VenuePhotoGalleryProps {
  photos: VenuePhoto[];
  className?: string;
  maxThumbnails?: number;
}

export function VenuePhotoGallery({
  photos,
  className,
  maxThumbnails = 5,
}: VenuePhotoGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageError, setImageError] = useState<Record<number, boolean>>({});

  // Open lightbox at specific index
  const openLightbox = useCallback((index: number) => {
    setCurrentIndex(index);
    setLightboxOpen(true);
    // Prevent body scroll when lightbox is open
    document.body.style.overflow = "hidden";
  }, []);

  // Close lightbox
  const closeLightbox = useCallback(() => {
    setLightboxOpen(false);
    document.body.style.overflow = "";
  }, []);

  // Navigate to previous photo
  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
  }, [photos.length]);

  // Navigate to next photo
  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1));
  }, [photos.length]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!lightboxOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape":
          closeLightbox();
          break;
        case "ArrowLeft":
          goToPrevious();
          break;
        case "ArrowRight":
          goToNext();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxOpen, closeLightbox, goToPrevious, goToNext]);

  // Handle image load error
  const handleImageError = (index: number) => {
    setImageError((prev) => ({ ...prev, [index]: true }));
  };

  if (photos.length === 0) {
    return (
      <div
        className={cn(
          "flex h-48 items-center justify-center rounded-lg bg-muted",
          className
        )}
      >
        <div className="text-center text-muted-foreground">
          <ImageIcon className="mx-auto h-12 w-12 opacity-50" />
          <p className="mt-2 text-sm">No photos available</p>
        </div>
      </div>
    );
  }

  // Display photos
  const displayPhotos = photos.slice(0, maxThumbnails);
  const remainingCount = photos.length - maxThumbnails;

  return (
    <>
      {/* Thumbnail Grid */}
      <div className={cn("space-y-2", className)}>
        <div
          className={cn(
            "grid gap-2",
            displayPhotos.length === 1
              ? "grid-cols-1"
              : displayPhotos.length === 2
              ? "grid-cols-2"
              : "grid-cols-2 sm:grid-cols-3"
          )}
        >
          {displayPhotos.map((photo, index) => (
            <button
              key={index}
              onClick={() => openLightbox(index)}
              className={cn(
                "group relative overflow-hidden rounded-lg bg-muted",
                "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                "transition-transform hover:scale-[1.02]",
                index === 0 &&
                  displayPhotos.length > 2 &&
                  "col-span-2 row-span-2"
              )}
              style={{
                aspectRatio:
                  index === 0 && displayPhotos.length > 2 ? "16/9" : "4/3",
              }}
            >
              {imageError[index] ? (
                <div className="flex h-full w-full items-center justify-center bg-muted">
                  <ImageIcon className="h-8 w-8 text-muted-foreground" />
                </div>
              ) : (
                <Image
                  src={photo.url}
                  alt={`Venue photo ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes={
                    index === 0 && displayPhotos.length > 2
                      ? "(max-width: 768px) 100vw, 66vw"
                      : "(max-width: 768px) 50vw, 33vw"
                  }
                  onError={() => handleImageError(index)}
                  priority={index === 0}
                />
              )}

              {/* Expand icon overlay */}
              <div
                className={cn(
                  "absolute inset-0 flex items-center justify-center",
                  "bg-black/0 opacity-0 transition-all",
                  "group-hover:bg-black/30 group-hover:opacity-100"
                )}
              >
                <Maximize2 className="h-6 w-6 text-white" />
              </div>

              {/* "More photos" overlay on last thumbnail */}
              {index === maxThumbnails - 1 && remainingCount > 0 && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                  <span className="text-lg font-semibold text-white">
                    +{remainingCount} more
                  </span>
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Photo count indicator */}
        {photos.length > 1 && (
          <p className="text-xs text-muted-foreground">
            {photos.length} photos available
          </p>
        )}
      </div>

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          onClick={closeLightbox}
          role="dialog"
          aria-modal="true"
          aria-label="Photo lightbox"
        >
          {/* Close button */}
          <button
            onClick={closeLightbox}
            className={cn(
              "absolute right-4 top-4 z-10 rounded-full p-2",
              "bg-black/50 text-white transition-colors hover:bg-black/70",
              "focus:outline-none focus:ring-2 focus:ring-white"
            )}
            aria-label="Close lightbox"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Navigation buttons */}
          {photos.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goToPrevious();
                }}
                className={cn(
                  "absolute left-4 z-10 rounded-full p-2",
                  "bg-black/50 text-white transition-colors hover:bg-black/70",
                  "focus:outline-none focus:ring-2 focus:ring-white"
                )}
                aria-label="Previous photo"
              >
                <ChevronLeft className="h-8 w-8" />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goToNext();
                }}
                className={cn(
                  "absolute right-4 z-10 rounded-full p-2",
                  "bg-black/50 text-white transition-colors hover:bg-black/70",
                  "focus:outline-none focus:ring-2 focus:ring-white"
                )}
                aria-label="Next photo"
              >
                <ChevronRight className="h-8 w-8" />
              </button>
            </>
          )}

          {/* Main image */}
          <div
            className="relative max-h-[90vh] max-w-[90vw]"
            onClick={(e) => e.stopPropagation()}
          >
            {imageError[currentIndex] ? (
              <div className="flex h-96 w-96 items-center justify-center rounded-lg bg-muted">
                <ImageIcon className="h-16 w-16 text-muted-foreground" />
              </div>
            ) : (
              <div className="relative" style={{ width: "85vw", height: "80vh" }}>
                <Image
                  src={photos[currentIndex].url}
                  alt={`Venue photo ${currentIndex + 1}`}
                  fill
                  className="rounded-lg object-contain"
                  sizes="85vw"
                  priority
                  onError={() => handleImageError(currentIndex)}
                />
              </div>
            )}

            {/* Photo counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/70 px-4 py-2">
              <span className="text-sm font-medium text-white">
                {currentIndex + 1} / {photos.length}
              </span>
            </div>

            {/* Attribution */}
            {photos[currentIndex].attributions.length > 0 && (
              <div className="absolute bottom-4 right-4 max-w-xs">
                <p className="text-xs text-white/70">
                  Photo by: {photos[currentIndex].attributions.join(", ")}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
