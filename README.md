# Brandium

[![CI](https://github.com/TristanHourtoulle/brandium-website/actions/workflows/ci.yml/badge.svg)](https://github.com/TristanHourtoulle/brandium-website/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/TristanHourtoulle/brandium-website/branch/main/graph/badge.svg)](https://codecov.io/gh/TristanHourtoulle/brandium-website)

Personal branding tool that generates personalized social media posts using AI. Build your unique voice, maintain consistency across platforms, and let AI learn your writing style.

## Table of Contents

- [Features](#features)
  - [Core Features](#core-features)
  - [Content Management](#content-management)
  - [AI-Powered Features](#ai-powered-features)
  - [User Experience](#user-experience)
- [How It Works](#how-it-works)
  - [Post Generation Flow](#post-generation-flow)
  - [Profile Analysis Flow](#profile-analysis-flow)
  - [Post Refinement Flow](#post-refinement-flow)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [API Integration](#api-integration)
- [Testing](#testing)
- [Environment Variables](#environment-variables)
- [Available Commands](#available-commands)
- [Troubleshooting](#troubleshooting)
- [License](#license)

---

## Features

### Core Features

#### Authentication and Security

- **JWT-based authentication** with secure token management
- **Protected routes** with automatic redirects for unauthenticated users
- **Session persistence** across browser sessions
- **Secure login/register** flow with form validation

#### Theme and Responsiveness

- **Dark/Light mode** with system preference detection
- **Fully responsive design** optimized for mobile, tablet, and desktop
- **Consistent UI** using shadcn/ui component library

#### Accessibility

- **Skip links** for keyboard navigation
- **ARIA labels** on interactive elements
- **Keyboard navigation** throughout the application
- **Focus management** for dialogs and modals

---

### Content Management

#### Profile Management

Profiles represent your personal brand voice. Each profile contains:

| Field | Description |
|-------|-------------|
| **Name** | Profile identifier (e.g., "Professional LinkedIn Voice") |
| **Description** | Brief description of the profile's purpose |
| **Tone** | Communication style (e.g., professional, casual, friendly) |
| **Voice Guidelines** | Detailed instructions for how content should sound |
| **Do Rules** | Things the AI should always do (e.g., "Use data to support claims") |
| **Don't Rules** | Things the AI should avoid (e.g., "Don't use buzzwords") |

**Use Cases:**

- Maintain different voices for different contexts (personal vs. professional)
- Ensure brand consistency across all generated content
- Define clear boundaries for AI-generated content

#### Platform Management

Platforms represent social media channels with their specific constraints:

| Field | Description |
|-------|-------------|
| **Name** | Platform name (e.g., LinkedIn, Twitter, Instagram) |
| **Character Limit** | Maximum post length (e.g., 280 for Twitter) |
| **Style Guidelines** | Platform-specific formatting rules |
| **Best Practices** | Tips for optimal engagement on the platform |

**Supported Platforms:**

- LinkedIn (professional networking)
- Twitter/X (short-form content)
- Instagram (visual-first content)
- Facebook (community engagement)
- Custom platforms (define your own)

#### Project Management

Projects help organize content around specific topics or campaigns:

| Field | Description |
|-------|-------------|
| **Name** | Project identifier (e.g., "Q4 Product Launch") |
| **Description** | Project context and goals |
| **Keywords** | Relevant terms for content generation |
| **Target Audience** | Who the content is for |

**Use Cases:**

- Group content by marketing campaign
- Maintain context for specific products/services
- Track content themes over time

#### Historical Posts

Import your past social media posts to help AI learn your authentic writing style:

| Feature | Description |
|---------|-------------|
| **Single Post Import** | Add posts one at a time with full metadata |
| **Bulk Import** | Import up to 100 posts at once via JSON |
| **Engagement Metrics** | Track likes, comments, shares for each post |
| **Platform Association** | Link posts to specific platforms |
| **Statistics Dashboard** | View aggregate stats across all posts |

**Why Use Historical Posts?**

- AI learns your unique writing patterns
- Generated content matches your authentic voice
- Better consistency with your existing content
- Platform-specific style adaptation

---

### AI-Powered Features

#### Post Generation

Generate personalized social media posts using AI that understands your brand:

**How It Works:**

1. Select your **Profile** (voice and rules)
2. Select your **Project** (context and keywords)
3. Select your **Platform** (format and constraints)
4. Optionally provide a **topic** or **prompt**
5. AI generates a tailored post

**Features:**

- Context-aware generation using profile, project, and platform data
- Historical posts influence for style matching
- Character limit enforcement
- Platform-specific formatting

#### Post Iterations and Refinement

Refine generated posts using natural language instructions:

**Example Prompts:**

- "Make it shorter"
- "Add more emojis"
- "Make it more professional"
- "Include a call to action"
- "Remove the hashtags"

**Version History:**

- Browse all versions of a post
- Switch between versions instantly
- Compare changes between iterations
- Restore any previous version

#### Profile Analysis

Let AI analyze your historical posts to automatically extract your writing style:

**Requirements:**

- Minimum 5 historical posts for analysis
- Posts should represent your authentic voice

**What AI Extracts:**

- **Tone Tags**: Identified communication styles
- **Do Rules**: Patterns AI should replicate
- **Don't Rules**: Patterns AI should avoid
- **Style Insights**: Unique characteristics of your writing

**Workflow:**

1. Import 5+ historical posts
2. Click "Analyze Style"
3. Review AI suggestions
4. Apply to profile or modify

#### Style Matching

When generating posts, AI automatically:

- References your historical posts for style
- Matches your established patterns
- Maintains vocabulary consistency
- Adapts to platform-specific conventions

#### Rate Limiting

Built-in rate limit tracking to manage API usage:

- Visual indicator of remaining requests
- Automatic cooldown notifications
- Usage statistics per time period

---

### User Experience

#### Guided Onboarding

New users are guided through a 4-step wizard:

| Step | Action | Purpose |
|------|--------|---------|
| 1 | Create Profile | Set up your brand voice |
| 2 | Create Project | Define your first content topic |
| 3 | Add Platform | Configure your first social channel |
| 4 | Generate Post | Create your first AI-generated content |

**Features:**

- Progress indicator
- Step validation
- Skip option for experienced users
- Celebration animation on completion

#### Dashboard

Central hub for quick actions and overview:

**Welcome Section:**

- Personalized greeting
- Quick action buttons
- Getting started tips

**Quick Actions:**

- Generate new post
- View recent posts
- Manage profiles
- Access settings

#### Post History

View, filter, search, and manage all generated posts:

**Features:**

- **Search**: Find posts by content
- **Filter**: By profile, project, platform, or date
- **Sort**: By date, platform, or engagement
- **Actions**: Copy, edit, delete, regenerate

**Post Details:**

- Full content view
- Generation metadata
- Version history access
- Iteration options

#### Notifications and Feedback

- **Toast notifications** for all actions (success, error, info)
- **Error boundaries** for graceful error handling
- **Loading skeletons** for better perceived performance
- **Confetti animation** for milestone celebrations

---

## How It Works

### Post Generation Flow

```text
┌─────────────────────────────────────────────────────────────┐
│                     User Interface                          │
│  ┌─────────┐  ┌─────────┐  ┌──────────┐  ┌───────────────┐ │
│  │ Profile │  │ Project │  │ Platform │  │ Topic (opt.)  │ │
│  └────┬────┘  └────┬────┘  └────┬─────┘  └───────┬───────┘ │
│       │            │            │                │         │
│       └────────────┴────────────┴────────────────┘         │
│                            │                                │
│                            ▼                                │
│                   ┌─────────────────┐                       │
│                   │ Generate Button │                       │
│                   └────────┬────────┘                       │
└────────────────────────────┼────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                      Backend API                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Collect Context:                                      │  │
│  │ • Profile (tone, voice, rules)                        │  │
│  │ • Project (description, keywords)                     │  │
│  │ • Platform (limits, guidelines)                       │  │
│  │ • Historical Posts (style examples)                   │  │
│  └──────────────────────────────────────────────────────┘  │
│                            │                                │
│                            ▼                                │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ AI Generation:                                        │  │
│  │ • Build prompt with all context                       │  │
│  │ • Generate content                                    │  │
│  │ • Apply platform constraints                          │  │
│  │ • Return formatted post                               │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                    Generated Post                           │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Content: "Your AI-generated post..."                  │  │
│  │ Metadata: platform, profile, project                  │  │
│  │ Context: historicalPostsUsed count                    │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  Actions: [Copy] [Refine] [Save] [Regenerate]              │
└─────────────────────────────────────────────────────────────┘
```

### Profile Analysis Flow

```text
┌─────────────────────────────────────────────────────────────┐
│                  Historical Posts Tab                       │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Stats: 12 posts │ Avg engagement: 245 │ 3 platforms  │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  [Add Post] [Bulk Import] [✨ Analyze Style]               │
│                                │                            │
└────────────────────────────────┼────────────────────────────┘
                                 │
                                 ▼
                    ┌────────────────────────┐
                    │ Check: >= 5 posts?     │
                    └───────────┬────────────┘
                                │
              ┌─────────────────┴─────────────────┐
              │                                   │
              ▼                                   ▼
     ┌────────────────┐                  ┌────────────────┐
     │ < 5 posts      │                  │ >= 5 posts     │
     │ Show error     │                  │ Start analysis │
     └────────────────┘                  └───────┬────────┘
                                                 │
                                                 ▼
                              ┌──────────────────────────────┐
                              │ AI Analysis (Backend)        │
                              │ • Analyze writing patterns   │
                              │ • Extract tone tags          │
                              │ • Identify do/don't rules    │
                              │ • Generate style insights    │
                              └──────────────┬───────────────┘
                                             │
                                             ▼
                              ┌──────────────────────────────┐
                              │ Review Dialog                │
                              │ ┌──────────────────────────┐ │
                              │ │ Suggested Tone: Casual   │ │
                              │ │ Do: Use short sentences  │ │
                              │ │ Don't: Use jargon        │ │
                              │ └──────────────────────────┘ │
                              │                              │
                              │ [Cancel]        [Apply]      │
                              └──────────────────────────────┘
                                             │
                                             ▼
                              ┌──────────────────────────────┐
                              │ Profile Updated              │
                              │ ✓ Tone applied               │
                              │ ✓ Rules added                │
                              │ ✓ Guidelines updated         │
                              └──────────────────────────────┘
```

### Post Refinement Flow

```text
┌─────────────────────────────────────────────────────────────┐
│                    Generated Post                           │
│                                                             │
│  "Your AI-generated post content here..."                  │
│                                                             │
│  [Refine Post]                                             │
└───────┬─────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────┐
│                  Refinement Dialog                          │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Current Version (v1):                                 │  │
│  │ "Your AI-generated post content here..."              │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Instruction: "Make it shorter and add emojis"        │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  [Submit Refinement]                                       │
└───────┬─────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────┐
│                  Version History                            │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ v2 (current): "Shorter post with emojis! 🚀"        │   │
│  │ v1: "Your AI-generated post content here..."        │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  [Use v2] [Use v1] [Refine Again]                          │
└─────────────────────────────────────────────────────────────┘
```

---

## Architecture

### Frontend Architecture

Brandium follows a strict **separation of concerns** pattern:

```text
User Interaction
       │
       ▼
┌─────────────────┐
│   Component     │  ← UI only (TSX)
│   (pages/)      │     • Renders UI
└────────┬────────┘     • Handles events
         │              • Calls hooks
         ▼
┌─────────────────┐
│  Custom Hook    │  ← State + Logic (TS)
│  (lib/hooks/)   │     • Manages state
└────────┬────────┘     • Handles side effects
         │              • Calls API
         ▼
┌─────────────────┐
│   API Client    │  ← HTTP calls (TS)
│   (lib/api/)    │     • Makes requests
└────────┬────────┘     • Handles errors
         │              • Returns typed data
         ▼
┌─────────────────┐
│  Backend API    │  ← External service
└─────────────────┘
```

### Code Organization Rules

| Logic Type | Location | Example |
|------------|----------|---------|
| API calls | `lib/api/*.ts` | `lib/api/posts.ts` |
| Business logic | `lib/services/*.ts` | `lib/services/auth.ts` |
| State management | `lib/hooks/*.ts` | `lib/hooks/use-posts.ts` |
| Data transformation | `lib/utils/*.ts` | `lib/utils/format.ts` |
| Validation schemas | `lib/utils/validation.ts` | Zod schemas |
| UI rendering | `components/**/*.tsx` | React components |

### Component Hierarchy

```text
app/
├── (auth)/                    # Public routes
│   ├── login/page.tsx
│   └── register/page.tsx
│
└── (dashboard)/               # Protected routes
    ├── layout.tsx             # Dashboard layout with sidebar
    ├── dashboard/page.tsx     # Main dashboard
    ├── profiles/
    │   ├── page.tsx           # Profile list
    │   ├── new/page.tsx       # Create profile
    │   └── [id]/page.tsx      # Profile detail with tabs
    ├── projects/
    │   ├── page.tsx           # Project list
    │   ├── new/page.tsx       # Create project
    │   └── [id]/page.tsx      # Project detail
    ├── platforms/
    │   ├── page.tsx           # Platform list
    │   ├── new/page.tsx       # Create platform
    │   └── [id]/page.tsx      # Platform detail
    ├── posts/
    │   ├── page.tsx           # Post history
    │   └── [id]/page.tsx      # Post detail
    └── generate/page.tsx      # Post generation
```

### State Management

**Pattern**: React Context + Custom Hooks (SWR-like)

```typescript
// Each hook manages its own state
const { posts, isLoading, error, createPost, deletePost } = usePosts();
const { profile, updateProfile } = useProfile(profileId);
const { generate, isGenerating } = useGenerate();
```

**Benefits:**

- No global state library needed
- Automatic cache management
- Optimistic updates
- Loading and error states built-in

---

## Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript 5.x (strict mode) |
| **Styling** | Tailwind CSS 4.x |
| **UI Components** | shadcn/ui |
| **React** | 19.x |
| **Form Handling** | React Hook Form + Zod |
| **Testing** | Vitest + Testing Library |
| **Date Handling** | date-fns |
| **Icons** | Lucide React |
| **Notifications** | Sonner |
| **Animations** | canvas-confetti |

---

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 9+
- Backend API running (see [API Integration](#api-integration))

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd brandium-website

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration
```

### Development

```bash
# Start development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

### First Steps

1. **Register** an account at `/register`
2. **Complete onboarding** (create profile, project, platform)
3. **Generate** your first post at `/generate`
4. **Import historical posts** to improve AI accuracy

---

## Project Structure

```text
src/
├── app/                        # Next.js App Router pages
│   ├── (auth)/                 # Public auth routes
│   │   ├── login/              # Login page
│   │   └── register/           # Registration page
│   └── (dashboard)/            # Protected routes
│       ├── dashboard/          # Main dashboard
│       ├── profiles/           # Profile management
│       ├── projects/           # Project management
│       ├── platforms/          # Platform management
│       ├── posts/              # Post history
│       └── generate/           # Post generation
│
├── components/
│   ├── ui/                     # shadcn/ui base components
│   ├── forms/                  # Form components
│   ├── features/               # Feature-specific components
│   │   ├── profiles/           # Profile components
│   │   ├── projects/           # Project components
│   │   ├── platforms/          # Platform components
│   │   ├── posts/              # Post components
│   │   ├── generate/           # Generation components
│   │   ├── historical-posts/   # Historical posts components
│   │   ├── profile-analysis/   # Analysis components
│   │   ├── iterations/         # Post iteration components
│   │   ├── chat/               # Refinement chat components
│   │   └── onboarding/         # Onboarding wizard
│   └── layout/                 # Layout components
│
├── lib/
│   ├── api/                    # API client functions
│   ├── hooks/                  # Custom React hooks
│   ├── services/               # Business logic
│   ├── utils/                  # Utility functions
│   └── providers/              # Context providers
│
├── types/                      # TypeScript type definitions
└── config/                     # Environment and constants
```

---

## API Integration

### Backend Connection

The frontend communicates with a separate backend API via REST endpoints.

**Configuration:**

```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Authentication Flow

```text
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Login     │ ──► │  POST /auth │ ──► │   JWT       │
│   Form      │     │  /login     │     │   Token     │
└─────────────┘     └─────────────┘     └──────┬──────┘
                                               │
                                               ▼
                                        ┌─────────────┐
                                        │  Store in   │
                                        │  localStorage│
                                        └──────┬──────┘
                                               │
                                               ▼
                                        ┌─────────────┐
                                        │  Include in │
                                        │  API calls  │
                                        └─────────────┘
```

### Available Endpoints

#### Auth Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create new account |
| POST | `/api/auth/login` | Login and receive JWT |
| POST | `/api/auth/logout` | Invalidate session |
| GET | `/api/auth/me` | Get current user |

#### Profile Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/profiles` | List all profiles |
| POST | `/api/profiles` | Create profile |
| GET | `/api/profiles/:id` | Get profile details |
| PATCH | `/api/profiles/:id` | Update profile |
| DELETE | `/api/profiles/:id` | Delete profile |

#### Historical Post Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/profiles/:id/historical-posts` | List historical posts |
| POST | `/api/profiles/:id/historical-posts` | Create historical post |
| POST | `/api/profiles/:id/historical-posts/bulk` | Bulk import (max 100) |
| GET | `/api/profiles/:id/historical-posts/stats` | Get statistics |
| PATCH | `/api/profiles/:id/historical-posts/:postId` | Update post |
| DELETE | `/api/profiles/:id/historical-posts/:postId` | Delete post |

#### Profile Analysis Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/profiles/:id/analysis-stats` | Check analysis readiness |
| POST | `/api/profiles/:id/analyze-from-posts` | Run AI analysis |
| POST | `/api/profiles/:id/apply-analysis` | Apply suggestions |

#### Project Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects` | List all projects |
| POST | `/api/projects` | Create project |
| GET | `/api/projects/:id` | Get project details |
| PATCH | `/api/projects/:id` | Update project |
| DELETE | `/api/projects/:id` | Delete project |

#### Platform Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/platforms` | List all platforms |
| POST | `/api/platforms` | Create platform |
| GET | `/api/platforms/:id` | Get platform details |
| PATCH | `/api/platforms/:id` | Update platform |
| DELETE | `/api/platforms/:id` | Delete platform |

#### Post Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/posts` | List all generated posts |
| GET | `/api/posts/:id` | Get post details |
| DELETE | `/api/posts/:id` | Delete post |

#### Generation Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/generate` | Generate new post |
| POST | `/api/posts/:id/iterate` | Refine existing post |
| GET | `/api/posts/:id/versions` | Get version history |

---

## Testing

### Running Tests

```bash
# Run all tests in watch mode
pnpm test

# Run tests once (CI mode)
pnpm test:run

# Generate coverage report
pnpm test:coverage
```

### Coverage Requirements

- **Target**: 80%+ code coverage
- **CI Integration**: Coverage reports uploaded to Codecov
- **Badge**: [![codecov](https://codecov.io/gh/TristanHourtoulle/brandium-website/branch/main/graph/badge.svg)](https://codecov.io/gh/TristanHourtoulle/brandium-website)

### Test Structure

```text
src/
└── __tests__/
    ├── lib/
    │   ├── api/           # API client tests
    │   ├── hooks/         # Hook tests
    │   └── utils/         # Utility tests
    └── components/        # Component tests
```

### Writing Tests

```typescript
// Example: Testing a hook
import { renderHook, waitFor } from '@testing-library/react';
import { usePosts } from '@/lib/hooks/use-posts';

describe('usePosts', () => {
  it('should load posts on mount', async () => {
    const { result } = renderHook(() => usePosts());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.posts).toHaveLength(10);
  });
});
```

---

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:3001` |

### Setting Up

1. Copy the example file:

   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` with your values:

   ```bash
   NEXT_PUBLIC_API_URL=http://localhost:3001
   ```

3. For production, set environment variables in your hosting platform.

---

## Available Commands

```bash
# Development
pnpm dev              # Start dev server at localhost:3000

# Build & Production
pnpm build            # Build for production
pnpm start            # Start production server

# Quality
pnpm lint             # Run ESLint
pnpm typecheck        # Run TypeScript type checking

# Testing
pnpm test             # Run tests in watch mode
pnpm test:run         # Run tests once
pnpm test:coverage    # Run tests with coverage report
```

---

## Troubleshooting

### Common Issues

#### API Connection Failed

**Symptom**: "Network Error" or "Failed to fetch" messages

**Solutions**:

1. Verify backend is running at `NEXT_PUBLIC_API_URL`
2. Check for CORS issues in browser console
3. Ensure environment variables are loaded (restart dev server after changes)

#### Authentication Issues

**Symptom**: Redirected to login repeatedly

**Solutions**:

1. Clear localStorage: `localStorage.clear()`
2. Check token expiration
3. Verify backend auth endpoints are working

#### Build Errors

**Symptom**: `pnpm build` fails

**Solutions**:

1. Run `pnpm typecheck` to find type errors
2. Run `pnpm lint` to find linting issues
3. Check for missing environment variables
4. Clear `.next` folder and rebuild

#### Tests Failing

**Symptom**: Tests fail locally or in CI

**Solutions**:

1. Run `pnpm test:run` for detailed error output
2. Check for missing test dependencies
3. Ensure mocks are properly configured
4. Verify test environment setup

### Getting Help

If you encounter issues not covered here:

1. Check the browser console for errors
2. Review backend logs for API issues
3. Search existing GitHub issues
4. Open a new issue with detailed reproduction steps

---

## License

Private
