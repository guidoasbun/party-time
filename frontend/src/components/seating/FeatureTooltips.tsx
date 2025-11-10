/**
 * FeatureTooltips Component
 * FR-21: The system shall provide an interactive seating chart interface.
 * Phase 6.2.5: Seating Chart Polish & Integration
 * Contextual onboarding hints and tooltips for first-time users
 */

"use client";

import React, { useState, useEffect } from "react";
import { X, Lightbulb, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "seating-chart-hints-dismissed";

interface FeatureTip {
  id: string;
  title: string;
  description: string;
  icon?: React.ReactNode;
}

const featureTips: FeatureTip[] = [
  {
    id: "drag-drop",
    title: "Drag & Drop Guests",
    description:
      "Simply drag guests from the sidebar and drop them onto tables to assign seats.",
  },
  {
    id: "smart-seating",
    title: "Smart Seating",
    description:
      "Use the Smart Assign feature to automatically seat guests based on dietary restrictions, relationships, and preferences.",
  },
  {
    id: "floor-plan",
    title: "Upload Floor Plan",
    description:
      "Add a venue floor plan to visualize your space and plan table placement more effectively.",
  },
  {
    id: "export",
    title: "Export Options",
    description:
      "Export your seating chart as PDF, image, or CSV for printing and sharing.",
  },
  {
    id: "keyboard",
    title: "Keyboard Shortcuts",
    description:
      "Press ? to view all available keyboard shortcuts for faster editing.",
  },
];

interface FeatureTooltipsProps {
  className?: string;
}

/**
 * Onboarding tips banner for first-time users
 */
export function FeatureTooltips({ className }: FeatureTooltipsProps) {
  const [dismissed, setDismissed] = useState(true);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);

  // Check if hints were previously dismissed
  useEffect(() => {
    if (typeof window !== "undefined") {
      const isDismissed = localStorage.getItem(STORAGE_KEY);
      setDismissed(isDismissed === "true");
    }
  }, []);

  // Handle dismiss
  const handleDismiss = () => {
    setDismissed(true);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, "true");
    }
  };

  // Handle next tip
  const handleNext = () => {
    if (currentTipIndex < featureTips.length - 1) {
      setCurrentTipIndex((prev) => prev + 1);
    } else {
      handleDismiss();
    }
  };

  // Handle previous tip
  const handlePrevious = () => {
    if (currentTipIndex > 0) {
      setCurrentTipIndex((prev) => prev - 1);
    }
  };

  // Don't render if dismissed
  if (dismissed) {
    return null;
  }

  const currentTip = featureTips[currentTipIndex];
  const isLastTip = currentTipIndex === featureTips.length - 1;

  return (
    <Card
      className={cn(
        "border-primary/20 bg-primary/5 dark:bg-primary/10",
        className
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">
              First time here? Quick tips to get started
            </CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 -mt-1 p-0"
            onClick={handleDismiss}
            aria-label="Dismiss tips"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Tip */}
        <div className="space-y-2">
          <h4 className="font-semibold text-sm">{currentTip.title}</h4>
          <CardDescription className="text-sm">
            {currentTip.description}
          </CardDescription>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between gap-4 pt-2">
          {/* Progress Dots */}
          <div className="flex items-center gap-1.5">
            {featureTips.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentTipIndex(index)}
                className={cn(
                  "h-2 w-2 rounded-full transition-all",
                  index === currentTipIndex
                    ? "bg-primary w-4"
                    : "bg-primary/30 hover:bg-primary/50"
                )}
                aria-label={`Go to tip ${index + 1}`}
              />
            ))}
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-2">
            {currentTipIndex > 0 && (
              <Button variant="outline" size="sm" onClick={handlePrevious}>
                Previous
              </Button>
            )}
            <Button variant="default" size="sm" onClick={handleNext}>
              {isLastTip ? (
                "Got it"
              ) : (
                <>
                  Next <ChevronRight className="ml-1 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Tip Counter */}
        <p className="text-xs text-center text-muted-foreground">
          Tip {currentTipIndex + 1} of {featureTips.length}
        </p>
      </CardContent>
    </Card>
  );
}

/**
 * Reset onboarding hints (for testing or user request)
 */
export function resetFeatureHints() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEY);
  }
}

/**
 * Check if feature hints have been dismissed
 */
export function areFeatureHintsDismissed(): boolean {
  if (typeof window !== "undefined") {
    return localStorage.getItem(STORAGE_KEY) === "true";
  }
  return false;
}
