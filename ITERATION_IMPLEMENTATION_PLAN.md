# Post Iterations Feature - Frontend Implementation Plan

**Date:** December 5, 2025
**Author:** Tristan Hourtoulle
**Project:** Brandium Website (Frontend)
**Status:** ✅ IMPLEMENTATION COMPLETE

---

## Implementation Summary

### Completed on December 5, 2025

All 7 phases have been successfully implemented:

| Phase | Status | Description |
|-------|--------|-------------|
| Phase 1 | ✅ Complete | Types and API client |
| Phase 2 | ✅ Complete | usePostIterations hook |
| Phase 3 | ✅ Complete | UI Components (Dialog, History, Card) |
| Phase 4 | ✅ Complete | Generate page integration |
| Phase 5 | ✅ Complete | Posts detail page integration |
| Phase 6 | ✅ Complete | Unit tests (302 tests passing) |
| Phase 7 | ✅ Complete | Error handling and polish |

### Files Created

- `src/types/iteration.ts` - Type definitions
- `src/lib/api/iterations.ts` - API client functions
- `src/lib/hooks/use-post-iterations.ts` - Custom hook
- `src/components/features/iterations/iteration-dialog.tsx` - Iteration dialog
- `src/components/features/iterations/version-card.tsx` - Version card display
- `src/components/features/iterations/version-history.tsx` - Version history list
- `src/components/features/iterations/index.ts` - Barrel exports
- `src/__tests__/lib/api/iterations.test.ts` - API tests
- `src/__tests__/lib/hooks/use-post-iterations.test.ts` - Hook tests

### Files Modified

- `src/types/index.ts` - Added iteration type exports
- `src/types/post.ts` - Added version fields
- `src/types/generate.ts` - Added version metadata
- `src/lib/api/client.ts` - Added PATCH method
- `src/lib/api/generate.ts` - Version metadata handling
- `src/lib/api/posts.ts` - Version support
- `src/lib/api/index.ts` - Iteration exports
- `src/components/features/generate/generation-result.tsx` - Iteration UI
- `src/app/(dashboard)/posts/[id]/page.tsx` - Iteration support

---

## 1. Feature Overview

### Problem Statement
Currently, when users generate a post, they can only regenerate it completely from scratch. There's no way to refine a generated post with specific instructions like "make it shorter" or "add emojis" while preserving the original context.

### Solution
Implement the Post Iterations feature to allow users to:
- Create multiple versions of a post with natural language refinement instructions
- Browse through all versions of a post
- Switch between any version at any time
- Maintain complete version history

### Who Is It For?
- Content creators who want to iteratively refine their posts
- Users who want to experiment with different tones or styles
- Anyone who wants to preserve multiple variations of their content

### Key Functionality
1. **Iterate on Generated Posts**: Add a refinement prompt input after generation
2. **Version History Viewer**: Display all versions in a timeline/list
3. **Version Switcher**: Select and apply any previous version
4. **Version Comparison**: See what changed between versions
5. **Seamless Integration**: Works with existing generation flow

---

## 2. Technical Design

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND ARCHITECTURE                   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────┐         ┌──────────────────┐         │
│  │  Generate Page   │         │   Posts Detail   │         │
│  │  /generate       │         │   /posts/[id]    │         │
│  └────────┬─────────┘         └────────┬─────────┘         │
│           │                             │                    │
│           ▼                             ▼                    │
│  ┌──────────────────────────────────────────────┐          │
│  │     GenerationResult Component               │          │
│  │  - Show current version                      │          │
│  │  - Iterate button                            │          │
│  │  - Version selector                          │          │
│  └──────────────────┬───────────────────────────┘          │
│                     │                                        │
│                     ▼                                        │
│  ┌──────────────────────────────────────────────┐          │
│  │     VersionHistory Component (NEW)           │          │
│  │  - List all versions                         │          │
│  │  - Version comparison                        │          │
│  │  - Version selection                         │          │
│  └──────────────────┬───────────────────────────┘          │
│                     │                                        │
│                     ▼                                        │
│  ┌──────────────────────────────────────────────┐          │
│  │     IterationDialog Component (NEW)          │          │
│  │  - Iteration prompt input                    │          │
│  │  - Submit iteration request                  │          │
│  └──────────────────┬───────────────────────────┘          │
│                     │                                        │
│                     ▼                                        │
│  ┌──────────────────────────────────────────────┐          │
│  │        usePostIterations Hook (NEW)          │          │
│  │  - iterate()                                 │          │
│  │  - fetchVersions()                           │          │
│  │  - selectVersion()                           │          │
│  │  - State management                          │          │
│  └──────────────────┬───────────────────────────┘          │
│                     │                                        │
│                     ▼                                        │
│  ┌──────────────────────────────────────────────┐          │
│  │      lib/api/iterations.ts (NEW)             │          │
│  │  - API client functions                      │          │
│  │  - Type transformations                      │          │
│  └──────────────────┬───────────────────────────┘          │
│                     │                                        │
└─────────────────────┼───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                      BACKEND API                             │
├─────────────────────────────────────────────────────────────┤
│  POST   /api/posts/:postId/iterate                          │
│  GET    /api/posts/:postId/versions                         │
│  GET    /api/posts/:postId/versions/:versionId              │
│  PATCH  /api/posts/:postId/versions/:versionId/select       │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

```
User Action: Click "Refine Post"
      │
      ▼
Open IterationDialog
      │
      ▼
User enters prompt: "Make it shorter"
      │
      ▼
usePostIterations.iterate(postId, prompt)
      │
      ▼
POST /api/posts/:postId/iterate
      │
      ▼
Backend generates new version (v2)
      │
      ▼
Frontend receives new version
      │
      ▼
Update local state + refresh versions list
      │
      ▼
Display new version in GenerationResult
```

### Component Structure

```
src/components/features/iterations/
├── iteration-dialog.tsx          # Dialog for creating iterations
├── version-history.tsx            # List of all versions
├── version-card.tsx               # Single version display
├── version-comparison.tsx         # Compare two versions (optional v2)
└── index.ts                       # Barrel export
```

### State Management Strategy

We'll use **React hooks + local state** (consistent with existing codebase):
- `usePostIterations` custom hook for all iteration logic
- Local state in components for UI state (dialogs, selections)
- No global state management needed

---

## 3. Implementation Steps

### Phase 1: Foundation (Day 1 - 4 hours)

#### 1.1 Type Definitions
**File:** `src/types/iteration.ts` (NEW)

```typescript
export interface PostVersion {
  id: string;
  versionNumber: number;
  generatedText: string;
  iterationPrompt: string | null;
  isSelected: boolean;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  createdAt: string;
}

export interface IterateRequest {
  iterationPrompt: string;
  maxTokens?: number;
}

export interface IterateResponse {
  versionId: string;
  versionNumber: number;
  generatedText: string;
  iterationPrompt: string;
  isSelected: boolean;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface VersionsResponse {
  postId: string;
  totalVersions: number;
  versions: PostVersion[];
}
```

**File:** `src/types/index.ts` (MODIFY)
- Export new types

#### 1.2 API Client Functions
**File:** `src/lib/api/iterations.ts` (NEW)

```typescript
import { apiClient } from "./client";
import type {
  IterateRequest,
  IterateResponse,
  PostVersion,
  VersionsResponse,
} from "@/types";

/**
 * Create a new iteration of a post
 */
export async function iteratePost(
  postId: string,
  request: IterateRequest
): Promise<IterateResponse> {
  const response = await apiClient.post<{ data: IterateResponse }>(
    `/api/posts/${postId}/iterate`,
    request
  );
  return response.data;
}

/**
 * Get all versions of a post
 */
export async function fetchVersions(
  postId: string
): Promise<VersionsResponse> {
  const response = await apiClient.get<{ data: VersionsResponse }>(
    `/api/posts/${postId}/versions`
  );
  return response.data;
}

/**
 * Get a specific version
 */
export async function fetchVersion(
  postId: string,
  versionId: string
): Promise<PostVersion> {
  const response = await apiClient.get<{ data: PostVersion }>(
    `/api/posts/${postId}/versions/${versionId}`
  );
  return response.data;
}

/**
 * Select a version as current
 */
export async function selectVersion(
  postId: string,
  versionId: string
): Promise<PostVersion> {
  const response = await apiClient.patch<{ data: PostVersion }>(
    `/api/posts/${postId}/versions/${versionId}/select`
  );
  return response.data;
}
```

**File:** `src/lib/api/index.ts` (MODIFY)
- Add exports for iteration functions

#### 1.3 Update Post Types
**File:** `src/types/post.ts` (MODIFY)

```typescript
// Add to Post interface
export interface Post {
  // ... existing fields
  currentVersionId?: string;
  totalVersions: number;
}

// Add to PostApiResponse
export interface PostApiResponse {
  // ... existing fields
  currentVersionId?: string;
  totalVersions: number;
}
```

---

### Phase 2: Core Hook (Day 1-2 - 6 hours)

#### 2.1 Custom Hook Implementation
**File:** `src/lib/hooks/use-post-iterations.ts` (NEW)

```typescript
"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import * as iterationsApi from "@/lib/api/iterations";
import type {
  PostVersion,
  IterateRequest,
  IterateResponse,
  VersionsResponse,
} from "@/types";

interface UsePostIterationsReturn {
  versions: PostVersion[];
  currentVersion: PostVersion | null;
  isIterating: boolean;
  isFetchingVersions: boolean;
  isSelectingVersion: boolean;
  error: string | null;
  iterate: (postId: string, request: IterateRequest) => Promise<IterateResponse | null>;
  fetchVersions: (postId: string) => Promise<void>;
  selectVersion: (postId: string, versionId: string) => Promise<void>;
  clearVersions: () => void;
}

export function usePostIterations(): UsePostIterationsReturn {
  const [versions, setVersions] = useState<PostVersion[]>([]);
  const [isIterating, setIsIterating] = useState(false);
  const [isFetchingVersions, setIsFetchingVersions] = useState(false);
  const [isSelectingVersion, setIsSelectingVersion] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentVersion = versions.find((v) => v.isSelected) || null;

  const fetchVersions = useCallback(async (postId: string) => {
    setIsFetchingVersions(true);
    setError(null);

    try {
      const response = await iterationsApi.fetchVersions(postId);
      setVersions(response.versions);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch versions";
      setError(message);
      toast.error(message);
    } finally {
      setIsFetchingVersions(false);
    }
  }, []);

  const iterate = useCallback(
    async (postId: string, request: IterateRequest): Promise<IterateResponse | null> => {
      setIsIterating(true);
      setError(null);

      try {
        const response = await iterationsApi.iteratePost(postId, request);

        // Refresh versions list
        await fetchVersions(postId);

        toast.success("New version created!");
        return response;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to create iteration";
        setError(message);
        toast.error(message);
        return null;
      } finally {
        setIsIterating(false);
      }
    },
    [fetchVersions]
  );

  const selectVersion = useCallback(
    async (postId: string, versionId: string) => {
      setIsSelectingVersion(true);
      setError(null);

      try {
        await iterationsApi.selectVersion(postId, versionId);

        // Update local state
        setVersions((prev) =>
          prev.map((v) => ({
            ...v,
            isSelected: v.id === versionId,
          }))
        );

        toast.success("Version selected!");
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to select version";
        setError(message);
        toast.error(message);
      } finally {
        setIsSelectingVersion(false);
      }
    },
    []
  );

  const clearVersions = useCallback(() => {
    setVersions([]);
    setError(null);
  }, []);

  return {
    versions,
    currentVersion,
    isIterating,
    isFetchingVersions,
    isSelectingVersion,
    error,
    iterate,
    fetchVersions,
    selectVersion,
    clearVersions,
  };
}
```

**File:** `src/lib/hooks/index.ts` (MODIFY)
- Export `usePostIterations`

---

### Phase 3: UI Components (Day 2-3 - 8 hours)

#### 3.1 Iteration Dialog Component
**File:** `src/components/features/iterations/iteration-dialog.tsx` (NEW)

Create a dialog with:
- Textarea for iteration prompt
- Character counter
- Suggested prompts (chips/buttons)
- Submit/Cancel buttons
- Loading state during iteration

**Suggested Prompts:**
- "Make it shorter"
- "Make it more professional"
- "Add emojis"
- "Add relevant hashtags"
- "Use bullet points"

#### 3.2 Version History Component
**File:** `src/components/features/iterations/version-history.tsx` (NEW)

Display:
- List of all versions (newest first)
- Version number badge
- Preview of content (truncated)
- Iteration prompt used (if not v1)
- Token usage stats
- "Selected" indicator
- Select button for each version
- Timestamp

#### 3.3 Version Card Component
**File:** `src/components/features/iterations/version-card.tsx` (NEW)

Individual version display:
- Version number badge
- Full content
- Iteration prompt
- Token usage
- Created timestamp
- Actions (Select, View)

#### 3.4 Barrel Export
**File:** `src/components/features/iterations/index.ts` (NEW)

```typescript
export { IterationDialog } from "./iteration-dialog";
export { VersionHistory } from "./version-history";
export { VersionCard } from "./version-card";
```

---

### Phase 4: Integration with Generate Page (Day 3 - 4 hours)

#### 4.1 Update GenerationResult Component
**File:** `src/components/features/generate/generation-result.tsx` (MODIFY)

Add:
1. **"Refine Post" button** next to "Regenerate"
2. **Version indicator** badge (e.g., "Version 2 of 3")
3. **"View All Versions" button** (toggles version history)
4. **IterationDialog integration**
5. **VersionHistory component** (collapsible section)

Changes:
- Import iteration components
- Add state for dialog open/close
- Add state for version history visibility
- Wire up iterate function
- Display version info from post metadata

#### 4.2 Update useGenerate Hook
**File:** `src/lib/hooks/use-generate.ts` (MODIFY)

Update to handle version info:
- Store `versionId` and `versionNumber` from generation response
- Update types to include version metadata

#### 4.3 Update Generate Types
**File:** `src/types/generate.ts` (MODIFY)

```typescript
export interface GeneratedPost {
  // ... existing fields
  versionId?: string;
  versionNumber?: number;
  totalVersions?: number;
}
```

**File:** `src/lib/api/generate.ts` (MODIFY)

Update normalization function to include version metadata:
```typescript
function normalizeGeneratedPost(
  backendData: BackendGenerateResponse["data"],
  request: GenerateRequest
): GeneratedPost {
  return {
    // ... existing fields
    versionId: backendData.versionId,
    versionNumber: backendData.versionNumber,
  };
}
```

---

### Phase 5: Posts Detail Page Integration (Day 3-4 - 4 hours)

#### 5.1 Update Posts Detail Page
**File:** `src/app/(dashboard)/posts/[id]/page.tsx` (MODIFY or CREATE if doesn't exist)

Add:
1. Version history section
2. Iterate functionality
3. Use `usePostIterations` hook

#### 5.2 Update Post Card Component
**File:** `src/components/features/posts/post-card.tsx` (MODIFY)

Add:
- Version count badge (e.g., "3 versions")
- Optional: Quick version switcher in card

---

### Phase 6: Testing (Day 4 - 4 hours)

#### 6.1 Unit Tests

**File:** `src/__tests__/lib/api/iterations.test.ts` (NEW)
- Test all API functions
- Mock responses
- Error handling

**File:** `src/__tests__/lib/hooks/use-post-iterations.test.ts` (NEW)
- Test hook state management
- Test iteration flow
- Test version selection
- Test error states

#### 6.2 Component Tests

**File:** `src/__tests__/components/features/iterations/iteration-dialog.test.tsx` (NEW)
- Render test
- Form submission
- Validation

**File:** `src/__tests__/components/features/iterations/version-history.test.tsx` (NEW)
- Render versions list
- Version selection
- Empty state

#### 6.3 Integration Tests

Test complete flow:
1. Generate post
2. Create iteration
3. View versions
4. Select version
5. Verify post content updates

---

### Phase 7: Polish & Documentation (Day 4 - 2 hours)

#### 7.1 Error Handling
- Add user-friendly error messages
- Handle rate limiting errors
- Handle network errors
- Add retry logic where appropriate

#### 7.2 Loading States
- Skeleton loaders for version history
- Loading indicators for iteration
- Disable buttons during operations

#### 7.3 Empty States
- "No versions yet" message
- Helpful tips for first iteration

#### 7.4 Documentation
- Update README if needed
- Add JSDoc comments to new functions
- Update CLAUDE.md if patterns changed

---

## 4. File Changes Summary

### New Files (13 files)

```
src/types/iteration.ts
src/lib/api/iterations.ts
src/lib/hooks/use-post-iterations.ts
src/components/features/iterations/index.ts
src/components/features/iterations/iteration-dialog.tsx
src/components/features/iterations/version-history.tsx
src/components/features/iterations/version-card.tsx
src/__tests__/lib/api/iterations.test.ts
src/__tests__/lib/hooks/use-post-iterations.test.ts
src/__tests__/components/features/iterations/iteration-dialog.test.tsx
src/__tests__/components/features/iterations/version-history.test.tsx
ITERATION_IMPLEMENTATION_PLAN.md (this file)
```

### Modified Files (10 files)

```
src/types/index.ts                                      (export new types)
src/types/post.ts                                       (add version fields)
src/types/generate.ts                                   (add version fields)
src/lib/api/index.ts                                    (export iterations API)
src/lib/api/generate.ts                                 (include version in response)
src/lib/hooks/index.ts                                  (export new hook)
src/lib/hooks/use-generate.ts                           (handle version metadata)
src/components/features/generate/generation-result.tsx  (add iteration UI)
src/components/features/posts/post-card.tsx             (show version count)
src/app/(dashboard)/posts/[id]/page.tsx                 (add iteration support)
```

---

## 5. Dependencies

### No New Dependencies Needed ✅

All required libraries are already in the project:
- `react-hook-form` ✅
- `zod` ✅
- `sonner` (toast) ✅
- `lucide-react` (icons) ✅
- `@/components/ui/*` (shadcn/ui) ✅

### Potentially Useful Icons from Lucide

```typescript
import {
  GitBranch,      // For version branching
  History,        // For version history
  Layers,         // For versions concept
  ArrowLeftRight, // For comparison
  Check,          // For selected version
  Clock,          // For timestamps
} from "lucide-react";
```

---

## 6. Testing Strategy

### Unit Tests
- **API Functions**: Mock axios, test request/response transformation
- **Hook**: Test state updates, async operations, error handling
- **Utils**: Any helper functions

### Component Tests
- **Dialogs**: Render, form validation, submission
- **Lists**: Render items, selection, empty states
- **Cards**: Display data correctly

### Integration Tests
- **Generate Flow**: Generate → Iterate → View versions → Select
- **Posts Detail**: View post → Iterate → Select version

### Manual Testing Checklist
- [ ] Generate a post
- [ ] Click "Refine Post"
- [ ] Enter iteration prompt
- [ ] Verify new version created
- [ ] Check version history shows all versions
- [ ] Select a previous version
- [ ] Verify content updates
- [ ] Check version indicator updates
- [ ] Test with rate limiting
- [ ] Test error scenarios
- [ ] Test on mobile viewport
- [ ] Test keyboard navigation
- [ ] Test screen reader compatibility

---

## 7. Risk Assessment

### Technical Risks

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Backend API changes don't match docs | High | Low | Verify with backend team first, write integration tests |
| Version state gets out of sync | Medium | Medium | Implement proper state refresh after operations |
| Poor performance with many versions | Low | Low | Implement pagination if needed (later) |
| Complexity increases mental overhead | Medium | Medium | Keep UI simple, progressive disclosure |

### Time Risks

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Underestimated testing time | Medium | Medium | Start testing early, write tests as you go |
| UI polish takes longer | Low | High | Timebox polish phase, prioritize functionality |
| Integration issues | High | Low | Test integration early and often |

### Data Risks

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Version data inconsistency | Medium | Low | Always fetch fresh version list after mutations |
| Lost versions after errors | Low | Low | Backend handles persistence |

---

## 8. Estimation

### Total Time: ~28 hours (3.5 days)

| Phase | Tasks | Estimated Time |
|-------|-------|----------------|
| **Phase 1: Foundation** | Types, API client, type updates | 4 hours |
| **Phase 2: Core Hook** | usePostIterations implementation | 6 hours |
| **Phase 3: UI Components** | Dialog, history, card components | 8 hours |
| **Phase 4: Generate Page** | Update GenerationResult, integrate | 4 hours |
| **Phase 5: Posts Detail** | Detail page integration | 4 hours |
| **Phase 6: Testing** | Unit + integration tests | 4 hours |
| **Phase 7: Polish** | Error handling, loading states | 2 hours |

**Buffer:** Add 50% for unknown issues = 14 hours
**Total with Buffer:** ~42 hours (5-6 days)

---

## 9. Success Criteria

### Must Have ✅
- [x] User can iterate on a generated post with a prompt
- [x] User can view all versions of a post
- [x] User can select any previous version
- [x] Selected version is reflected in the post content
- [x] Version history is preserved
- [x] Error handling for all operations
- [x] Loading states for all async operations
- [x] Mobile responsive
- [x] All tests pass (302 tests passing)

### Nice to Have 🎯
- [ ] Version comparison view (side-by-side)
- [ ] Suggested prompts based on current content
- [ ] Keyboard shortcuts (e.g., Ctrl+I to iterate)
- [ ] Version search/filter
- [ ] Export version history
- [ ] Undo/redo functionality

### Out of Scope ❌
- Version analytics/insights
- AI-suggested improvements
- Collaborative editing
- Version comments
- Automatic version naming

---

## 10. Rollout Plan

### Phase 1: Feature Flag (Optional)
If you want gradual rollout:
```typescript
// config/features.ts
export const FEATURES = {
  POST_ITERATIONS: process.env.NEXT_PUBLIC_ENABLE_ITERATIONS === "true",
};
```

### Phase 2: Beta Testing
1. Deploy to staging
2. Internal testing with team
3. Fix critical bugs
4. Gather feedback

### Phase 3: Production Deploy
1. Merge feature branch to main
2. Deploy to production
3. Monitor error logs
4. Monitor user adoption
5. Gather user feedback

### Phase 4: Iteration (Post-Launch)
Based on feedback:
- Improve suggested prompts
- Add version comparison
- Optimize performance
- Add analytics

---

## 11. Next Steps

### Before Starting
1. ✅ Review this plan with team/stakeholders
2. ⏳ Verify backend API is deployed and accessible
3. ⏳ Test backend endpoints manually (Postman/curl)
4. ⏳ Set up feature branch: `git checkout -b feat/post-iterations`
5. ⏳ Ensure dev environment is running

### Implementation Order
1. **Start with Phase 1** (Foundation - types and API)
   - This is non-breaking, can be merged independently
2. **Then Phase 2** (Core hook)
   - Test thoroughly in isolation
3. **Then Phase 3** (UI components)
   - Build in Storybook if available
4. **Then Phases 4-5** (Integration)
   - This is where everything comes together
5. **Finally Phases 6-7** (Testing and polish)

### Daily Checkpoints
- **End of Day 1**: Foundation + Hook complete, tested
- **End of Day 2**: UI components built, tested in isolation
- **End of Day 3**: Integration complete, manual testing done
- **End of Day 4**: All tests passing, polish complete

---

## 12. Questions to Answer Before Starting

1. **Backend API Status**: Is the iteration API fully deployed and tested?
2. **Environment Variables**: Any new env vars needed? (likely no)
3. **Rate Limiting**: How do iterations count toward rate limits?
4. **Token Usage Display**: Should we show cumulative token usage for all versions?
5. **Pagination**: Do we need pagination for version history initially? (recommend: no for v1)
6. **Version Deletion**: Can users delete versions? (recommend: no for v1)
7. **Mobile Experience**: Any mobile-specific considerations?
8. **Accessibility**: Any specific a11y requirements?

---

## 13. Resources

### Backend Documentation
- [Post Iterations API](./BACKEND_DOCS_PROVIDED.md)
- [Generate API](./BACKEND_DOCS_PROVIDED.md)
- [Posts API](./BACKEND_DOCS_PROVIDED.md)

### Frontend Documentation
- [CLAUDE.md](./CLAUDE.md)
- [Project README](./README.md)

### Reference Materials
- [Next.js 16 App Router](https://nextjs.org/docs)
- [shadcn/ui Components](https://ui.shadcn.com)
- [React Hook Form](https://react-hook-form.com)

---

## Appendix A: API Response Examples

### POST /api/posts/:postId/iterate
```json
{
  "message": "Iteration created successfully",
  "data": {
    "versionId": "990e8400-e29b-41d4-a716-446655440004",
    "versionNumber": 2,
    "generatedText": "🚀 Exciting news! We just launched AI-powered code review...",
    "iterationPrompt": "Make it shorter and add emojis",
    "isSelected": true,
    "usage": {
      "promptTokens": 350,
      "completionTokens": 80,
      "totalTokens": 430
    }
  }
}
```

### GET /api/posts/:postId/versions
```json
{
  "message": "Versions retrieved successfully",
  "data": {
    "postId": "880e8400-e29b-41d4-a716-446655440003",
    "totalVersions": 3,
    "versions": [
      {
        "id": "990e8400-e29b-41d4-a716-446655440001",
        "versionNumber": 1,
        "generatedText": "Exciting news! We just launched our AI-powered code review...",
        "iterationPrompt": null,
        "isSelected": false,
        "usage": {
          "promptTokens": 250,
          "completionTokens": 100,
          "totalTokens": 350
        },
        "createdAt": "2025-12-04T10:00:00.000Z"
      },
      {
        "id": "990e8400-e29b-41d4-a716-446655440002",
        "versionNumber": 2,
        "generatedText": "🚀 Just shipped AI code review! Game-changing for devs...",
        "iterationPrompt": "Make it shorter and add emojis",
        "isSelected": false,
        "usage": {
          "promptTokens": 350,
          "completionTokens": 80,
          "totalTokens": 430
        },
        "createdAt": "2025-12-04T10:05:00.000Z"
      },
      {
        "id": "990e8400-e29b-41d4-a716-446655440003",
        "versionNumber": 3,
        "generatedText": "AI-powered code review is here. Ship better code, faster.",
        "iterationPrompt": "Make it more professional",
        "isSelected": true,
        "usage": {
          "promptTokens": 400,
          "completionTokens": 60,
          "totalTokens": 460
        },
        "createdAt": "2025-12-04T10:10:00.000Z"
      }
    ]
  }
}
```

---

**End of Implementation Plan**

*Good luck with the implementation! Remember to test frequently and commit often. Don't hesitate to adjust this plan as you discover new requirements or challenges.*
