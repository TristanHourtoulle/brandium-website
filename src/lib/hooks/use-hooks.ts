"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import type { Hook, HookType } from "@/types";
import {
  generateHooks as generateHooksApi,
  validateRawIdea,
  sortHooksByEngagement,
} from "@/lib/api/hooks";
import { getErrorMessage, isRateLimitError, formatRateLimitMessage } from "@/lib/utils/error-handler";

interface GenerateOptions {
  goal?: string;
  profileId?: string;
  count?: number;
}

interface UseHooksState {
  hooks: Hook[];
  isLoading: boolean;
  error: string | null;
  selectedHook: Hook | null;
  lastRawIdea: string | null;
  lastOptions: GenerateOptions | null;
}

interface UseHooksOptions {
  /** Auto-sort hooks by engagement score */
  autoSort?: boolean;
  /** Show toast notifications */
  showToasts?: boolean;
}

interface UseHooksReturn extends UseHooksState {
  /** Generate hooks for a raw idea */
  generate: (
    rawIdea: string,
    options?: { goal?: string; profileId?: string; count?: number }
  ) => Promise<Hook[] | null>;
  /** Select a hook */
  selectHook: (hook: Hook | null) => void;
  /** Clear all hooks */
  clearHooks: () => void;
  /** Get hooks by type */
  getHooksByType: (type: HookType) => Hook[];
  /** Get the best hook (highest engagement) */
  getBestHook: () => Hook | null;
  /** Check if we have hooks */
  hasHooks: boolean;
  /** Regenerate with same rawIdea */
  regenerate: () => Promise<Hook[] | null>;
}

export function useHooks(options: UseHooksOptions = {}): UseHooksReturn {
  const { autoSort = true, showToasts = true } = options;

  const [state, setState] = useState<UseHooksState>({
    hooks: [],
    isLoading: false,
    error: null,
    selectedHook: null,
    lastRawIdea: null,
    lastOptions: null,
  });

  const generate = useCallback(
    async (
      rawIdea: string,
      generateOptions?: { goal?: string; profileId?: string; count?: number }
    ): Promise<Hook[] | null> => {
      // Validate input
      const validation = validateRawIdea(rawIdea);
      if (!validation.isValid) {
        setState((prev) => ({ ...prev, error: validation.error ?? null }));
        if (showToasts) {
          toast.error(validation.error);
        }
        return null;
      }

      setState((prev) => ({
        ...prev,
        isLoading: true,
        error: null,
        lastRawIdea: rawIdea,
        lastOptions: generateOptions ?? null,
      }));

      try {
        const hooks = await generateHooksApi(rawIdea, generateOptions);

        // Sort by engagement if enabled
        const sortedHooks = autoSort ? sortHooksByEngagement(hooks) : hooks;

        setState((prev) => ({
          ...prev,
          hooks: sortedHooks,
          isLoading: false,
          error: null,
        }));

        if (showToasts) {
          toast.success(`Generated ${hooks.length} hook suggestions`);
        }

        return sortedHooks;
      } catch (error) {
        const errorMessage = isRateLimitError(error)
          ? formatRateLimitMessage(error)
          : getErrorMessage(error);

        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }));

        if (showToasts) {
          toast.error(errorMessage);
        }

        return null;
      }
    },
    [autoSort, showToasts]
  );

  const regenerate = useCallback(async (): Promise<Hook[] | null> => {
    if (!state.lastRawIdea) {
      if (showToasts) {
        toast.error("No previous idea to regenerate from");
      }
      return null;
    }
    // Pass the same options used in the last generation (including count)
    return generate(state.lastRawIdea, state.lastOptions ?? undefined);
  }, [state.lastRawIdea, state.lastOptions, generate, showToasts]);

  const selectHook = useCallback((hook: Hook | null) => {
    setState((prev) => ({ ...prev, selectedHook: hook }));
  }, []);

  const clearHooks = useCallback(() => {
    setState({
      hooks: [],
      isLoading: false,
      error: null,
      selectedHook: null,
      lastRawIdea: null,
      lastOptions: null,
    });
  }, []);

  const getHooksByType = useCallback(
    (type: HookType): Hook[] => {
      return state.hooks.filter((hook) => hook.type === type);
    },
    [state.hooks]
  );

  const getBestHook = useCallback((): Hook | null => {
    if (state.hooks.length === 0) return null;
    return sortHooksByEngagement(state.hooks)[0];
  }, [state.hooks]);

  return {
    ...state,
    generate,
    regenerate,
    selectHook,
    clearHooks,
    getHooksByType,
    getBestHook,
    hasHooks: state.hooks.length > 0,
  };
}
