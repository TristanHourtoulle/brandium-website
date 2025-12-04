import { toast as sonnerToast } from "sonner";

/**
 * Show a success toast notification
 */
export function showSuccess(message: string, description?: string) {
  sonnerToast.success(message, {
    description,
  });
}

/**
 * Show an error toast notification
 */
export function showError(message: string, description?: string) {
  sonnerToast.error(message, {
    description,
  });
}

/**
 * Show an info toast notification
 */
export function showInfo(message: string, description?: string) {
  sonnerToast.info(message, {
    description,
  });
}

/**
 * Show a warning toast notification
 */
export function showWarning(message: string, description?: string) {
  sonnerToast.warning(message, {
    description,
  });
}

/**
 * Show a loading toast notification that can be updated
 * Returns the toast ID for updating/dismissing
 */
export function showLoading(message: string): string | number {
  return sonnerToast.loading(message);
}

/**
 * Dismiss a specific toast by ID
 */
export function dismissToast(id: string | number) {
  sonnerToast.dismiss(id);
}

/**
 * Update a loading toast to success
 */
export function updateToSuccess(
  id: string | number,
  message: string,
  description?: string
) {
  sonnerToast.success(message, {
    id,
    description,
  });
}

/**
 * Update a loading toast to error
 */
export function updateToError(
  id: string | number,
  message: string,
  description?: string
) {
  sonnerToast.error(message, {
    id,
    description,
  });
}

/**
 * Promise-based toast that shows loading, then success/error
 */
export function showPromise<T>(
  promise: Promise<T>,
  messages: {
    loading: string;
    success: string | ((data: T) => string);
    error: string | ((error: unknown) => string);
  }
): Promise<T> {
  sonnerToast.promise(promise, messages);
  return promise;
}

// Re-export the original toast for advanced usage
export { sonnerToast as toast };
