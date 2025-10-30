/**
 * FR-6: The system shall display an RSVP submission page. 5.1.1
 * RSVP API service for public guest responses
 * These are public endpoints that do not require authentication
 */

import { api } from "@/lib/api-client";
import type {
  RSVPValidationResponse,
  RSVPEventDetailsResponse,
  RSVPSubmissionRequest,
  RSVPSubmissionResponse,
  RSVPPreferencesUpdate,
  RSVPPlusOneUpdate,
  RSVPErrorResponse,
  UnsubscribePageInfo,
  UnsubscribeResponse,
} from "@/types/rsvp.types";

/**
 * Validate RSVP token
 * Public endpoint - no authentication required
 * @param token - 8-character RSVP token
 * @returns Validation response with guest/event info
 */
export const validateRSVPToken = async (
  token: string
): Promise<RSVPValidationResponse> => {
  try {
    const data = await api.get<RSVPValidationResponse>(
      `/api/v1/rsvp/${token}/validate`,
      undefined,
      {
        // No authorization header for public endpoint - handled by default params
      }
    );
    return data;
  } catch (error: unknown) {
    // Handle rate limiting
    if (error && typeof error === "object" && "response" in error) {
      const httpError = error as {
        response: { status: number; data: RSVPErrorResponse };
      };
      if (httpError.response.status === 429) {
        throw new Error(
          httpError.response.data.message ||
            "Too many requests. Please try again later."
        );
      }
    }
    throw error;
  }
};

/**
 * Get complete event details for RSVP page
 * Public endpoint - no authentication required
 * @param token - 8-character RSVP token
 * @returns Event details with guest information
 */
export const getRSVPEventDetails = async (
  token: string
): Promise<RSVPEventDetailsResponse> => {
  try {
    const data = await api.get<RSVPEventDetailsResponse>(
      `/api/v1/rsvp/${token}/event-details`
    );
    return data;
  } catch (error: unknown) {
    // Handle expired tokens
    if (error && typeof error === "object" && "response" in error) {
      const httpError = error as { response: { status: number } };
      if (httpError.response.status === 410) {
        throw new Error(
          "This RSVP link has expired. Please contact the event host."
        );
      }
      if (httpError.response.status === 429) {
        throw new Error("Too many requests. Please try again later.");
      }
    }
    throw error;
  }
};

/**
 * Submit RSVP response
 * Public endpoint - no authentication required
 * @param token - 8-character RSVP token
 * @param data - RSVP submission data
 * @returns Submission confirmation
 */
export const submitRSVPResponse = async (
  token: string,
  requestData: RSVPSubmissionRequest
): Promise<RSVPSubmissionResponse> => {
  try {
    const data = await api.post<RSVPSubmissionResponse>(
      `/api/v1/rsvp/${token}/respond`,
      requestData
    );
    return data;
  } catch (error: unknown) {
    // Handle various error scenarios
    if (error && typeof error === "object" && "response" in error) {
      const httpError = error as {
        response: {
          status: number;
          data: { detail: string | { message: string } };
        };
      };

      if (httpError.response.status === 410) {
        throw new Error(
          "This RSVP link has expired. Please contact the event host."
        );
      }

      if (httpError.response.status === 429) {
        const detail = httpError.response.data.detail;
        const message =
          typeof detail === "object"
            ? detail.message
            : "Too many requests. Please try again later.";
        throw new Error(message);
      }

      if (httpError.response.status === 400) {
        const detail = httpError.response.data.detail;
        throw new Error(
          typeof detail === "string" ? detail : "Invalid RSVP data"
        );
      }
    }
    throw error;
  }
};

/**
 * Update RSVP preferences (dietary restrictions, meal choice)
 * Public endpoint - no authentication required
 * @param token - 8-character RSVP token
 * @param preferences - Updated preferences
 * @returns Success confirmation
 */
export const updateRSVPPreferences = async (
  token: string,
  preferences: RSVPPreferencesUpdate
): Promise<{ success: boolean; message: string }> => {
  try {
    const data = await api.patch<{ success: boolean; message: string }>(
      `/api/v1/rsvp/${token}/preferences`,
      preferences
    );
    return data;
  } catch (error: unknown) {
    if (error && typeof error === "object" && "response" in error) {
      const httpError = error as { response: { status: number } };
      if (httpError.response.status === 410) {
        throw new Error("This RSVP link has expired.");
      }
      if (httpError.response.status === 429) {
        throw new Error("Too many requests. Please try again later.");
      }
    }
    throw error;
  }
};

/**
 * Update plus-one information
 * Public endpoint - no authentication required
 * @param token - 8-character RSVP token
 * @param plusOneData - Plus-one name
 * @returns Success confirmation
 */
export const updateRSVPPlusOne = async (
  token: string,
  plusOneData: RSVPPlusOneUpdate
): Promise<{ success: boolean; message: string; plus_one_name?: string }> => {
  try {
    const data = await api.patch<{
      success: boolean;
      message: string;
      plus_one_name?: string;
    }>(`/api/v1/rsvp/${token}/plus-one`, plusOneData);
    return data;
  } catch (error: unknown) {
    if (error && typeof error === "object" && "response" in error) {
      const httpError = error as {
        response: { status: number; data: { detail: string } };
      };

      if (httpError.response.status === 410) {
        throw new Error("This RSVP link has expired.");
      }

      if (httpError.response.status === 400) {
        throw new Error(
          httpError.response.data.detail || "Invalid plus-one data"
        );
      }

      if (httpError.response.status === 429) {
        throw new Error("Too many requests. Please try again later.");
      }
    }
    throw error;
  }
};

/**
 * Helper function to check if error is a rate limit error
 * @param error - Error object
 * @returns True if error is rate limit error
 */
export const isRateLimitError = (error: unknown): boolean => {
  if (error && typeof error === "object" && "response" in error) {
    const httpError = error as { response: { status: number } };
    return httpError.response.status === 429;
  }
  return false;
};

/**
 * Helper function to extract retry-after value from rate limit error
 * @param error - Error object
 * @returns Seconds to wait before retrying, or null
 */
export const getRateLimitRetryAfter = (error: unknown): number | null => {
  if (error && typeof error === "object" && "response" in error) {
    const httpError = error as {
      response: {
        status: number;
        data: RSVPErrorResponse;
        headers: { "retry-after"?: string };
      };
    };

    if (httpError.response.status === 429) {
      // Check Retry-After header
      const retryAfter = httpError.response.headers["retry-after"];
      if (retryAfter) {
        return parseInt(retryAfter, 10);
      }

      // Check response body
      if (httpError.response.data.retry_after) {
        return httpError.response.data.retry_after;
      }
    }
  }
  return null;
};

/**
 * FR-7: Email Automation
 * Phase 5.2.4: Automated Email Flows - Unsubscribe Page
 *
 * Get unsubscribe page information (Phase 5.2.4)
 * Public endpoint - no authentication required
 * @param unsubscribeToken - Unsubscribe token from email link
 * @returns Guest and event information
 */
export const getUnsubscribePageInfo = async (
  unsubscribeToken: string
): Promise<UnsubscribePageInfo> => {
  try {
    const data = await api.get<UnsubscribePageInfo>(
      `/api/v1/rsvp/unsubscribe/${unsubscribeToken}`
    );
    return data;
  } catch (error: unknown) {
    if (error && typeof error === "object" && "response" in error) {
      const httpError = error as { response: { status: number } };
      if (httpError.response.status === 404) {
        throw new Error(
          "Invalid unsubscribe link. This link may have expired."
        );
      }
    }
    throw error;
  }
};

/**
 * Confirm unsubscribe from event emails (Phase 5.2.4)
 * Public endpoint - no authentication required
 * @param unsubscribeToken - Unsubscribe token from email link
 * @param confirm - Must be true to confirm unsubscribe
 * @returns Unsubscribe confirmation
 */
export const confirmUnsubscribe = async (
  unsubscribeToken: string,
  confirm: boolean
): Promise<UnsubscribeResponse> => {
  try {
    const data = await api.post<UnsubscribeResponse>(
      `/api/v1/rsvp/unsubscribe/${unsubscribeToken}`,
      { confirm }
    );
    return data;
  } catch (error: unknown) {
    if (error && typeof error === "object" && "response" in error) {
      const httpError = error as {
        response: { status: number; data: { detail: string } };
      };

      if (httpError.response.status === 404) {
        throw new Error("Invalid unsubscribe link.");
      }

      if (httpError.response.status === 400) {
        throw new Error(
          httpError.response.data.detail || "Unsubscribe confirmation required"
        );
      }
    }
    throw error;
  }
};
