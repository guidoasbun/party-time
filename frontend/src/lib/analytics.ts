/**
 * Phase 9.2: Analytics Tracking System
 * Provides utilities for tracking user actions and page views
 */

// Event categories for organization
export const AnalyticsCategory = {
  PAGE_VIEW: "page_view",
  USER_ACTION: "user_action",
  FEATURE: "feature",
  ERROR: "error",
  PERFORMANCE: "performance",
} as const;

export type AnalyticsCategoryType =
  (typeof AnalyticsCategory)[keyof typeof AnalyticsCategory];

// Predefined events for consistency
export const AnalyticsEvent = {
  // Page views
  PAGE_VIEWED: "page_viewed",

  // Event management
  EVENT_CREATED: "event_created",
  EVENT_UPDATED: "event_updated",
  EVENT_DELETED: "event_deleted",
  EVENT_VIEWED: "event_viewed",

  // Guest management
  GUEST_ADDED: "guest_added",
  GUEST_IMPORTED: "guest_imported",
  GUEST_REMOVED: "guest_removed",
  GUESTS_BULK_UPDATED: "guests_bulk_updated",

  // RSVP
  RSVP_SUBMITTED: "rsvp_submitted",
  RSVP_UPDATED: "rsvp_updated",

  // Email
  INVITATION_SENT: "invitation_sent",
  EMAIL_CAMPAIGN_CREATED: "email_campaign_created",

  // Seating
  SEATING_CHART_CREATED: "seating_chart_created",
  SEATING_CHART_UPDATED: "seating_chart_updated",
  GUEST_SEATED: "guest_seated",
  TABLE_ADDED: "table_added",

  // Venue
  VENUE_SEARCHED: "venue_searched",
  VENUE_SAVED: "venue_saved",

  // Budget
  BUDGET_ITEM_ADDED: "budget_item_added",
  BUDGET_ITEM_UPDATED: "budget_item_updated",
  BUDGET_EXPORTED: "budget_exported",

  // User actions
  SIGN_IN: "sign_in",
  SIGN_OUT: "sign_out",
  ONBOARDING_STARTED: "onboarding_started",
  ONBOARDING_COMPLETED: "onboarding_completed",
  ONBOARDING_SKIPPED: "onboarding_skipped",

  // Errors
  ERROR_OCCURRED: "error_occurred",
  API_ERROR: "api_error",
} as const;

export type AnalyticsEventType =
  (typeof AnalyticsEvent)[keyof typeof AnalyticsEvent];

// Analytics event payload
interface AnalyticsPayload {
  event: AnalyticsEventType | string;
  category: AnalyticsCategoryType;
  properties?: Record<string, string | number | boolean | null | undefined>;
  timestamp?: number;
  userId?: string;
  sessionId?: string;
}

// Configuration
interface AnalyticsConfig {
  enabled: boolean;
  debug: boolean;
  endpoint?: string;
  flushInterval: number;
  maxQueueSize: number;
}

// Default configuration
const defaultConfig: AnalyticsConfig = {
  enabled: process.env.NODE_ENV === "production",
  debug: process.env.NODE_ENV === "development",
  endpoint: process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT,
  flushInterval: 10000, // 10 seconds
  maxQueueSize: 100,
};

// Event queue for batching
let eventQueue: AnalyticsPayload[] = [];
let flushTimer: NodeJS.Timeout | null = null;
let config: AnalyticsConfig = defaultConfig;

/**
 * Initialize analytics with custom configuration
 */
export function initAnalytics(customConfig?: Partial<AnalyticsConfig>): void {
  config = { ...defaultConfig, ...customConfig };

  if (typeof window === "undefined") return;

  // Start flush timer
  if (config.enabled && config.flushInterval > 0) {
    flushTimer = setInterval(flushEvents, config.flushInterval);
  }

  // Flush on page unload
  window.addEventListener("beforeunload", () => {
    flushEvents();
  });
}

/**
 * Track an analytics event
 */
export function trackEvent(
  event: AnalyticsEventType | string,
  category: AnalyticsCategoryType = AnalyticsCategory.USER_ACTION,
  properties?: Record<string, string | number | boolean | null | undefined>
): void {
  if (typeof window === "undefined") return;

  const payload: AnalyticsPayload = {
    event,
    category,
    properties: {
      ...properties,
      url: window.location.href,
      referrer: document.referrer || undefined,
      userAgent: navigator.userAgent,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
    },
    timestamp: Date.now(),
    sessionId: getSessionId(),
  };

  // Debug logging
  if (config.debug) {
    console.log(
      `%c[Analytics] ${event}`,
      "color: #3b82f6; font-weight: bold;",
      payload
    );
  }

  // Add to queue
  eventQueue.push(payload);

  // Flush if queue is full
  if (eventQueue.length >= config.maxQueueSize) {
    flushEvents();
  }
}

/**
 * Track a page view
 */
export function trackPageView(
  path: string,
  title?: string,
  additionalProps?: Record<string, string | number | boolean | null | undefined>
): void {
  trackEvent(AnalyticsEvent.PAGE_VIEWED, AnalyticsCategory.PAGE_VIEW, {
    path,
    title: title || document.title,
    ...additionalProps,
  });
}

/**
 * Track an error
 */
export function trackError(
  error: Error | string,
  context?: Record<string, string | number | boolean | null | undefined>
): void {
  const errorMessage = error instanceof Error ? error.message : error;
  const errorStack = error instanceof Error ? error.stack : undefined;

  trackEvent(AnalyticsEvent.ERROR_OCCURRED, AnalyticsCategory.ERROR, {
    errorMessage,
    errorStack: errorStack?.substring(0, 500), // Limit stack trace length
    ...context,
  });
}

/**
 * Get or create session ID
 */
function getSessionId(): string {
  if (typeof window === "undefined") return "";

  const storageKey = "party-time-session-id";
  let sessionId = sessionStorage.getItem(storageKey);

  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    sessionStorage.setItem(storageKey, sessionId);
  }

  return sessionId;
}

/**
 * Flush events to the analytics endpoint
 */
function flushEvents(): void {
  if (eventQueue.length === 0) return;
  if (!config.enabled || !config.endpoint) {
    // If not enabled or no endpoint, just clear the queue
    eventQueue = [];
    return;
  }

  const eventsToSend = [...eventQueue];
  eventQueue = [];

  // Use sendBeacon for reliable delivery
  if (
    typeof navigator !== "undefined" &&
    navigator.sendBeacon
  ) {
    const body = JSON.stringify({ events: eventsToSend });
    navigator.sendBeacon(config.endpoint, body);
  } else {
    // Fallback to fetch
    fetch(config.endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ events: eventsToSend }),
      keepalive: true,
    }).catch((err) => {
      if (config.debug) {
        console.error("[Analytics] Failed to send events:", err);
      }
    });
  }
}

/**
 * Cleanup analytics (call on app unmount)
 */
export function cleanupAnalytics(): void {
  if (flushTimer) {
    clearInterval(flushTimer);
    flushTimer = null;
  }
  flushEvents();
}

// Convenience functions for common events
export const analytics = {
  // Event management
  eventCreated: (eventId: string, eventType: string) =>
    trackEvent(AnalyticsEvent.EVENT_CREATED, AnalyticsCategory.FEATURE, {
      eventId,
      eventType,
    }),

  eventUpdated: (eventId: string) =>
    trackEvent(AnalyticsEvent.EVENT_UPDATED, AnalyticsCategory.FEATURE, {
      eventId,
    }),

  eventViewed: (eventId: string) =>
    trackEvent(AnalyticsEvent.EVENT_VIEWED, AnalyticsCategory.PAGE_VIEW, {
      eventId,
    }),

  // Guest management
  guestAdded: (eventId: string, guestCount: number = 1) =>
    trackEvent(AnalyticsEvent.GUEST_ADDED, AnalyticsCategory.FEATURE, {
      eventId,
      guestCount,
    }),

  guestsImported: (eventId: string, guestCount: number) =>
    trackEvent(AnalyticsEvent.GUEST_IMPORTED, AnalyticsCategory.FEATURE, {
      eventId,
      guestCount,
    }),

  // RSVP
  rsvpSubmitted: (eventId: string, response: string) =>
    trackEvent(AnalyticsEvent.RSVP_SUBMITTED, AnalyticsCategory.FEATURE, {
      eventId,
      response,
    }),

  // Email
  invitationSent: (eventId: string, recipientCount: number) =>
    trackEvent(AnalyticsEvent.INVITATION_SENT, AnalyticsCategory.FEATURE, {
      eventId,
      recipientCount,
    }),

  // Seating
  seatingChartUpdated: (eventId: string, tableCount: number) =>
    trackEvent(AnalyticsEvent.SEATING_CHART_UPDATED, AnalyticsCategory.FEATURE, {
      eventId,
      tableCount,
    }),

  // Budget
  budgetItemAdded: (eventId: string, category: string, amount: number) =>
    trackEvent(AnalyticsEvent.BUDGET_ITEM_ADDED, AnalyticsCategory.FEATURE, {
      eventId,
      category,
      amount,
    }),

  // User actions
  signIn: (method: string) =>
    trackEvent(AnalyticsEvent.SIGN_IN, AnalyticsCategory.USER_ACTION, {
      method,
    }),

  signOut: () =>
    trackEvent(AnalyticsEvent.SIGN_OUT, AnalyticsCategory.USER_ACTION),

  onboardingStarted: () =>
    trackEvent(AnalyticsEvent.ONBOARDING_STARTED, AnalyticsCategory.USER_ACTION),

  onboardingCompleted: () =>
    trackEvent(AnalyticsEvent.ONBOARDING_COMPLETED, AnalyticsCategory.USER_ACTION),

  onboardingSkipped: () =>
    trackEvent(AnalyticsEvent.ONBOARDING_SKIPPED, AnalyticsCategory.USER_ACTION),

  // Page views
  pageView: trackPageView,

  // Errors
  error: trackError,
};
