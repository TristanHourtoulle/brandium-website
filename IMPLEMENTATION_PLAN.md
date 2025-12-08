# Brandium Frontend v2.0 - Implementation Plan

**Based on:** Backend API v2.0 (feat/improve-linkedin-generation)
**Target:** Next.js 16 Frontend Integration
**Timeline:** 8-10 days for solo developer
**Last Updated:** December 7, 2024

---

## 📋 Executive Summary

This plan details the step-by-step implementation of **5 major new features** from the Brandium backend API v2.0 into the Next.js 16 frontend application.

### What's New in Backend v2.0

| Feature | Impact | Complexity | Priority |
|---------|--------|------------|----------|
| **Hook Generation** | 4 types of attention-grabbing hooks | Medium | High |
| **Template System** | Reusable post templates with variables | High | High |
| **Post Iterations** | 6 one-click post improvements | Medium | High |
| **Variant Generation** | A/B testing with 2-4 approaches | High | Medium |
| **Post Ideas** | Batch idea generation & storage | Medium | Medium |

### Breaking Changes

⚠️ **Critical Breaking Changes:**
1. `POST /api/generate` response structure changed
2. `Post` model no longer has `generatedText` field
3. New `PostVersion` model tracks iteration history
4. `GET /api/posts/:id` includes full version history

---

## 🎯 Feature Overview

### 1. Hook Generation
**Problem:** Users struggle with creating engaging post openings.
**Solution:** AI generates 4 hook types (question, stat, story, bold_opinion) with engagement scores.

**Key Functionality:**
- Generate 4 different hook approaches
- Display engagement score (1-10)
- Allow hook selection before full post generation
- Optional: Use hook as post starting point

---

### 2. Template Management
**Problem:** Users repeat similar post structures manually.
**Solution:** Template system with variable substitution (`{{variable_name}}`).

**Key Functionality:**
- Browse system, public, and personal templates
- Create custom templates with variables
- Preview template with variable substitution
- Generate posts from templates
- Duplicate and customize existing templates

---

### 3. Post Iterations
**Problem:** Posts need refinement but starting over loses context.
**Solution:** 6 specialized iteration types transform existing posts.

**Key Functionality:**
- One-click iterations: shorter, stronger_hook, more_personal, add_data, simplify, custom
- Version history tracking
- Version comparison
- Select preferred version
- Custom feedback iteration

---

### 4. Variant Generation
**Problem:** Unclear which approach will resonate best.
**Solution:** Generate 2-4 post variants with different approaches simultaneously.

**Key Functionality:**
- 4 approaches: direct, storytelling, data-driven, emotional
- Side-by-side comparison
- Independent post tracking
- A/B testing workflow

---

### 5. Post Ideas
**Problem:** Content creators experience creative blocks.
**Solution:** Batch generate 5-10 post ideas for future use.

**Key Functionality:**
- Generate 3-20 ideas from a theme
- Browse unused ideas
- Generate post from saved idea
- Track idea usage
- Delete stale ideas

---

## 🗂️ Technical Design

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   Pages     │  │ Components  │  │   Hooks     │         │
│  │  (App Dir)  │  │   (UI)      │  │  (Logic)    │         │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘         │
│         │                │                 │                 │
│         └────────────────┴─────────────────┘                 │
│                          │                                   │
│                 ┌────────┴────────┐                         │
│                 │   API Client    │                         │
│                 │   (lib/api)     │                         │
│                 └────────┬────────┘                         │
└──────────────────────────┼──────────────────────────────────┘
                           │ HTTP/JSON
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend API v2.0                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Hooks   │  │Templates │  │Iterations│  │ Variants │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│  ┌──────────┐  ┌──────────────────────────────────────┐   │
│  │  Ideas   │  │         OpenAI LLM                    │   │
│  └──────────┘  └──────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

### Component Structure

```
src/
├── app/
│   ├── (dashboard)/
│   │   ├── generate/
│   │   │   ├── page.tsx                    # Main generation page
│   │   │   ├── hooks/page.tsx              # Hook generator
│   │   │   ├── variants/page.tsx           # Variant A/B testing
│   │   │   └── from-template/page.tsx      # Template-based generation
│   │   ├── posts/
│   │   │   ├── [id]/
│   │   │   │   ├── page.tsx                # Post detail with versions
│   │   │   │   ├── iterate/page.tsx        # Iteration interface
│   │   │   │   └── versions/page.tsx       # Version history
│   │   │   └── page.tsx                    # Posts list
│   │   ├── templates/
│   │   │   ├── page.tsx                    # Templates library
│   │   │   ├── new/page.tsx                # Create template
│   │   │   └── [id]/edit/page.tsx          # Edit template
│   │   └── ideas/
│   │       ├── page.tsx                    # Ideas dashboard
│   │       └── generate/page.tsx           # Generate ideas
│   └── api/                                # Next.js API routes (proxies)
│       └── backend/[...path]/route.ts      # Proxy to backend
├── components/
│   ├── features/
│   │   ├── hooks/
│   │   │   ├── HookGenerator.tsx
│   │   │   ├── HookCard.tsx
│   │   │   └── HookSelector.tsx
│   │   ├── templates/
│   │   │   ├── TemplateLibrary.tsx
│   │   │   ├── TemplateCard.tsx
│   │   │   ├── TemplateEditor.tsx
│   │   │   ├── VariableInput.tsx
│   │   │   └── TemplatePreview.tsx
│   │   ├── iterations/
│   │   │   ├── IterationPanel.tsx
│   │   │   ├── IterationButton.tsx
│   │   │   └── VersionComparison.tsx
│   │   ├── variants/
│   │   │   ├── VariantGenerator.tsx
│   │   │   ├── VariantCard.tsx
│   │   │   └── VariantComparison.tsx
│   │   ├── ideas/
│   │   │   ├── IdeaGenerator.tsx
│   │   │   ├── IdeaCard.tsx
│   │   │   ├── IdeaList.tsx
│   │   │   └── IdeaToPostFlow.tsx
│   │   └── posts/
│   │       ├── PostEditor.tsx              # MODIFIED
│   │       ├── PostVersionHistory.tsx      # NEW
│   │       └── PostDetail.tsx              # MODIFIED
│   └── ui/                                 # shadcn/ui components
├── lib/
│   ├── api/
│   │   ├── client.ts                       # Enhanced API client
│   │   ├── hooks.ts                        # Hook generation API
│   │   ├── templates.ts                    # Template management API
│   │   ├── iterations.ts                   # Iteration API
│   │   ├── variants.ts                     # Variant generation API
│   │   ├── ideas.ts                        # Ideas API
│   │   ├── posts.ts                        # MODIFIED - Posts API
│   │   └── types.ts                        # UPDATED - TypeScript types
│   ├── hooks/
│   │   ├── use-hooks.ts                    # Hook generation logic
│   │   ├── use-templates.ts                # Template management logic
│   │   ├── use-iterations.ts               # Iteration logic
│   │   ├── use-variants.ts                 # Variant generation logic
│   │   ├── use-ideas.ts                    # Ideas logic
│   │   └── use-posts.ts                    # MODIFIED - Posts logic
│   ├── services/
│   │   ├── template-service.ts             # Template business logic
│   │   ├── version-service.ts              # Version management logic
│   │   └── idea-service.ts                 # Ideas business logic
│   └── utils/
│       ├── cache.ts                        # Client-side caching
│       ├── error-handler.ts                # ENHANCED error handling
│       └── token-estimator.ts              # Token usage estimation
└── types/
    ├── api.ts                              # UPDATED - API response types
    ├── models.ts                           # UPDATED - Data models
    └── features.ts                         # NEW - Feature-specific types
```

---

### Data Flow Examples

#### Example 1: Hook Generation Flow
```
User enters rawIdea
     ↓
HookGenerator component
     ↓
useHooks hook (state management)
     ↓
lib/api/hooks.ts (API call)
     ↓
POST /api/generate/hooks
     ↓
Backend returns 4 hooks
     ↓
Display in HookCard components
     ↓
User selects hook
     ↓
Use as post starter
```

#### Example 2: Template-Based Generation
```
User browses templates
     ↓
TemplateLibrary component
     ↓
useTemplates hook
     ↓
GET /api/templates
     ↓
User selects template
     ↓
TemplateEditor with VariableInput
     ↓
Preview with POST /api/templates/:id/render
     ↓
User approves
     ↓
POST /api/generate/from-template
     ↓
New post created with version #1
```

---

## 📦 Implementation Phases

### Phase 1: Foundation & Breaking Changes (Days 1-2)

**Goal:** Fix breaking changes, update core models, enhance API client.

#### Tasks

**Day 1: Core Updates**
- [ ] Update TypeScript types for new models
  - [ ] Create `PostVersion` interface
  - [ ] Create `Template` interface
  - [ ] Create `PostIdea` interface
  - [ ] Create `HistoricalPost` interface
  - [ ] Update `Post` interface (remove `generatedText`, add `totalVersions`)
  - [ ] Create iteration/variant/hook types
- [ ] Enhance API client with retry/timeout
  - [ ] Add exponential backoff for 429 errors
  - [ ] Add timeout handling (30s for LLM calls)
  - [ ] Add request cancellation support
- [ ] Update error handling
  - [ ] Map HTTP codes to user-friendly messages
  - [ ] Add error toast system
  - [ ] Handle 429 rate limits gracefully

**Day 2: Migration & Compatibility**
- [ ] Update `POST /api/generate` calls
  - [ ] Handle new response structure (variants=1)
  - [ ] Support legacy behavior
  - [ ] Add migration notes
- [ ] Update `GET /api/posts/:id` handling
  - [ ] Parse `versions` array
  - [ ] Find selected version
  - [ ] Display version history
- [ ] Update PostEditor component
  - [ ] Replace `generatedText` with `selectedVersion.generatedText`
  - [ ] Add version switcher
  - [ ] Show version metadata
- [ ] Create PostVersionHistory component
  - [ ] List all versions
  - [ ] Display version details (iteration type, tokens, timestamp)
  - [ ] Allow version comparison
- [ ] Add version selection functionality
  - [ ] Call `PUT /api/posts/:id/versions/:versionId/select`
  - [ ] Update UI on selection

**Validation:**
- ✅ Existing posts still display correctly
- ✅ New posts show version #1 properly
- ✅ No console errors from missing fields
- ✅ Error messages are user-friendly

---

### Phase 2: Hook Generation (Day 3)

**Goal:** Implement hook generation feature end-to-end.

#### Tasks

- [ ] Create API client functions
  - [ ] `generateHooks(rawIdea, options)` in `lib/api/hooks.ts`
  - [ ] Type definitions for Hook response
- [ ] Create React hook
  - [ ] `useHooks()` in `lib/hooks/use-hooks.ts`
  - [ ] Loading state management
  - [ ] Error handling
  - [ ] Selected hook state
- [ ] Build UI components
  - [ ] `HookGenerator` - Main form (rawIdea input, goal, count)
  - [ ] `HookCard` - Display single hook with type badge, engagement score
  - [ ] `HookSelector` - Grid of 4 hooks
- [ ] Create page
  - [ ] `/app/(dashboard)/generate/hooks/page.tsx`
  - [ ] Integrate components
  - [ ] Add loading states
  - [ ] Add empty states
- [ ] Integration with post generation
  - [ ] "Use this hook" button on each card
  - [ ] Pass selected hook to post generator
  - [ ] Pre-fill rawIdea with hook text

**Validation:**
- ✅ Generates 4 different hook types
- ✅ Displays engagement scores correctly
- ✅ Loading states appear during generation (2-3s)
- ✅ Can select and use hook for post
- ✅ Error handling for invalid inputs

**UI/UX Notes:**
- Show hook type badges with different colors
- Display engagement score with star/bar visualization
- Highlight "story" type hooks (typically highest engagement)
- Add "Regenerate" button for new hooks

---

### Phase 3: Template System (Days 4-5)

**Goal:** Full template CRUD + generation workflow.

#### Day 4: Template Management

- [ ] Create API client functions
  - [ ] `getTemplates(filters)` - List templates
  - [ ] `createTemplate(data)` - Create new
  - [ ] `updateTemplate(id, data)` - Update
  - [ ] `deleteTemplate(id)` - Delete
  - [ ] `duplicateTemplate(id, name?)` - Duplicate
  - [ ] `renderTemplate(id, variables)` - Preview
  - [ ] `generateFromTemplate(templateId, variables, options)` - Generate post
- [ ] Create React hooks
  - [ ] `useTemplates()` - List/filter templates
  - [ ] `useTemplateEditor()` - Create/edit logic
  - [ ] `useTemplatePreview()` - Live preview with debounce
- [ ] Build core components
  - [ ] `TemplateLibrary` - Grid/list view with filters
  - [ ] `TemplateCard` - Display template with preview
  - [ ] `TemplateEditor` - Form for name, description, category, content, variables
  - [ ] `VariableInput` - Dynamic form for template variables
  - [ ] `TemplatePreview` - Live rendered preview

#### Day 5: Template Features

- [ ] Create pages
  - [ ] `/app/(dashboard)/templates/page.tsx` - Library
  - [ ] `/app/(dashboard)/templates/new/page.tsx` - Create
  - [ ] `/app/(dashboard)/templates/[id]/edit/page.tsx` - Edit
  - [ ] `/app/(dashboard)/generate/from-template/page.tsx` - Generate flow
- [ ] Implement filtering
  - [ ] Category filter dropdown
  - [ ] System/Public/Mine tabs
  - [ ] Search by name/description
- [ ] Variable management
  - [ ] Parse `{{variables}}` from content
  - [ ] Validate variables match content
  - [ ] Required vs optional variables
  - [ ] Default values
- [ ] Template usage workflow
  - [ ] Select template → Fill variables → Preview → Generate
  - [ ] Track usage count
  - [ ] Show popular templates

**Validation:**
- ✅ Can create template with variables
- ✅ Variables are validated against content
- ✅ Preview updates in real-time (debounced)
- ✅ Can duplicate system templates
- ✅ Generate post from template creates PostVersion
- ✅ Usage count increments correctly

**UI/UX Notes:**
- Color-code template categories
- Show usage count badge
- Highlight required variables
- Provide example values for each variable
- Add template suggestions based on rawIdea

---

### Phase 4: Post Iterations (Day 6)

**Goal:** One-click post refinement with version history.

#### Tasks

- [ ] Create API client functions
  - [ ] `iteratePost(postId, type, feedback?)` in `lib/api/iterations.ts`
  - [ ] `selectVersion(postId, versionId)` in `lib/api/posts.ts`
- [ ] Create React hook
  - [ ] `useIterations(postId)` in `lib/hooks/use-iterations.ts`
  - [ ] Track loading state per iteration type
  - [ ] Handle version history updates
- [ ] Build components
  - [ ] `IterationPanel` - Sidebar with 6 iteration buttons
  - [ ] `IterationButton` - Button with icon, label, loading state
  - [ ] `VersionComparison` - Side-by-side version comparison
  - [ ] `VersionHistory` - Timeline of all versions
- [ ] Update PostDetail page
  - [ ] Add IterationPanel to post editor
  - [ ] Show version switcher
  - [ ] Display version metadata (iteration type, tokens, timestamp)
- [ ] Custom iteration flow
  - [ ] Modal for custom feedback input
  - [ ] Submit custom iteration
  - [ ] Display custom prompt used

**Iteration Types UI:**

| Type | Icon | Color | Description |
|------|------|-------|-------------|
| `shorter` | ✂️ | Blue | Reduce by ~30% |
| `stronger_hook` | 🎣 | Green | Better opening |
| `more_personal` | 💭 | Purple | Add story |
| `add_data` | 📊 | Orange | Add stats |
| `simplify` | 🔍 | Yellow | Remove jargon |
| `custom` | ✏️ | Gray | Your feedback |

**Validation:**
- ✅ Each iteration creates new version
- ✅ Version numbers increment correctly
- ✅ Can select any version as current
- ✅ Custom feedback iteration works
- ✅ Version comparison shows differences
- ✅ Loading states prevent double-clicks

**UI/UX Notes:**
- Disable iteration buttons while generating
- Show estimated time for each iteration
- Highlight version differences with diff view
- Add "Undo" to revert to previous version
- Show token cost for each iteration

---

### Phase 5: Variant Generation (Day 7)

**Goal:** A/B testing with multiple post approaches.

#### Tasks

- [ ] Update API client
  - [ ] Modify `generatePost()` to accept `variants` parameter
  - [ ] Handle different response structures (variants=1 vs variants>=2)
- [ ] Create React hook
  - [ ] `useVariants()` in `lib/hooks/use-variants.ts`
  - [ ] Manage multiple variant posts
  - [ ] Track selected variant
- [ ] Build components
  - [ ] `VariantGenerator` - Form with variant count selector (1-4)
  - [ ] `VariantCard` - Display single variant with approach badge
  - [ ] `VariantComparison` - Side-by-side comparison of all variants
- [ ] Create page
  - [ ] `/app/(dashboard)/generate/variants/page.tsx`
  - [ ] Variant count selector
  - [ ] Generate button with cost estimate
  - [ ] Comparison view
- [ ] Approach visualization
  - [ ] Color-code each approach
  - [ ] Show approach characteristics (temperature, style)
  - [ ] Display token usage per variant

**Approach UI Design:**

| Approach | Color | Badge | Description |
|----------|-------|-------|-------------|
| `direct` | Blue | 📌 | Concise, factual |
| `storytelling` | Purple | 📖 | Narrative, personal |
| `data-driven` | Orange | 📊 | Stats, research |
| `emotional` | Pink | 💖 | Empathetic, inspiring |

**Validation:**
- ✅ Generates 2-4 independent posts
- ✅ Each variant has different approach
- ✅ Can select favorite variant
- ✅ Variants are stored as separate posts
- ✅ Cost estimate is accurate

**UI/UX Notes:**
- Show cost estimate before generation
- Default to 2 variants (recommended for A/B)
- Add "Generate more variants" button
- Highlight recommended approach based on goal
- Show performance prediction per approach

---

### Phase 6: Post Ideas (Day 8)

**Goal:** Creative block solution with idea generation & storage.

#### Tasks

- [ ] Create API client functions
  - [ ] `generateIdeas(theme, options)` in `lib/api/ideas.ts`
  - [ ] `getIdeas(filters)` - List ideas
  - [ ] `useIdea(ideaId, options)` - Generate post from idea
  - [ ] `deleteIdea(ideaId)` - Delete idea
- [ ] Create React hooks
  - [ ] `useIdeas()` - List/filter ideas
  - [ ] `useIdeaGenerator()` - Generate ideas
  - [ ] `useIdeaToPost()` - Convert idea to post
- [ ] Build components
  - [ ] `IdeaGenerator` - Form (theme, goal, count)
  - [ ] `IdeaCard` - Display idea with title, description, relevance score, tags
  - [ ] `IdeaList` - Grid of ideas with filters
  - [ ] `IdeaToPostFlow` - Modal to generate post from idea
- [ ] Create pages
  - [ ] `/app/(dashboard)/ideas/page.tsx` - Ideas dashboard
  - [ ] `/app/(dashboard)/ideas/generate/page.tsx` - Generate ideas
- [ ] Filtering & organization
  - [ ] Filter by used/unused
  - [ ] Sort by relevance score
  - [ ] Search by title/tags
  - [ ] Bulk actions (delete unused)

**Validation:**
- ✅ Generates 5-10 ideas from theme
- ✅ Ideas are saved automatically
- ✅ Can generate post from saved idea
- ✅ Idea marked as used after generation
- ✅ Can delete unused ideas
- ✅ Relevance score displays correctly

**UI/UX Notes:**
- Show relevance score with stars (1-10)
- Color-code tags
- Highlight unused ideas
- Show "Used on [date]" badge
- Add "Quick generate" button on each card
- Batch generation for weekly content planning

---

### Phase 7: Polish & Optimization (Day 9)

**Goal:** Performance, UX improvements, error handling.

#### Tasks

- [ ] Implement caching
  - [ ] Cache templates (5 min TTL)
  - [ ] Cache profiles/platforms (10 min TTL)
  - [ ] Cache ideas list (3 min TTL)
- [ ] Add loading states
  - [ ] Skeleton loaders for lists
  - [ ] Progress indicators for LLM calls
  - [ ] Optimistic UI updates
- [ ] Enhance error handling
  - [ ] User-friendly error messages
  - [ ] Retry mechanisms for 429 errors
  - [ ] Offline detection
- [ ] Performance optimizations
  - [ ] Debounce template preview (500ms)
  - [ ] Lazy load components
  - [ ] Virtualized lists for large datasets
- [ ] Add analytics
  - [ ] Track feature usage
  - [ ] Monitor token consumption
  - [ ] Track generation times
- [ ] Accessibility improvements
  - [ ] ARIA labels for all interactive elements
  - [ ] Keyboard navigation
  - [ ] Focus management
  - [ ] Screen reader announcements

**Validation:**
- ✅ No unnecessary API calls
- ✅ Loading states prevent user confusion
- ✅ Errors are actionable (e.g., "Retry in 30s")
- ✅ App works offline (cached data)
- ✅ Lighthouse accessibility score > 90

---

### Phase 8: Testing & Documentation (Day 10)

**Goal:** Comprehensive testing, documentation, deployment preparation.

#### Tasks

- [ ] Unit tests
  - [ ] Test all API client functions
  - [ ] Test React hooks
  - [ ] Test utility functions
- [ ] Integration tests
  - [ ] Test complete workflows (idea → post)
  - [ ] Test error scenarios
  - [ ] Test variant generation flow
- [ ] Component tests
  - [ ] Test all feature components
  - [ ] Test loading/error states
  - [ ] Test user interactions
- [ ] E2E tests
  - [ ] Hook generation flow
  - [ ] Template creation flow
  - [ ] Iteration workflow
  - [ ] Variant comparison flow
- [ ] Documentation
  - [ ] Update README with new features
  - [ ] Add API integration guide
  - [ ] Create user guide for each feature
  - [ ] Document environment variables
- [ ] Deployment preparation
  - [ ] Environment variable setup
  - [ ] Build verification
  - [ ] Performance testing
  - [ ] Staging deployment

**Validation:**
- ✅ Test coverage > 80%
- ✅ All E2E tests pass
- ✅ Build succeeds without warnings
- ✅ Performance budget met (< 3s LCP)
- ✅ Documentation is complete

---

## 🗂️ File Changes Summary

### New Files (~35)

**API Client:**
```
lib/api/hooks.ts
lib/api/templates.ts
lib/api/iterations.ts
lib/api/variants.ts
lib/api/ideas.ts
```

**React Hooks:**
```
lib/hooks/use-hooks.ts
lib/hooks/use-templates.ts
lib/hooks/use-iterations.ts
lib/hooks/use-variants.ts
lib/hooks/use-ideas.ts
lib/hooks/use-template-editor.ts
lib/hooks/use-template-preview.ts
```

**Services:**
```
lib/services/template-service.ts
lib/services/version-service.ts
lib/services/idea-service.ts
```

**Components:**
```
components/features/hooks/HookGenerator.tsx
components/features/hooks/HookCard.tsx
components/features/hooks/HookSelector.tsx
components/features/templates/TemplateLibrary.tsx
components/features/templates/TemplateCard.tsx
components/features/templates/TemplateEditor.tsx
components/features/templates/VariableInput.tsx
components/features/templates/TemplatePreview.tsx
components/features/iterations/IterationPanel.tsx
components/features/iterations/IterationButton.tsx
components/features/iterations/VersionComparison.tsx
components/features/variants/VariantGenerator.tsx
components/features/variants/VariantCard.tsx
components/features/variants/VariantComparison.tsx
components/features/ideas/IdeaGenerator.tsx
components/features/ideas/IdeaCard.tsx
components/features/ideas/IdeaList.tsx
components/features/ideas/IdeaToPostFlow.tsx
components/features/posts/PostVersionHistory.tsx
```

**Pages:**
```
app/(dashboard)/generate/hooks/page.tsx
app/(dashboard)/generate/variants/page.tsx
app/(dashboard)/generate/from-template/page.tsx
app/(dashboard)/posts/[id]/iterate/page.tsx
app/(dashboard)/posts/[id]/versions/page.tsx
app/(dashboard)/templates/page.tsx
app/(dashboard)/templates/new/page.tsx
app/(dashboard)/templates/[id]/edit/page.tsx
app/(dashboard)/ideas/page.tsx
app/(dashboard)/ideas/generate/page.tsx
```

**Types:**
```
types/features.ts
```

**Utils:**
```
lib/utils/cache.ts
lib/utils/token-estimator.ts
```

---

### Modified Files (~10)

**Types:**
```
types/models.ts          # Add PostVersion, Template, PostIdea, HistoricalPost
types/api.ts             # Update API response types
```

**API Client:**
```
lib/api/client.ts        # Add retry, timeout, cancel support
lib/api/posts.ts         # Handle new Post structure with versions
lib/api/types.ts         # Add new model types
```

**Components:**
```
components/features/posts/PostEditor.tsx     # Use selectedVersion instead of post.generatedText
components/features/posts/PostDetail.tsx     # Add version history display
```

**Hooks:**
```
lib/hooks/use-posts.ts   # Handle versions array
```

**Utils:**
```
lib/utils/error-handler.ts    # Add 429 handling, better error messages
```

---

## 📚 Dependencies

### New Packages to Install

```bash
# Client-side caching
pnpm add @tanstack/react-query

# Form handling (if not already installed)
pnpm add react-hook-form zod @hookform/resolvers

# Diff visualization (for version comparison)
pnpm add react-diff-viewer-continued

# Debouncing
pnpm add lodash.debounce
pnpm add -D @types/lodash.debounce

# Token estimation (optional)
pnpm add gpt-tokenizer

# Rich text editing (for template content)
pnpm add @tiptap/react @tiptap/starter-kit
```

---

## 🌍 Environment Variables

### Required

```bash
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:3001

# Optional: Feature flags
NEXT_PUBLIC_ENABLE_HOOKS=true
NEXT_PUBLIC_ENABLE_TEMPLATES=true
NEXT_PUBLIC_ENABLE_ITERATIONS=true
NEXT_PUBLIC_ENABLE_VARIANTS=true
NEXT_PUBLIC_ENABLE_IDEAS=true

# Optional: Rate limiting
NEXT_PUBLIC_MAX_VARIANTS=4
NEXT_PUBLIC_MAX_IDEAS=20

# Optional: Analytics
NEXT_PUBLIC_ANALYTICS_ID=your-analytics-id
```

---

## 🧪 Testing Strategy

### Unit Tests (Vitest)

**API Client Functions:**
```typescript
// lib/api/hooks.test.ts
describe('generateHooks', () => {
  it('should generate 4 hooks by default', async () => {
    const hooks = await generateHooks('Test idea');
    expect(hooks).toHaveLength(4);
    expect(hooks[0]).toHaveProperty('type');
    expect(hooks[0]).toHaveProperty('text');
    expect(hooks[0]).toHaveProperty('estimatedEngagement');
  });

  it('should handle custom count', async () => {
    const hooks = await generateHooks('Test idea', { count: 2 });
    expect(hooks).toHaveLength(2);
  });

  it('should throw on validation error', async () => {
    await expect(generateHooks('')).rejects.toThrow('Validation Error');
  });
});
```

**React Hooks:**
```typescript
// lib/hooks/use-hooks.test.ts
describe('useHooks', () => {
  it('should manage loading state', async () => {
    const { result } = renderHook(() => useHooks());

    act(() => {
      result.current.generate('Test idea');
    });

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });
});
```

---

### Integration Tests

**Template Workflow:**
```typescript
describe('Template workflow', () => {
  it('should create template and generate post', async () => {
    // 1. Create template
    const template = await createTemplate({
      name: 'Test Template',
      category: 'announcement',
      content: 'Hello {{name}}!',
      variables: [{ name: 'name', required: true }]
    });

    // 2. Render preview
    const preview = await renderTemplate(template.id, { name: 'World' });
    expect(preview.rendered).toBe('Hello World!');

    // 3. Generate post
    const post = await generateFromTemplate(template.id, { name: 'World' });
    expect(post.version.generatedText).toContain('World');
  });
});
```

---

### Component Tests

**HookGenerator:**
```typescript
describe('HookGenerator', () => {
  it('should render form and submit', async () => {
    const { getByLabelText, getByRole } = render(<HookGenerator />);

    const input = getByLabelText('Post Idea');
    await userEvent.type(input, 'Test idea');

    const button = getByRole('button', { name: /generate/i });
    await userEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/question/i)).toBeInTheDocument();
    });
  });
});
```

---

### E2E Tests (Playwright)

**Full Iteration Workflow:**
```typescript
test('Iteration workflow', async ({ page }) => {
  // 1. Generate initial post
  await page.goto('/generate');
  await page.fill('[name="rawIdea"]', 'Test post idea');
  await page.click('button:has-text("Generate")');

  // 2. Wait for post
  await page.waitForSelector('[data-testid="generated-post"]');
  const postId = await page.getAttribute('[data-testid="post-id"]', 'data-id');

  // 3. Navigate to post detail
  await page.goto(`/posts/${postId}`);

  // 4. Click "Make Shorter" iteration
  await page.click('button:has-text("Make Shorter")');
  await page.waitForSelector('[data-testid="version-2"]');

  // 5. Verify new version created
  const versions = await page.locator('[data-testid^="version-"]').count();
  expect(versions).toBe(2);

  // 6. Select version 2
  await page.click('[data-testid="version-2"] button:has-text("Select")');

  // 7. Verify selection
  const selected = await page.getAttribute('[data-testid="version-2"]', 'data-selected');
  expect(selected).toBe('true');
});
```

---

## 🚀 Rollout Plan

### Phase 1: Internal Testing (Week 1)
- Deploy to staging environment
- Internal team testing
- Bug fixes and adjustments
- Performance tuning

### Phase 2: Beta Release (Week 2)
- Feature flags enabled for beta users
- Collect feedback
- Monitor error rates and performance
- Iterate on UX issues

### Phase 3: Gradual Rollout (Week 3)
- Enable for 25% of users (Day 1-2)
- Monitor metrics, fix issues
- Enable for 50% of users (Day 3-4)
- Monitor metrics
- Enable for 100% of users (Day 5-7)

### Phase 4: Full Launch (Week 4)
- Remove feature flags
- Marketing announcement
- Update documentation
- Monitor support tickets

---

## 📊 Success Metrics

### Technical Metrics
- **API Error Rate:** < 1%
- **Average Response Time:** < 3s for LLM calls
- **Cache Hit Rate:** > 70%
- **Test Coverage:** > 80%

### User Metrics
- **Hook Generation Adoption:** > 40% of posts use hooks
- **Template Usage:** > 30% of posts from templates
- **Iteration Usage:** Average 2 iterations per post
- **Variant Testing:** > 20% of users try variants
- **Ideas Generated:** Average 10 ideas/week per active user

### Performance Metrics
- **LCP (Largest Contentful Paint):** < 2.5s
- **FID (First Input Delay):** < 100ms
- **CLS (Cumulative Layout Shift):** < 0.1
- **Time to Interactive:** < 3.5s

---

## ⚠️ Risks & Mitigation

### Risk 1: LLM Rate Limits
**Impact:** High
**Probability:** Medium

**Mitigation:**
- Implement exponential backoff with retry
- Show user-friendly "Please wait 30s" messages
- Queue requests on client-side
- Monitor usage patterns

### Risk 2: High Token Costs
**Impact:** Medium
**Probability:** High

**Mitigation:**
- Educate users on token costs
- Show cost estimates before generation
- Implement daily limits per user
- Use caching aggressively
- Prompt users to use templates (cheaper)

### Risk 3: Breaking Changes Impact
**Impact:** High
**Probability:** Low

**Mitigation:**
- Comprehensive testing of all post-related features
- Backward compatibility for 1 version
- Clear migration guide for users
- Rollback plan prepared

### Risk 4: Complex UI Overwhelms Users
**Impact:** Medium
**Probability:** Medium

**Mitigation:**
- Progressive disclosure (hide advanced features)
- Onboarding tooltips
- Feature flags to control rollout
- User testing before launch

---

## 🎯 Next Steps

### Immediate (This Week)
1. Review and approve this plan
2. Set up feature branch: `feat/frontend-v2-integration`
3. Install dependencies
4. Begin Phase 1 (Foundation)

### Short-term (Week 2)
5. Complete Phases 1-3 (Foundation, Hooks, Templates)
6. Internal demo and feedback
7. Adjust plan based on learnings

### Mid-term (Week 3-4)
8. Complete Phases 4-6 (Iterations, Variants, Ideas)
9. Polish and optimization
10. Testing and deployment to staging

### Long-term (Week 5+)
11. Beta release
12. Gradual rollout
13. Full launch
14. Iteration based on user feedback

---

## 📞 Support & Resources

### Documentation
- Backend API Guide: `/FRONTEND_INTEGRATION_GUIDE.md`
- Next.js 16 Docs: https://nextjs.org/docs
- shadcn/ui Docs: https://ui.shadcn.com
- React 19 Docs: https://react.dev

### Team Contacts
- Backend Team: For API questions
- Design Team: For UI/UX clarifications
- DevOps: For deployment support

### Tools & Services
- API Testing: Postman collection available
- Monitoring: Sentry for error tracking
- Analytics: PostHog for user analytics
- Performance: Lighthouse CI

---

**Plan Version:** 1.0
**Created:** December 7, 2024
**Status:** Ready for Implementation
**Estimated Completion:** 10 days (solo developer)
**Next Review:** After Phase 3 completion
