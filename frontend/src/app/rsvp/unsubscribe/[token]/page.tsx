/**
 * FR-7: Email Automation
 * Phase 5.2.4: Automated Email Flows - Unsubscribe Page
 *
 * Public unsubscribe page - no authentication required
 * Allows guests to unsubscribe from event emails via link in email footer
 */

"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { AlertCircle, CheckCircle, Loader2, Mail, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";
import { RSVPHeader } from "@/components/rsvp/RSVPHeader";
import {
  getUnsubscribePageInfo,
  confirmUnsubscribe,
} from "@/lib/api/services/rsvp.service";
import type {
  UnsubscribePageInfo,
  UnsubscribeResponse,
} from "@/types/rsvp.types";

type PageState =
  | "loading"
  | "confirmation"
  | "already-unsubscribed"
  | "processing"
  | "success"
  | "error";

export default function UnsubscribePage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [pageState, setPageState] = React.useState<PageState>("loading");
  const [pageInfo, setPageInfo] = React.useState<UnsubscribePageInfo | null>(null);
  const [unsubscribeResponse, setUnsubscribeResponse] = React.useState<UnsubscribeResponse | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  // Load page information on mount
  React.useEffect(() => {
    const loadPageInfo = async () => {
      try {
        setPageState("loading");
        const data = await getUnsubscribePageInfo(token);
        setPageInfo(data);

        // Check if already unsubscribed
        if (data.is_unsubscribed) {
          setPageState("already-unsubscribed");
        } else {
          setPageState("confirmation");
        }
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load page information";
        setError(errorMessage);
        setPageState("error");
      }
    };

    if (token) {
      loadPageInfo();
    }
  }, [token]);

  // Handle unsubscribe confirmation
  const handleConfirmUnsubscribe = async () => {
    try {
      setPageState("processing");
      const response = await confirmUnsubscribe(token, true);
      setUnsubscribeResponse(response);
      setPageState("success");
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to unsubscribe";
      setError(errorMessage);
      setPageState("error");
    }
  };

  // Handle cancel
  const handleCancel = () => {
    router.push("/");
  };

  // Handle retry
  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-background">
      <RSVPHeader />

      <main className="container mx-auto px-4 py-8 md:py-12">
        <div className="mx-auto max-w-2xl">
          {/* Loading State */}
          {pageState === "loading" && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="mt-4 text-muted-foreground">Loading...</p>
              </CardContent>
            </Card>
          )}

          {/* Confirmation State */}
          {pageState === "confirmation" && pageInfo && (
            <Card>
              <CardHeader>
                <CardTitle className="text-center">
                  Unsubscribe from Event Emails
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Guest Information */}
                <div className="rounded-lg border bg-muted/50 p-4">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <span className="text-sm font-medium text-muted-foreground">
                        Guest:
                      </span>
                      <span className="text-sm font-semibold">
                        {pageInfo.guest_name}
                      </span>
                    </div>
                    <div className="flex items-start justify-between">
                      <span className="text-sm font-medium text-muted-foreground">
                        Event:
                      </span>
                      <span className="text-sm font-semibold">
                        {pageInfo.event_name}
                      </span>
                    </div>
                    <div className="flex items-start justify-between">
                      <span className="text-sm font-medium text-muted-foreground">
                        Email:
                      </span>
                      <span className="text-sm">{pageInfo.email}</span>
                    </div>
                  </div>
                </div>

                {/* Current Email Subscriptions */}
                <div>
                  <h3 className="mb-3 text-sm font-semibold">
                    Currently receiving:
                  </h3>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-primary" />
                      <span>Event invitations</span>
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-primary" />
                      <span>RSVP confirmations</span>
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-primary" />
                      <span>Reminders</span>
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-primary" />
                      <span>Thank you emails</span>
                    </li>
                  </ul>
                </div>

                {/* Warning Message */}
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950">
                  <div className="flex gap-3">
                    <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-500" />
                    <div className="flex-1 text-sm text-amber-800 dark:text-amber-200">
                      <p className="font-medium">Important</p>
                      <p className="mt-1">
                        You will no longer receive any emails about this event. This
                        action cannot be undone through this page.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button
                  variant="default"
                  onClick={handleConfirmUnsubscribe}
                  className="w-full bg-red-600 text-white hover:bg-red-700 active:bg-red-800 dark:bg-red-700 dark:hover:bg-red-800 sm:w-auto"
                >
                  Confirm Unsubscribe
                </Button>
              </CardFooter>
            </Card>
          )}

          {/* Already Unsubscribed State */}
          {pageState === "already-unsubscribed" && pageInfo && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                  <X className="h-8 w-8 text-muted-foreground" />
                </div>
                <h2 className="mb-2 text-xl font-semibold">
                  Already Unsubscribed
                </h2>
                <p className="mb-6 text-muted-foreground">
                  You are already unsubscribed from emails for{" "}
                  <span className="font-medium">{pageInfo.event_name}</span>.
                </p>
                <Button onClick={handleCancel}>Go to Homepage</Button>
              </CardContent>
            </Card>
          )}

          {/* Processing State */}
          {pageState === "processing" && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="mt-4 text-muted-foreground">Processing...</p>
              </CardContent>
            </Card>
          )}

          {/* Success State */}
          {pageState === "success" && unsubscribeResponse && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-950">
                  <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-500" />
                </div>
                <h2 className="mb-2 text-xl font-semibold">
                  Unsubscribed Successfully
                </h2>
                <p className="mb-6 text-muted-foreground">
                  {unsubscribeResponse.message}
                </p>
                <div className="mb-6 rounded-lg border bg-muted/50 p-4 text-sm">
                  <p>
                    <span className="font-medium">Guest:</span>{" "}
                    {unsubscribeResponse.guest_name}
                  </p>
                  <p className="mt-1">
                    <span className="font-medium">Event:</span>{" "}
                    {unsubscribeResponse.event_name}
                  </p>
                </div>
                <Button onClick={handleCancel}>Go to Homepage</Button>
              </CardContent>
            </Card>
          )}

          {/* Error State */}
          {pageState === "error" && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-950">
                  <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-500" />
                </div>
                <h2 className="mb-2 text-xl font-semibold">
                  Unable to Process Request
                </h2>
                <p className="mb-6 text-muted-foreground">
                  {error || "An error occurred. Please try again."}
                </p>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button variant="outline" onClick={handleCancel}>
                    Go to Homepage
                  </Button>
                  <Button onClick={handleRetry}>Retry</Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        <p>Powered by Party-Time</p>
      </footer>
    </div>
  );
}
