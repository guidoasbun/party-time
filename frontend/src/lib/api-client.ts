import axios, { AxiosError, AxiosResponse, isAxiosError } from "axios";
import { getSession } from "next-auth/react";
import { ApiError } from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Custom error classes
export class ApiException extends Error {
  public readonly status: number;
  public readonly code?: string;
  public readonly details?: string | string[];

  constructor(
    message: string,
    status: number,
    code?: string,
    details?: string | string[]
  ) {
    super(message);
    this.name = "ApiException";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export class NetworkException extends Error {
  constructor(message: string = "Network error occurred") {
    super(message);
    this.name = "NetworkException";
  }
}

export class TimeoutException extends Error {
  constructor(message: string = "Request timeout") {
    super(message);
    this.name = "TimeoutException";
  }
}

// Retry configuration
interface RetryConfig {
  attempts: number;
  delay: number;
  backoff: boolean;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  attempts: 3,
  delay: 1000,
  backoff: true,
};

// Request cancellation support
const cancelTokens = new Map<string, AbortController>();

export const cancelRequest = (requestId: string) => {
  const controller = cancelTokens.get(requestId);
  if (controller) {
    controller.abort();
    cancelTokens.delete(requestId);
  }
};

export const cancelAllRequests = () => {
  cancelTokens.forEach((controller) => controller.abort());
  cancelTokens.clear();
};

// Create axios instance
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000, // Increased timeout for file uploads
  validateStatus: (status) => status < 500, // Don't throw for 4xx errors
});

// Request interceptor to add auth token and request ID
apiClient.interceptors.request.use(
  async (config) => {
    try {
      // Add authentication token (unless explicitly disabled in test)
      if (
        process.env.NODE_ENV !== "test" ||
        process.env.TEST_ENABLE_AUTH === "true"
      ) {
        // Add authentication token
        const session = await getSession();
        //console.log('[API Client] Session:', session)
        if (session?.idToken) {
          config.headers.Authorization = `Bearer ${session.idToken}`;
          console.log("[API Client] Added Authorization header");
        } else {
          console.warn(
            "[API Client] No idToken in session - request will be unauthorized"
          );
        }
      }

      // Add request ID for cancellation support
      const requestId = `${config.method?.toUpperCase()}-${
        config.url
      }-${Date.now()}`;
      config.metadata = { requestId };

      // Set up abort controller for cancellation
      const controller = new AbortController();
      config.signal = controller.signal;
      cancelTokens.set(requestId, controller);

      // Add request timestamp for debugging
      config.headers["X-Request-Timestamp"] = new Date().toISOString();
    } catch (error) {
      console.warn("Failed to prepare API request:", error);
    }
    return config;
  },
  () => {
    return Promise.reject(new NetworkException("Request preparation failed"));
  }
);

// Response interceptor for global error handling
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Clean up cancel token
    const requestId = response.config.metadata?.requestId;
    if (requestId) {
      cancelTokens.delete(requestId);
    }

    // Handle 4xx errors (which are treated as successful due to validateStatus)
    if (response.status >= 400 && response.status < 500) {
      const errorData = response.data as ApiError;
      const apiError = new ApiException(
        typeof errorData?.detail === "string"
          ? errorData.detail
          : Array.isArray(errorData?.detail)
          ? errorData.detail.join(", ")
          : `HTTP ${response.status} Error`,
        response.status,
        errorData?.error_code,
        errorData?.detail
      );

      // Handle specific status codes
      switch (response.status) {
        case 401:
          console.warn("Authentication failed - redirecting to login");
          if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("auth:unauthorized"));
          }
          break;
        case 403:
          console.warn("Access forbidden - insufficient permissions");
          break;
        case 404:
          console.warn("Resource not found");
          break;
        case 422:
          console.warn("Validation error:", errorData?.detail);
          break;
        case 429:
          console.warn("Rate limit exceeded");
          break;
      }

      return Promise.reject(apiError);
    }

    return response;
  },
  (error: unknown) => {
    const axiosError = error as AxiosError;
    const genericError = error as Error;

    // Clean up cancel token
    const requestId = isAxiosError(error)
      ? axiosError.config?.metadata?.requestId
      : undefined;
    if (requestId) {
      cancelTokens.delete(requestId);
    }

    // Handle request cancellation
    if (axios.isCancel(error) || (isAxiosError(error) && axiosError.code === "ERR_CANCELED")) {
      return Promise.reject(new Error("Request cancelled"));
    }

    // Handle timeout
    if (
      (isAxiosError(error) && axiosError.code === "ECONNABORTED") ||
      (genericError.message && genericError.message.includes("timeout"))
    ) {
      return Promise.reject(new TimeoutException());
    }

    // Handle network errors
    if (isAxiosError(error) && !axiosError.response) {
      return Promise.reject(new NetworkException("Network connection failed"));
    }

    // Handle 5xx server errors only (4xx are handled in success interceptor)
    if (!isAxiosError(error) || !axiosError.response) {
      return Promise.reject(error);
    }

    const status = axiosError.response.status;
    const errorData = axiosError.response.data as ApiError;

    if (status >= 500) {
      console.error("Server error:", errorData);
      const apiError = new ApiException(
        typeof errorData?.detail === "string"
          ? errorData.detail
          : Array.isArray(errorData?.detail)
          ? errorData.detail.join(", ")
          : `HTTP ${status} Error`,
        status,
        errorData?.error_code,
        errorData?.detail
      );
      return Promise.reject(apiError);
    }

    // This shouldn't happen due to validateStatus, but just in case
    return Promise.reject(error);
  }
);

// Retry function with exponential backoff
const retryRequest = async <T>(
  requestFn: () => Promise<T>,
  config: RetryConfig = DEFAULT_RETRY_CONFIG
): Promise<T> => {
  let lastError: Error;

  for (let attempt = 1; attempt <= config.attempts; attempt++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error as Error;

      // Don't retry on client errors (4xx) except 429
      if (
        error instanceof ApiException &&
        error.status >= 400 &&
        error.status < 500 &&
        error.status !== 429
      ) {
        throw error;
      }

      // Don't retry on last attempt
      if (attempt === config.attempts) {
        break;
      }

      // Calculate delay with optional backoff
      const delay = config.backoff
        ? config.delay * Math.pow(2, attempt - 1)
        : config.delay;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
};

// Enhanced API client configuration
export interface ApiClientConfig {
  retries?: RetryConfig;
  timeout?: number;
  baseURL?: string;
}

// Create configured API client
export const createApiClient = (config?: ApiClientConfig) => {
  const client = axios.create({
    baseURL: config?.baseURL || API_BASE_URL,
    timeout: config?.timeout || 30000,
    headers: {
      "Content-Type": "application/json",
    },
    validateStatus: (status) => status < 500,
  });

  // Apply the same interceptors manually since handlers array is not accessible
  client.interceptors.request.use(
    async (config) => {
      try {
        // Add authentication token
        const session = await getSession();
        if (session?.idToken) {
          config.headers.Authorization = `Bearer ${session.idToken}`;
        }

        // Add request ID for cancellation support
        const requestId = `${config.method?.toUpperCase()}-${
          config.url
        }-${Date.now()}`;
        config.metadata = { requestId };

        // Set up abort controller for cancellation
        const controller = new AbortController();
        config.signal = controller.signal;
        cancelTokens.set(requestId, controller);

        // Add request timestamp for debugging
        config.headers["X-Request-Timestamp"] = new Date().toISOString();
      } catch (error) {
        console.warn("Failed to prepare API request:", error);
      }
      return config;
    },
    () => {
      return Promise.reject(new NetworkException("Request preparation failed"));
    }
  );

  client.interceptors.response.use(
    (response: AxiosResponse) => {
      const requestId = response.config.metadata?.requestId;
      if (requestId) {
        cancelTokens.delete(requestId);
      }
      return response;
    },
    (error: unknown) => {
      const axiosError = error as AxiosError;
      const genericError = error as Error;

      const requestId = isAxiosError(error) ? axiosError.config?.metadata?.requestId : undefined;
      if (requestId) {
        cancelTokens.delete(requestId);
      }

      if (axios.isCancel(error) || (isAxiosError(error) && axiosError.code === "ERR_CANCELED")) {
        return Promise.reject(new Error("Request cancelled"));
      }

      if (
        (isAxiosError(error) && axiosError.code === "ECONNABORTED") ||
        (genericError.message && genericError.message.includes("timeout"))
      ) {
        return Promise.reject(new TimeoutException());
      }

      if (isAxiosError(error) && !axiosError.response) {
        return Promise.reject(
          new NetworkException("Network connection failed")
        );
      }

      if (!isAxiosError(error) || !axiosError.response) {
        return Promise.reject(error);
      }

      const status = axiosError.response.status;
      const errorData = axiosError.response.data as ApiError;

      const apiError = new ApiException(
        typeof errorData?.detail === "string"
          ? errorData.detail
          : Array.isArray(errorData?.detail)
          ? errorData.detail.join(", ")
          : `HTTP ${status} Error`,
        status,
        errorData?.error_code,
        errorData?.detail
      );

      switch (status) {
        case 401:
          console.warn("Authentication failed - token expired or invalid");
          if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("auth:unauthorized"));
          }
          break;
        case 403:
          console.warn("Access forbidden - insufficient permissions");
          break;
        case 404:
          console.warn("Resource not found");
          break;
        case 422:
          console.warn("Validation error:", errorData?.detail);
          break;
        case 429:
          console.warn("Rate limit exceeded");
          break;
        default:
          if (status >= 500) {
            console.error("Server error:", errorData);
          }
      }

      return Promise.reject(apiError);
    }
  );

  return client;
};

// Enhanced generic API functions with retry and type safety
export const api = {
  get: async <T = unknown>(
    url: string,
    params?: Record<string, unknown>,
    config?: { retries?: RetryConfig; requestId?: string }
  ): Promise<T> => {
    const requestFn = () => apiClient.get<T>(url, { params });
    const response = config?.retries
      ? await retryRequest(requestFn, config.retries)
      : await requestFn();
    return response.data;
  },

  post: async <T = unknown, D = unknown>(
    url: string,
    data?: D,
    config?: { retries?: RetryConfig; requestId?: string }
  ): Promise<T> => {
    const requestFn = () => apiClient.post<T>(url, data);
    const response = config?.retries
      ? await retryRequest(requestFn, config.retries)
      : await requestFn();
    return response.data;
  },

  put: async <T = unknown, D = unknown>(
    url: string,
    data?: D,
    config?: { retries?: RetryConfig; requestId?: string }
  ): Promise<T> => {
    const requestFn = () => apiClient.put<T>(url, data);
    const response = config?.retries
      ? await retryRequest(requestFn, config.retries)
      : await requestFn();
    return response.data;
  },

  patch: async <T = unknown, D = unknown>(
    url: string,
    data?: D,
    config?: { retries?: RetryConfig; requestId?: string }
  ): Promise<T> => {
    const requestFn = () => apiClient.patch<T>(url, data);
    const response = config?.retries
      ? await retryRequest(requestFn, config.retries)
      : await requestFn();
    return response.data;
  },

  delete: async <T = unknown>(
    url: string,
    config?: { retries?: RetryConfig; requestId?: string }
  ): Promise<T> => {
    const requestFn = () => apiClient.delete<T>(url);
    const response = config?.retries
      ? await retryRequest(requestFn, config.retries)
      : await requestFn();
    return response.data;
  },

  // File upload with progress tracking
  upload: async <T = unknown>(
    url: string,
    file: File,
    onProgress?: (progress: number) => void,
    _config?: { requestId?: string }
  ): Promise<T> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await apiClient.post<T>(url, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(progress);
        }
      },
    });

    return response.data;
  },

  // Download file
  download: async (
    url: string,
    filename?: string,
    _config?: { requestId?: string }
  ): Promise<void> => {
    const response = await apiClient.get(url, {
      responseType: "blob",
    });

    // Create download link
    const blob = new Blob([response.data]);
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = filename || "download";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  },
};

// Utility functions
export const createRequestId = (prefix = "req") => {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
};

// Health check
export const healthCheck = async (): Promise<{
  status: string;
  timestamp: string;
}> => {
  return api.get("/health");
};

// Type guards
export const isApiException = (error: unknown): error is ApiException => {
  return error instanceof ApiException;
};

export const isNetworkException = (
  error: unknown
): error is NetworkException => {
  return error instanceof NetworkException;
};

export const isTimeoutException = (
  error: unknown
): error is TimeoutException => {
  return error instanceof TimeoutException;
};

// Error message helpers
export const getErrorMessage = (error: unknown): string => {
  if (isApiException(error)) {
    return error.message;
  }
  if (isNetworkException(error) || isTimeoutException(error)) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "An unexpected error occurred";
};

export const getErrorDetails = (
  error: unknown
): string | string[] | undefined => {
  if (isApiException(error)) {
    return error.details;
  }
  return undefined;
};

// Request configuration helpers
export const withRetry = (
  retries: Partial<RetryConfig> = {}
): { retries: RetryConfig } => ({
  retries: { ...DEFAULT_RETRY_CONFIG, ...retries },
});

export const withRequestId = (id?: string): { requestId: string } => ({
  requestId: id || createRequestId(),
});

// Legacy auth API - will be moved to dedicated service
export const legacyAuthApi = {
  register: (data: { email: string; password: string; name: string }) =>
    api.post("/api/v1/auth/register", data),
  verifyEmail: (data: { email: string; verification_code: string }) =>
    api.post("/api/v1/auth/verify-email", data),
  resendVerification: (data: { email: string }) =>
    api.post("/api/v1/auth/resend-verification", data),
  requestPasswordReset: (data: { email: string }) =>
    api.post("/api/v1/auth/password-reset", data),
  confirmPasswordReset: (data: {
    email: string;
    confirmation_code: string;
    new_password: string;
  }) => api.post("/api/v1/auth/password-reset-confirm", data),
  getCurrentUser: () => api.get("/api/v1/auth/me"),
  updateProfile: (data: { name?: string; phone?: string }) =>
    api.patch("/api/v1/auth/profile", data),
};

// Backward compatibility
export const authApi = legacyAuthApi;

// TypeScript declaration merging for axios config
declare module "axios" {
  interface AxiosRequestConfig {
    metadata?: {
      requestId: string;
    };
  }
}

export default apiClient;
