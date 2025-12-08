/**
 * Accessibility utilities for screen readers and keyboard navigation
 */

/**
 * Announce a message to screen readers using an ARIA live region
 * @param message - The message to announce
 * @param priority - 'polite' waits for current speech, 'assertive' interrupts
 */
export function announceToScreenReader(
  message: string,
  priority: "polite" | "assertive" = "polite"
): void {
  if (typeof document === "undefined") return;

  // Find or create the announcer element
  let announcer = document.getElementById("sr-announcer");

  if (!announcer) {
    announcer = document.createElement("div");
    announcer.id = "sr-announcer";
    announcer.setAttribute("aria-live", priority);
    announcer.setAttribute("aria-atomic", "true");
    announcer.setAttribute("role", "status");
    announcer.className = "sr-only";
    // Style to hide visually but keep accessible
    Object.assign(announcer.style, {
      position: "absolute",
      width: "1px",
      height: "1px",
      padding: "0",
      margin: "-1px",
      overflow: "hidden",
      clip: "rect(0, 0, 0, 0)",
      whiteSpace: "nowrap",
      border: "0",
    });
    document.body.appendChild(announcer);
  }

  // Update priority if needed
  announcer.setAttribute("aria-live", priority);

  // Clear and set the message (needed for re-announcement)
  announcer.textContent = "";
  // Small delay to ensure the change is detected
  requestAnimationFrame(() => {
    if (announcer) {
      announcer.textContent = message;
    }
  });
}

/**
 * Pre-built announcements for common actions
 */
export const announcements = {
  loading: (item: string) => announceToScreenReader(`Loading ${item}...`),
  loaded: (item: string) => announceToScreenReader(`${item} loaded successfully`),
  saved: (item: string) => announceToScreenReader(`${item} saved successfully`),
  deleted: (item: string) => announceToScreenReader(`${item} deleted`),
  error: (message: string) => announceToScreenReader(`Error: ${message}`, "assertive"),
  success: (message: string) => announceToScreenReader(message),
  copied: () => announceToScreenReader("Copied to clipboard"),
  generated: (count: number, type: string) =>
    announceToScreenReader(`Generated ${count} ${type}${count !== 1 ? "s" : ""}`),
  selected: (item: string) => announceToScreenReader(`${item} selected`),
  formError: (field: string, error: string) =>
    announceToScreenReader(`${field}: ${error}`, "assertive"),
};

/**
 * Trap focus within a container element
 * Useful for modals and dialogs
 */
export function createFocusTrap(container: HTMLElement): {
  activate: () => void;
  deactivate: () => void;
} {
  const focusableSelectors = [
    "a[href]",
    "button:not([disabled])",
    "textarea:not([disabled])",
    "input:not([disabled])",
    "select:not([disabled])",
    "[tabindex]:not([tabindex='-1'])",
  ].join(", ");

  let previouslyFocused: HTMLElement | null = null;

  function getFocusableElements(): HTMLElement[] {
    return Array.from(container.querySelectorAll(focusableSelectors));
  }

  function handleKeyDown(event: KeyboardEvent): void {
    if (event.key !== "Tab") return;

    const focusableElements = getFocusableElements();
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey) {
      // Shift + Tab: go to previous element
      if (document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }
    } else {
      // Tab: go to next element
      if (document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }
  }

  return {
    activate() {
      previouslyFocused = document.activeElement as HTMLElement;
      container.addEventListener("keydown", handleKeyDown);

      // Focus first focusable element
      const focusableElements = getFocusableElements();
      if (focusableElements.length > 0) {
        focusableElements[0].focus();
      }
    },
    deactivate() {
      container.removeEventListener("keydown", handleKeyDown);

      // Restore focus to previously focused element
      if (previouslyFocused && previouslyFocused.focus) {
        previouslyFocused.focus();
      }
    },
  };
}

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Generate a unique ID for ARIA relationships
 */
let idCounter = 0;
export function generateAriaId(prefix: string = "aria"): string {
  idCounter += 1;
  return `${prefix}-${idCounter}`;
}

/**
 * Keyboard key codes for consistent handling
 */
export const Keys = {
  Enter: "Enter",
  Space: " ",
  Escape: "Escape",
  ArrowUp: "ArrowUp",
  ArrowDown: "ArrowDown",
  ArrowLeft: "ArrowLeft",
  ArrowRight: "ArrowRight",
  Home: "Home",
  End: "End",
  Tab: "Tab",
} as const;

/**
 * Check if a key event matches a specific key
 */
export function isKey(event: KeyboardEvent, key: keyof typeof Keys): boolean {
  return event.key === Keys[key];
}

/**
 * Handle keyboard navigation for a list of items
 */
export function handleListKeyboard(
  event: KeyboardEvent,
  currentIndex: number,
  totalItems: number,
  onSelect: (index: number) => void
): void {
  let newIndex = currentIndex;

  switch (event.key) {
    case Keys.ArrowDown:
      event.preventDefault();
      newIndex = currentIndex < totalItems - 1 ? currentIndex + 1 : 0;
      break;
    case Keys.ArrowUp:
      event.preventDefault();
      newIndex = currentIndex > 0 ? currentIndex - 1 : totalItems - 1;
      break;
    case Keys.Home:
      event.preventDefault();
      newIndex = 0;
      break;
    case Keys.End:
      event.preventDefault();
      newIndex = totalItems - 1;
      break;
    default:
      return;
  }

  if (newIndex !== currentIndex) {
    onSelect(newIndex);
  }
}
