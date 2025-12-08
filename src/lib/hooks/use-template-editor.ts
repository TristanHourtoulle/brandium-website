"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { toast } from "sonner";
import type {
  Template,
  TemplateVariable,
  TemplateCategory,
  CreateTemplateRequest,
  UpdateTemplateRequest,
} from "@/types";
import {
  createTemplate as createTemplateApi,
  updateTemplate as updateTemplateApi,
  getTemplateById,
  renderTemplate as renderTemplateApi,
  parseTemplateVariables,
  renderTemplateContent,
} from "@/lib/api/templates";
import { getErrorMessage } from "@/lib/utils/error-handler";

interface TemplateFormData {
  name: string;
  description: string;
  category: TemplateCategory;
  content: string;
  variables: TemplateVariable[];
  exampleVariables: Record<string, string>;
  profileId?: string;
  platformId?: string;
  isPublic: boolean;
  tags: string[];
}

const DEFAULT_FORM_DATA: TemplateFormData = {
  name: "",
  description: "",
  category: "tip",
  content: "",
  variables: [],
  exampleVariables: {},
  isPublic: false,
  tags: [],
};

interface UseTemplateEditorState {
  formData: TemplateFormData;
  isDirty: boolean;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  preview: string;
  parsedVariables: string[];
  validationErrors: Record<string, string>;
}

interface UseTemplateEditorOptions {
  /** Template ID to edit (null for create) */
  templateId?: string | null;
  /** Show toast notifications */
  showToasts?: boolean;
  /** Debounce delay for preview (ms) */
  previewDebounce?: number;
}

interface UseTemplateEditorReturn extends UseTemplateEditorState {
  /** Update a form field */
  updateField: <K extends keyof TemplateFormData>(
    field: K,
    value: TemplateFormData[K]
  ) => void;
  /** Update content and auto-parse variables */
  updateContent: (content: string) => void;
  /** Add a variable */
  addVariable: (variable: TemplateVariable) => void;
  /** Update a variable */
  updateVariable: (index: number, variable: Partial<TemplateVariable>) => void;
  /** Remove a variable */
  removeVariable: (index: number) => void;
  /** Sync variables with parsed content */
  syncVariables: () => void;
  /** Update example variable value */
  updateExampleVariable: (name: string, value: string) => void;
  /** Add a tag */
  addTag: (tag: string) => void;
  /** Remove a tag */
  removeTag: (tag: string) => void;
  /** Validate form */
  validate: () => boolean;
  /** Save template (create or update) */
  save: () => Promise<Template | null>;
  /** Reset form */
  reset: () => void;
  /** Render preview from server */
  refreshPreview: () => Promise<void>;
  /** Check if form is valid */
  isValid: boolean;
  /** Check if this is edit mode */
  isEditMode: boolean;
}

export function useTemplateEditor(
  options: UseTemplateEditorOptions = {}
): UseTemplateEditorReturn {
  const { templateId = null, showToasts = true, previewDebounce = 300 } = options;

  const [state, setState] = useState<UseTemplateEditorState>({
    formData: DEFAULT_FORM_DATA,
    isDirty: false,
    isLoading: !!templateId,
    isSaving: false,
    error: null,
    preview: "",
    parsedVariables: [],
    validationErrors: {},
  });

  const previewTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isEditMode = !!templateId;

  // Load existing template
  useEffect(() => {
    if (!templateId) return;

    const loadTemplate = async () => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const template = await getTemplateById(templateId);
        const parsedVariables = parseTemplateVariables(template.content);

        setState((prev) => ({
          ...prev,
          formData: {
            name: template.name,
            description: template.description ?? "",
            category: template.category,
            content: template.content,
            variables: template.variables,
            exampleVariables: template.exampleVariables ?? {},
            profileId: template.profileId ?? undefined,
            platformId: template.platformId ?? undefined,
            isPublic: template.isPublic,
            tags: template.tags,
          },
          isLoading: false,
          parsedVariables,
          preview: renderTemplateContent(
            template.content,
            template.exampleVariables ?? {}
          ),
        }));
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }));
        if (showToasts) {
          toast.error(errorMessage);
        }
      }
    };

    loadTemplate();
  }, [templateId, showToasts]);

  // Update preview when content or example variables change
  useEffect(() => {
    if (previewTimeoutRef.current) {
      clearTimeout(previewTimeoutRef.current);
    }

    previewTimeoutRef.current = setTimeout(() => {
      const preview = renderTemplateContent(
        state.formData.content,
        state.formData.exampleVariables
      );
      setState((prev) => ({ ...prev, preview }));
    }, previewDebounce);

    return () => {
      if (previewTimeoutRef.current) {
        clearTimeout(previewTimeoutRef.current);
      }
    };
  }, [state.formData.content, state.formData.exampleVariables, previewDebounce]);

  const updateField = useCallback(
    <K extends keyof TemplateFormData>(field: K, value: TemplateFormData[K]) => {
      setState((prev) => ({
        ...prev,
        formData: { ...prev.formData, [field]: value },
        isDirty: true,
        validationErrors: { ...prev.validationErrors, [field]: "" },
      }));
    },
    []
  );

  const updateContent = useCallback((content: string) => {
    const parsedVariables = parseTemplateVariables(content);

    setState((prev) => {
      // Auto-sync variables: keep existing ones, add new ones
      const existingVariables = new Map(
        prev.formData.variables.map((v) => [v.name, v])
      );

      const syncedVariables = parsedVariables.map((name) => {
        const existing = existingVariables.get(name);
        if (existing) return existing;
        // Generate a default description from the variable name (e.g., "callToAction" -> "Call to action")
        const defaultDescription = name
          .replace(/([A-Z])/g, " $1")
          .replace(/^./, (str) => str.toUpperCase())
          .trim();
        return {
          name,
          description: defaultDescription,
          required: true,
          defaultValue: undefined,
        };
      });

      return {
        ...prev,
        formData: { ...prev.formData, content, variables: syncedVariables },
        parsedVariables,
        isDirty: true,
        validationErrors: { ...prev.validationErrors, content: "" },
      };
    });
  }, []);

  const addVariable = useCallback((variable: TemplateVariable) => {
    setState((prev) => ({
      ...prev,
      formData: {
        ...prev.formData,
        variables: [...prev.formData.variables, variable],
      },
      isDirty: true,
    }));
  }, []);

  const updateVariable = useCallback(
    (index: number, update: Partial<TemplateVariable>) => {
      setState((prev) => {
        const variables = [...prev.formData.variables];
        variables[index] = { ...variables[index], ...update };
        return {
          ...prev,
          formData: { ...prev.formData, variables },
          isDirty: true,
        };
      });
    },
    []
  );

  const removeVariable = useCallback((index: number) => {
    setState((prev) => {
      const variables = prev.formData.variables.filter((_, i) => i !== index);
      return {
        ...prev,
        formData: { ...prev.formData, variables },
        isDirty: true,
      };
    });
  }, []);

  const syncVariables = useCallback(() => {
    setState((prev) => {
      const existingVariables = new Map(
        prev.formData.variables.map((v) => [v.name, v])
      );

      const syncedVariables = prev.parsedVariables.map((name) => {
        const existing = existingVariables.get(name);
        if (existing) return existing;
        // Generate a default description from the variable name
        const defaultDescription = name
          .replace(/([A-Z])/g, " $1")
          .replace(/^./, (str) => str.toUpperCase())
          .trim();
        return {
          name,
          description: defaultDescription,
          required: true,
          defaultValue: undefined,
        };
      });

      return {
        ...prev,
        formData: { ...prev.formData, variables: syncedVariables },
        isDirty: true,
      };
    });
  }, []);

  const updateExampleVariable = useCallback((name: string, value: string) => {
    setState((prev) => ({
      ...prev,
      formData: {
        ...prev.formData,
        exampleVariables: {
          ...prev.formData.exampleVariables,
          [name]: value,
        },
      },
      isDirty: true,
    }));
  }, []);

  const addTag = useCallback((tag: string) => {
    setState((prev) => {
      if (prev.formData.tags.includes(tag)) return prev;
      return {
        ...prev,
        formData: {
          ...prev.formData,
          tags: [...prev.formData.tags, tag],
        },
        isDirty: true,
      };
    });
  }, []);

  const removeTag = useCallback((tag: string) => {
    setState((prev) => ({
      ...prev,
      formData: {
        ...prev.formData,
        tags: prev.formData.tags.filter((t) => t !== tag),
      },
      isDirty: true,
    }));
  }, []);

  const validate = useCallback((): boolean => {
    const errors: Record<string, string> = {};

    if (!state.formData.name.trim()) {
      errors.name = "Name is required";
    }

    if (!state.formData.content.trim()) {
      errors.content = "Content is required";
    }

    // Check if all parsed variables have definitions
    const definedVarNames = state.formData.variables.map((v) => v.name);
    const missingDefinitions = state.parsedVariables.filter(
      (v) => !definedVarNames.includes(v)
    );

    if (missingDefinitions.length > 0) {
      errors.variables = `Missing variable definitions: ${missingDefinitions.join(", ")}`;
    }

    // Check if all variables have descriptions (required by backend)
    const variablesWithoutDescription = state.formData.variables
      .filter((v) => !v.description?.trim())
      .map((v) => v.name);

    if (variablesWithoutDescription.length > 0) {
      errors.variables = `Missing descriptions for: ${variablesWithoutDescription.join(", ")}`;
    }

    setState((prev) => ({ ...prev, validationErrors: errors }));

    return Object.keys(errors).length === 0;
  }, [state.formData, state.parsedVariables]);

  const save = useCallback(async (): Promise<Template | null> => {
    if (!validate()) {
      if (showToasts) {
        toast.error("Please fix validation errors");
      }
      return null;
    }

    setState((prev) => ({ ...prev, isSaving: true, error: null }));

    try {
      const request: CreateTemplateRequest | UpdateTemplateRequest = {
        name: state.formData.name,
        description: state.formData.description || undefined,
        category: state.formData.category,
        content: state.formData.content,
        variables: state.formData.variables,
        exampleVariables: Object.keys(state.formData.exampleVariables).length > 0
          ? state.formData.exampleVariables
          : undefined,
        profileId: state.formData.profileId,
        platformId: state.formData.platformId,
        isPublic: state.formData.isPublic,
        tags: state.formData.tags.length > 0 ? state.formData.tags : undefined,
      };

      let template: Template;

      if (isEditMode && templateId) {
        template = await updateTemplateApi(templateId, request);
        if (showToasts) {
          toast.success("Template updated");
        }
      } else {
        template = await createTemplateApi(request as CreateTemplateRequest);
        if (showToasts) {
          toast.success("Template created");
        }
      }

      setState((prev) => ({
        ...prev,
        isSaving: false,
        isDirty: false,
      }));

      return template;
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      setState((prev) => ({
        ...prev,
        isSaving: false,
        error: errorMessage,
      }));
      if (showToasts) {
        toast.error(errorMessage);
      }
      return null;
    }
  }, [state.formData, validate, isEditMode, templateId, showToasts]);

  const reset = useCallback(() => {
    setState({
      formData: DEFAULT_FORM_DATA,
      isDirty: false,
      isLoading: false,
      isSaving: false,
      error: null,
      preview: "",
      parsedVariables: [],
      validationErrors: {},
    });
  }, []);

  const refreshPreview = useCallback(async () => {
    if (!templateId) return;

    try {
      const result = await renderTemplateApi(
        templateId,
        state.formData.exampleVariables
      );
      setState((prev) => ({ ...prev, preview: result.rendered }));
    } catch {
      // Fall back to client-side preview
      const preview = renderTemplateContent(
        state.formData.content,
        state.formData.exampleVariables
      );
      setState((prev) => ({ ...prev, preview }));
    }
  }, [templateId, state.formData.content, state.formData.exampleVariables]);

  const isValid = useMemo(() => {
    // Basic required fields
    if (!state.formData.name.trim() || !state.formData.content.trim()) {
      return false;
    }

    // Check if all parsed variables have definitions
    const definedVarNames = state.formData.variables.map((v) => v.name);
    const missingDefinitions = state.parsedVariables.filter(
      (v) => !definedVarNames.includes(v)
    );

    if (missingDefinitions.length > 0) {
      return false;
    }

    // Check if all variables have descriptions (required by backend)
    const missingDescriptions = state.formData.variables.some(
      (v) => !v.description?.trim()
    );

    return !missingDescriptions;
  }, [state.formData.name, state.formData.content, state.formData.variables, state.parsedVariables]);

  return {
    ...state,
    updateField,
    updateContent,
    addVariable,
    updateVariable,
    removeVariable,
    syncVariables,
    updateExampleVariable,
    addTag,
    removeTag,
    validate,
    save,
    reset,
    refreshPreview,
    isValid,
    isEditMode,
  };
}
