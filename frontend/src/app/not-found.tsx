/**
 * Phase 9.2: 404 Not Found Page
 * Displayed when a user navigates to a page that doesn't exist
 */

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Home, ArrowLeft, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* 404 Icon/Number */}
        <div className="mb-8">
          <div className="text-9xl font-black text-muted-foreground/20 select-none">
            404
          </div>
        </div>

        {/* Error Message */}
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Page Not Found
        </h1>
        <p className="text-muted-foreground mb-8">
          Sorry, the page you're looking for doesn't exist or has been moved.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/dashboard">
            <Button className="w-full sm:w-auto gap-2">
              <Home className="h-4 w-4" />
              Go to Dashboard
            </Button>
          </Link>
          <Link href="/">
            <Button variant="outline" className="w-full sm:w-auto gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>

        {/* Help Link */}
        <div className="mt-8 pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground">
            Looking for something specific?{" "}
            <Link
              href="/events"
              className="text-primary hover:underline inline-flex items-center gap-1"
            >
              <Search className="h-3 w-3" />
              Browse Events
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
