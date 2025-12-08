/**
 * Debounce utility functions
 * For optimizing user input handling and API calls
 */

/**
 * Creates a debounced function that delays invoking the provided function
 * until after `wait` milliseconds have elapsed since the last invocation.
 *
 * @param fn - The function to debounce
 * @param wait - The number of milliseconds to delay
 * @returns A debounced version of the function
 */
export function debounce<TArgs extends unknown[]>(
  fn: (...args: TArgs) => void,
  wait: number
): {
  (...args: TArgs): void;
  cancel: () => void;
  flush: () => void;
} {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: TArgs | null = null;

  const debounced = (...args: TArgs): void => {
    lastArgs = args;

    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      if (lastArgs) {
        fn(...lastArgs);
        lastArgs = null;
      }
      timeoutId = null;
    }, wait);
  };

  debounced.cancel = (): void => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    lastArgs = null;
  };

  debounced.flush = (): void => {
    if (timeoutId && lastArgs) {
      clearTimeout(timeoutId);
      fn(...lastArgs);
      lastArgs = null;
      timeoutId = null;
    }
  };

  return debounced;
}

/**
 * Creates a throttled function that only invokes the provided function
 * at most once per every `wait` milliseconds.
 *
 * @param fn - The function to throttle
 * @param wait - The number of milliseconds to throttle invocations to
 * @returns A throttled version of the function
 */
export function throttle<TArgs extends unknown[]>(
  fn: (...args: TArgs) => void,
  wait: number
): {
  (...args: TArgs): void;
  cancel: () => void;
} {
  let lastCall = 0;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: TArgs | null = null;

  const throttled = (...args: TArgs): void => {
    const now = Date.now();
    const remaining = wait - (now - lastCall);

    lastArgs = args;

    if (remaining <= 0 || remaining > wait) {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      lastCall = now;
      fn(...args);
    } else if (!timeoutId) {
      timeoutId = setTimeout(() => {
        lastCall = Date.now();
        timeoutId = null;
        if (lastArgs) {
          fn(...lastArgs);
        }
      }, remaining);
    }
  };

  throttled.cancel = (): void => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    lastCall = 0;
    lastArgs = null;
  };

  return throttled;
}

/**
 * Default debounce delays for common use cases
 */
export const DEBOUNCE_DELAYS = {
  /** For search inputs */
  SEARCH: 300,
  /** For template previews */
  TEMPLATE_PREVIEW: 500,
  /** For form validation */
  VALIDATION: 200,
  /** For autosave */
  AUTOSAVE: 1000,
  /** For resize/scroll handlers */
  RESIZE: 150,
} as const;
