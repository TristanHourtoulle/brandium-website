"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import type { Hook, HookType } from "@/types";
import {
  generateHooks as generateHooksApi,
  generateHooksFromPost as generateHooksFromPostApi,
  validateRawIdea,
  sortHooksByEngagement,
} from "@/lib/api/hooks";
import { getErrorMessage, isRateLimitError, formatRateLimitMessage } from "@/lib/utils/error-handler";

interface GenerateFromIdeaOptions {
  goal?: string;
  profileId?: string;
  count?: number;
}

interface GenerateFromPostOptions {
  variants?: number;
  goal?: string;
  profileId?: string;
}

interface UseHooksState {
  hooks: Hook[];
  isLoading: boolean;
  error: string | null;
  selectedHook: Hook | null;
  lastRawIdea: string | null;
  lastPostId: string | null;
  lastOptions: GenerateFromIdeaOptions | GenerateFromPostOptions | null;
  source: "idea" | "post" | null;
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
    options?: GenerateFromIdeaOptions
  ) => Promise<Hook[] | null>;
  /** Generate hooks from an existing post */
  generateFromPost: (
    postId: string,
    options?: GenerateFromPostOptions
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
  /** Regenerate with same source (rawIdea or postId) */
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
    lastPostId: null,
    lastOptions: null,
    source: null,
  });

  const generate = useCallback(
    async (
      rawIdea: string,
      generateOptions?: GenerateFromIdeaOptions
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
        lastPostId: null,
        lastOptions: generateOptions ?? null,
        source: "idea",
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

  const generateFromPost = useCallback(
    async (
      postId: string,
      generateOptions?: GenerateFromPostOptions
    ): Promise<Hook[] | null> => {
      if (!postId) {
        const errorMsg = "Post ID is required";
        setState((prev) => ({ ...prev, error: errorMsg }));
        if (showToasts) {
          toast.error(errorMsg);
        }
        return null;
      }

      setState((prev) => ({
        ...prev,
        isLoading: true,
        error: null,
        lastRawIdea: null,
        lastPostId: postId,
        lastOptions: generateOptions ?? null,
        source: "post",
      }));

      try {
        const hooks = await generateHooksFromPostApi(postId, generateOptions);

        // Sort by engagement if enabled
        const sortedHooks = autoSort ? sortHooksByEngagement(hooks) : hooks;

        setState((prev) => ({
          ...prev,
          hooks: sortedHooks,
          isLoading: false,
          error: null,
        }));

        if (showToasts) {
          toast.success(`Generated ${hooks.length} hook suggestions from post`);
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
    if (state.source === "post" && state.lastPostId) {
      return generateFromPost(
        state.lastPostId,
        state.lastOptions as GenerateFromPostOptions | undefined
      );
    }

    if (state.source === "idea" && state.lastRawIdea) {
      return generate(
        state.lastRawIdea,
        state.lastOptions as GenerateFromIdeaOptions | undefined
      );
    }

    if (showToasts) {
      toast.error("No previous generation to regenerate from");
    }
    return null;
  }, [
    state.source,
    state.lastPostId,
    state.lastRawIdea,
    state.lastOptions,
    generate,
    generateFromPost,
    showToasts,
  ]);

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
      lastPostId: null,
      lastOptions: null,
      source: null,
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
    generateFromPost,
    regenerate,
    selectHook,
    clearHooks,
    getHooksByType,
    getBestHook,
    hasHooks: state.hooks.length > 0,
  };
}
