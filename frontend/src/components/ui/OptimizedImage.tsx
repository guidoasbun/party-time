/**
 * Phase 9.1: Performance Optimization
 * OptimizedImage Component
 *
 * Wrapper for next/image with error handling, loading states, and fallbacks.
 * Use this for external images (Google Places photos, etc.)
 */
"use client";

import Image, { type ImageProps } from "next/image";
import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { ImageIcon } from "lucide-react";

interface OptimizedImageProps extends Omit<ImageProps, "onError" | "onLoad"> {
  /** Additional classes for the fallback container */
  fallbackClassName?: string;
  /** Show icon in fallback state (default: true) */
  showFallbackIcon?: boolean;
  /** Custom error callback */
  onImageError?: () => void;
  /** Custom load callback */
  onImageLoad?: () => void;
}

/**
 * OptimizedImage - A wrapper around next/image with error handling
 *
 * Features:
 * - Automatic loading skeleton
 * - Error fallback with icon
 * - Smooth fade-in transition
 * - Full TypeScript support
 *
 * @example
 * ```tsx
 * <OptimizedImage
 *   src={venuePhoto.url}
 *   alt="Venue"
 *   fill
 *   sizes="(max-width: 768px) 100vw, 50vw"
 *   className="object-cover"
 * />
 * ```
 */
export function OptimizedImage({
  src,
  alt,
  className,
  fallbackClassName,
  showFallbackIcon = true,
  onImageError,
  onImageLoad,
  ...props
}: OptimizedImageProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleError = useCallback(() => {
    setHasError(true);
    setIsLoading(false);
    onImageError?.();
  }, [onImageError]);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
    onImageLoad?.();
  }, [onImageLoad]);

  if (hasError) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-muted",
          fallbackClassName || className
        )}
        role="img"
        aria-label={`${alt} (failed to load)`}
      >
        {showFallbackIcon && (
          <ImageIcon className="h-8 w-8 text-muted-foreground" />
        )}
      </div>
    );
  }

  return (
    <>
      {isLoading && (
        <div
          className={cn(
            "absolute inset-0 animate-pulse bg-muted",
            fallbackClassName
          )}
          aria-hidden="true"
        />
      )}
      <Image
        src={src}
        alt={alt}
        className={cn(
          "transition-opacity duration-300",
          isLoading ? "opacity-0" : "opacity-100",
          className
        )}
        onError={handleError}
        onLoad={handleLoad}
        {...props}
      />
    </>
  );
}

/**
 * OptimizedImageWithContainer - Image with its own container for fill mode
 *
 * Use when you need a container with specific dimensions for fill mode.
 *
 * @example
 * ```tsx
 * <OptimizedImageWithContainer
 *   src={photo.url}
 *   alt="Photo"
 *   containerClassName="w-full h-64"
 *   sizes="100vw"
 * />
 * ```
 */
interface OptimizedImageWithContainerProps extends OptimizedImageProps {
  containerClassName?: string;
}

export function OptimizedImageWithContainer({
  containerClassName,
  ...props
}: OptimizedImageWithContainerProps) {
  return (
    <div className={cn("relative overflow-hidden", containerClassName)}>
      <OptimizedImage fill {...props} />
    </div>
  );
}

export default OptimizedImage;
