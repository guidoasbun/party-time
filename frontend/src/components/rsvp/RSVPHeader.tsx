/**
 * FR-6: The system shall display an RSVP submission page 5.1.2
 * FR-6: RSVP Submission
 * Phase 5: RSVP & Email Systems -
 * 5.1.2: RSVP Frontend Portal
 *
 * Header component for public RSVP pages with theme toggle and login
 */

"use client";

import * as React from "react";
import { useRouter, useParams } from "next/navigation";
import { LogIn } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { cn } from "@/lib/utils";

interface RSVPHeaderProps {
  className?: string;
}

export function RSVPHeader({ className }: RSVPHeaderProps) {
  const router = useRouter();
  const params = useParams();
  const token = params?.token as string;

  const handleSignIn = () => {
    // Redirect to sign in page, optionally preserving RSVP token
    if (token) {
      router.push(`/auth/signin?redirect=/rsvp/${token}`);
    } else {
      router.push("/auth/signin");
    }
  };

  return (
    <div
      className={cn(
        "bg-card border-b border-border transition-colors duration-200",
        className
      )}
    >
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Brand/Logo */}
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            aria-label="Go to homepage"
          >
            <span className="text-xl sm:text-2xl">🎉</span>
            <span className="text-lg sm:text-xl font-bold text-foreground">
              Party-Time
            </span>
          </button>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <ThemeToggle variant="dropdown" />

            {/* Sign In Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignIn}
              className="gap-2 min-h-[40px]"
            >
              <LogIn className="h-4 w-4" />
              <span className="hidden sm:inline">Sign In</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
