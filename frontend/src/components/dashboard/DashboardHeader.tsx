"use client";

import { format } from "date-fns";
import { LogOut, Calendar } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { UserProfileResponse } from "@/types/auth.types";
import { MobileNavToggle, SidebarToggle } from "@/components/layout/Navigation";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { cn } from "@/lib/utils";

interface DashboardHeaderProps {
  user: UserProfileResponse;
  onSignOut: () => void;
  className?: string;
  showBreadcrumbs?: boolean;
}

function getGreeting(): string {
  const hour = new Date().getHours();

  if (hour < 12) {
    return "Good morning";
  } else if (hour < 17) {
    return "Good afternoon";
  } else {
    return "Good evening";
  }
}

/**
 * FR-6: RSVP Submission
 * Phase 5: RSVP & Email Systems -
 * 5.1.2: RSVP Frontend Portal
 *  **/

export function DashboardHeader({
  user,
  onSignOut,
  className,
  showBreadcrumbs = true,
}: DashboardHeaderProps) {
  const greeting = getGreeting();
  const currentDate = format(new Date(), "EEEE, MMMM do, yyyy");

  return (
    <div
      className={cn(
        "bg-card border-b border-border transition-colors duration-200",
        className
      )}
    >
      <div className="max-w-7xl mx-auto">
        {/* Main Header */}
        <div className="flex items-center justify-between h-16 px-6">
          {/* Navigation Controls */}
          <div className="flex items-center gap-4">
            <MobileNavToggle />
            <SidebarToggle />

            {/* Title on mobile/compact view */}
            <div className="lg:hidden">
              <h1 className="text-lg font-semibold text-foreground">
                {greeting}, {(user.name || user.email || "User").split(" ")[0]}!
              </h1>
            </div>
          </div>

          {/* User Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Theme Toggle */}
            <ThemeToggle variant="dropdown" className="hidden sm:block" />

            {/* User Badge */}
            <div className="hidden sm:flex items-center gap-3 px-3 py-1.5 bg-muted rounded-lg transition-colors duration-200">
              <div className="w-7 h-7 bg-primary rounded-full flex items-center justify-center">
                <span className="text-primary-foreground text-xs font-medium">
                  {user.name
                    ? user.name.charAt(0).toUpperCase()
                    : user.email
                    ? user.email.charAt(0).toUpperCase()
                    : "?"}
                </span>
              </div>
              <div className="text-sm">
                <p className="font-medium text-foreground">
                  {user.name || user.email || "User"}
                </p>
                <p className="text-muted-foreground hidden md:block">
                  {user.email}
                </p>
              </div>
            </div>

            {/* Mobile Theme Toggle */}
            <ThemeToggle className="sm:hidden" />

            {/* Sign Out Button */}
            <Button
              variant="outline"
              onClick={onSignOut}
              className="gap-2 min-h-[44px] min-w-[44px]"
              size="sm"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>

        {/* Extended Header Section */}
        <div className="px-6 pb-6 pt-2">
          <div className="flex flex-col gap-4">
            {/* Breadcrumbs */}
            {showBreadcrumbs && (
              <div className="order-1">
                <Breadcrumb />
              </div>
            )}

            {/* Greeting and Date - Desktop */}
            <div className="hidden lg:block order-2">
              <h1 className="text-2xl font-bold text-foreground">
                {greeting}, {user.name || user.email || "User"}!
              </h1>
              <div className="flex items-center gap-2 mt-1 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <p className="text-sm">{currentDate}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Optional: User verification status */}
        {!user.email_verified && (
          <div className="px-6 pb-4">
            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-amber-400 dark:bg-amber-500 rounded-full" />
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  Please verify your email address to access all features.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
