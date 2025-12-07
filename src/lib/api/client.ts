import { env } from "@/config/env";
import { AUTH_TOKEN_KEY } from "@/config/constants";
import type { ApiError } from "@/types";

// ================================
// Types & Configuration
// ================================

interface RetryConfig {
  /** Maximum number of retry attempts */
  maxRetries: number;
  /** Base delay in milliseconds (will be multiplied by 2^attempt) */
  baseDelay: number;
  /** Maximum delay between retries in milliseconds */
  maxDelay: number;
  /** HTTP status codes that should trigger a retry */
  retryableStatuses: number[];
}

interface RequestConfig extends RequestInit {
  /** Request timeout in milliseconds */
  timeout?: number;
  /** Retry configuration (set to false to disable retries) */
  retry?: Partial<RetryConfig> | false;
  /** Skip authentication header */
  skipAuth?: boolean;
}

type RequestInterceptor = (
  config: RequestConfig & { url: string }
) => RequestConfig & { url: string };

type ResponseInterceptor = (response: Response) => Response | Promise<Response>;

type ErrorInterceptor = (error: ApiClientError) => ApiClientError;

// ================================
// Custom Error Class
// ================================

export class ApiClientError extends Error implements ApiError {
  readonly statusCode: number;
  readonly errors?: Record<string, string[]>;
  readonly isTimeout: boolean;
  readonly isNetworkError: boolean;
  readonly isRetryable: boolean;
  readonly endpoint: string;
  readonly method: string;

  constructor(options: {
    message: string;
    statusCode: number;
    errors?: Record<string, string[]>;
    isTimeout?: boolean;
    isNetworkError?: boolean;
    isRetryable?: boolean;
    endpoint: string;
    method: string;
  }) {
    super(options.message);
    this.name = "ApiClientError";
    this.statusCode = options.statusCode;
    this.errors = options.errors;
    this.isTimeout = options.isTimeout ?? false;
    this.isNetworkError = options.isNetworkError ?? false;
    this.isRetryable = options.isRetryable ?? false;
    this.endpoint = options.endpoint;
    this.method = options.method;
  }
}

// ================================
// Default Configuration
// ================================

const DEFAULT_TIMEOUT = 10000; // 10 seconds

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  retryableStatuses: [408, 429, 500, 502, 503, 504],
};

// Status codes that should NOT be retried (client errors)
const NON_RETRYABLE_STATUSES = [400, 401, 403, 404, 422];

// ================================
// Utility Functions
// ================================

/**
 * Wait for a specified duration
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Calculate delay with exponential backoff and jitter
 */
function calculateBackoff(
  attempt: number,
  baseDelay: number,
  maxDelay: number
): number {
  // Exponential backoff: baseDelay * 2^attempt
  const exponentialDelay = baseDelay * Math.pow(2, attempt);
  // Add jitter (±25%) to prevent thundering herd
  const jitter = exponentialDelay * 0.25 * (Math.random() * 2 - 1);
  return Math.min(exponentialDelay + jitter, maxDelay);
}

/**
 * Create an AbortController with timeout
 */
function createTimeoutController(
  timeout: number,
  existingSignal?: AbortSignal
): { controller: AbortController; cleanup: () => void } {
  const controller = new AbortController();

  const timeoutId = setTimeout(() => {
    controller.abort(new Error("Request timeout"));
  }, timeout);

  // If there's an existing signal, abort when it aborts
  const existingAbortHandler = existingSignal
    ? () => {
        controller.abort(existingSignal.reason);
        clearTimeout(timeoutId);
      }
    : null;

  if (existingSignal && existingAbortHandler) {
    existingSignal.addEventListener("abort", existingAbortHandler);
  }

  const cleanup = () => {
    clearTimeout(timeoutId);
    if (existingSignal && existingAbortHandler) {
      existingSignal.removeEventListener("abort", existingAbortHandler);
    }
  };

  return { controller, cleanup };
}

// ================================
// API Client Class
// ================================

export class ApiClient {
  private baseUrl: string;
  private defaultTimeout: number;
  private defaultRetryConfig: RetryConfig;
  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor[] = [];
  private errorInterceptors: ErrorInterceptor[] = [];

  constructor(
    baseUrl: string = env.apiUrl,
    options?: {
      timeout?: number;
      retry?: Partial<RetryConfig>;
    }
  ) {
    this.baseUrl = baseUrl;
    this.defaultTimeout = options?.timeout ?? DEFAULT_TIMEOUT;
    this.defaultRetryConfig = { ...DEFAULT_RETRY_CONFIG, ...options?.retry };
  }

  // ================================
  // Interceptors
  // ================================

  /**
   * Add a request interceptor
   * @returns Function to remove the interceptor
   */
  addRequestInterceptor(interceptor: RequestInterceptor): () => void {
    this.requestInterceptors.push(interceptor);
    return () => {
      const index = this.requestInterceptors.indexOf(interceptor);
      if (index > -1) this.requestInterceptors.splice(index, 1);
    };
  }

  /**
   * Add a response interceptor
   * @returns Function to remove the interceptor
   */
  addResponseInterceptor(interceptor: ResponseInterceptor): () => void {
    this.responseInterceptors.push(interceptor);
    return () => {
      const index = this.responseInterceptors.indexOf(interceptor);
      if (index > -1) this.responseInterceptors.splice(index, 1);
    };
  }

  /**
   * Add an error interceptor
   * @returns Function to remove the interceptor
   */
  addErrorInterceptor(interceptor: ErrorInterceptor): () => void {
    this.errorInterceptors.push(interceptor);
    return () => {
      const index = this.errorInterceptors.indexOf(interceptor);
      if (index > -1) this.errorInterceptors.splice(index, 1);
    };
  }

  // ================================
  // Private Methods
  // ================================

  private getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(AUTH_TOKEN_KEY);
  }

  private async handleResponse<T>(
    response: Response,
    endpoint: string,
    method: string
  ): Promise<T> {
    // Apply response interceptors
    let processedResponse = response;
    for (const interceptor of this.responseInterceptors) {
      processedResponse = await interceptor(processedResponse);
    }

    if (!processedResponse.ok) {
      const error = await this.createErrorFromResponse(
        processedResponse,
        endpoint,
        method
      );
      throw this.processError(error);
    }

    // Handle empty responses (204 No Content)
    if (processedResponse.status === 204) {
      return {} as T;
    }

    return processedResponse.json();
  }

  private async createErrorFromResponse(
    response: Response,
    endpoint: string,
    method: string
  ): Promise<ApiClientError> {
    let message = "An error occurred";
    let errors: Record<string, string[]> | undefined;

    try {
      const data = await response.json();
      message = data.message || message;
      errors = data.errors;
    } catch {
      // Response is not JSON, use status text
      message = response.statusText || message;
    }

    return new ApiClientError({
      message,
      statusCode: response.status,
      errors,
      isRetryable: !NON_RETRYABLE_STATUSES.includes(response.status),
      endpoint,
      method,
    });
  }

  private processError(error: ApiClientError): ApiClientError {
    let processedError = error;
    for (const interceptor of this.errorInterceptors) {
      processedError = interceptor(processedError);
    }
    return processedError;
  }

  private shouldRetry(
    error: unknown,
    attempt: number,
    retryConfig: RetryConfig
  ): boolean {
    if (attempt >= retryConfig.maxRetries) return false;

    // Retry on network errors
    if (error instanceof TypeError && error.message.includes("fetch")) {
      return true;
    }

    // Retry on timeout
    if (error instanceof ApiClientError && error.isTimeout) {
      return true;
    }

    // Retry on specific status codes
    if (error instanceof ApiClientError) {
      return retryConfig.retryableStatuses.includes(error.statusCode);
    }

    return false;
  }

  private async executeWithRetry<T>(
    fn: () => Promise<T>,
    endpoint: string,
    method: string,
    retryConfig: RetryConfig | false
  ): Promise<T> {
    // If retry is disabled, just execute once
    if (retryConfig === false) {
      return fn();
    }

    let lastError: unknown;
    let attempt = 0;

    while (attempt <= retryConfig.maxRetries) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;

        if (!this.shouldRetry(error, attempt, retryConfig)) {
          throw error;
        }

        const delay = calculateBackoff(
          attempt,
          retryConfig.baseDelay,
          retryConfig.maxDelay
        );

        if (process.env.NODE_ENV === "development") {
          console.warn(
            `[ApiClient] Retrying ${method} ${endpoint} (attempt ${attempt + 1}/${retryConfig.maxRetries}) after ${delay}ms`
          );
        }

        await sleep(delay);
        attempt++;
      }
    }

    throw lastError;
  }

  private async request<T>(
    method: string,
    endpoint: string,
    data?: unknown,
    options?: RequestConfig
  ): Promise<T> {
    const timeout = options?.timeout ?? this.defaultTimeout;
    const retryConfig =
      options?.retry === false
        ? false
        : { ...this.defaultRetryConfig, ...options?.retry };

    // Build initial request config
    let config: RequestConfig & { url: string } = {
      ...options,
      url: `${this.baseUrl}${endpoint}`,
      method,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
    };

    // Add auth header if not skipped
    if (!options?.skipAuth) {
      const token = this.getToken();
      if (token) {
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${token}`,
        };
      }
    }

    // Apply request interceptors
    for (const interceptor of this.requestInterceptors) {
      config = interceptor(config);
    }

    // Execute request with retry logic
    return this.executeWithRetry(
      async () => {
        const { controller, cleanup } = createTimeoutController(
          timeout,
          options?.signal ?? undefined
        );

        try {
          const response = await fetch(config.url, {
            ...config,
            signal: controller.signal,
          });

          return this.handleResponse<T>(response, endpoint, method);
        } catch (error) {
          // Handle abort/timeout errors
          if (error instanceof Error) {
            if (
              error.name === "AbortError" ||
              error.message.includes("timeout")
            ) {
              throw this.processError(
                new ApiClientError({
                  message: "Request timeout",
                  statusCode: 408,
                  isTimeout: true,
                  isRetryable: true,
                  endpoint,
                  method,
                })
              );
            }

            // Handle network errors
            if (error.message.includes("fetch") || error.name === "TypeError") {
              throw this.processError(
                new ApiClientError({
                  message: "Network error - please check your connection",
                  statusCode: 0,
                  isNetworkError: true,
                  isRetryable: true,
                  endpoint,
                  method,
                })
              );
            }
          }

          throw error;
        } finally {
          cleanup();
        }
      },
      endpoint,
      method,
      retryConfig
    );
  }

  // ================================
  // Public HTTP Methods
  // ================================

  async get<T>(endpoint: string, options?: RequestConfig): Promise<T> {
    return this.request<T>("GET", endpoint, undefined, options);
  }

  async post<T>(
    endpoint: string,
    data?: unknown,
    options?: RequestConfig
  ): Promise<T> {
    return this.request<T>("POST", endpoint, data, options);
  }

  async put<T>(
    endpoint: string,
    data?: unknown,
    options?: RequestConfig
  ): Promise<T> {
    return this.request<T>("PUT", endpoint, data, options);
  }

  async patch<T>(
    endpoint: string,
    data?: unknown,
    options?: RequestConfig
  ): Promise<T> {
    return this.request<T>("PATCH", endpoint, data, options);
  }

  async delete<T>(endpoint: string, options?: RequestConfig): Promise<T> {
    return this.request<T>("DELETE", endpoint, undefined, options);
  }
}

// ================================
// Default Instance
// ================================

export const apiClient = new ApiClient();

// ================================
// Type Exports
// ================================

export type { RetryConfig, RequestConfig };
