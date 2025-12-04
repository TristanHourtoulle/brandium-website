# Brandium Frontend - Development Plan

## Project Overview

**Brandium** is a personal branding tool that generates personalized social media posts using AI. This document outlines the phased development plan for the V0 frontend, designed to integrate with the existing backend API.

### Tech Stack

| Category         | Technology            | Version |
| ---------------- | --------------------- | ------- |
| Framework        | Next.js (App Router)  | 16.x    |
| Language         | TypeScript            | 5.x     |
| Styling          | Tailwind CSS          | 4.x     |
| UI Components    | shadcn/ui             | Latest  |
| React            | React                 | 19.x    |
| State Management | React Context + Hooks | -       |
| HTTP Client      | Native Fetch API      | -       |
| Form Handling    | React Hook Form       | Latest  |
| Validation       | Zod                   | Latest  |
| Icons            | Lucide React          | Latest  |
| Testing          | Vitest + Testing Library | Latest |

### Design System

- **Primary Color**: `blue-600` (#2563EB)
- **Font**: Geist (Sans & Mono)
- **Theme**: Light mode default with dark mode support
- **Style Reference**: [tristanhourtoulle.fr](https://www.tristanhourtoulle.fr)
- **UI Library**: [shadcn/ui](https://ui.shadcn.com) - Always use shadcn/ui components as the foundation

### Backend Integration

- **Development**: `http://localhost:3001`
- **Production**: Railway deployment URL

---

## Documentation Requirements

### Mandatory Documentation Checks

Before implementing any feature, **ALWAYS** consult the official documentation:

1. **Next.js 16 Documentation**: [https://nextjs.org/docs](https://nextjs.org/docs)
   - Check for App Router best practices
   - Verify Server Components vs Client Components usage
   - Review data fetching patterns (Server Actions, Route Handlers)
   - Understand caching and revalidation strategies

2. **shadcn/ui Documentation**: [https://ui.shadcn.com](https://ui.shadcn.com)
   - **ALWAYS** check the component documentation before adding a new component
   - Copy the exact installation command from the docs
   - Follow the recommended patterns for each component
   - Check for any breaking changes or updates

3. **React 19 Documentation**: [https://react.dev](https://react.dev)
   - Review new hooks and patterns
   - Understand Server Components integration

### Why This Matters

- Dependencies and APIs change frequently
- shadcn/ui components are copied into your project (not installed as packages)
- Next.js 16 has specific patterns that differ from previous versions
- Following official docs ensures we use current best practices

---

## Code Organization Principles

### Separation of Concerns (MANDATORY)

**NEVER put business logic in `.tsx` files.** Components should only handle:
- Rendering UI
- Calling hooks
- Handling user interactions (delegating to hooks/services)

### File Structure by Feature

```
src/
├── app/                           # Next.js App Router (pages only)
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx          # UI only - uses hooks
│   │   ├── register/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   │
│   ├── (dashboard)/
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── profiles/
│   │   │   ├── page.tsx
│   │   │   ├── new/
│   │   │   │   └── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   ├── projects/
│   │   │   ├── page.tsx
│   │   │   ├── new/
│   │   │   │   └── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   ├── platforms/
│   │   │   ├── page.tsx
│   │   │   ├── new/
│   │   │   │   └── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   ├── generate/
│   │   │   └── page.tsx
│   │   ├── posts/
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   └── layout.tsx
│   │
│   ├── page.tsx
│   ├── layout.tsx
│   └── globals.css
│
├── components/
│   ├── ui/                        # shadcn/ui components (auto-generated)
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── badge.tsx
│   │   ├── toast.tsx
│   │   ├── skeleton.tsx
│   │   ├── avatar.tsx
│   │   └── ...
│   │
│   ├── forms/                     # Form components (UI only)
│   │   ├── auth-form.tsx
│   │   ├── profile-form.tsx
│   │   ├── project-form.tsx
│   │   ├── platform-form.tsx
│   │   └── generate-form.tsx
│   │
│   ├── layout/                    # Layout components (UI only)
│   │   ├── header.tsx
│   │   ├── sidebar.tsx
│   │   ├── footer.tsx
│   │   └── nav-link.tsx
│   │
│   └── features/                  # Feature-specific components (UI only)
│       ├── profiles/
│       │   ├── profile-card.tsx
│       │   ├── profile-list.tsx
│       │   └── profile-empty-state.tsx
│       ├── projects/
│       ├── platforms/
│       ├── generate/
│       └── posts/
│
├── lib/
│   ├── api/                       # API client (business logic)
│   │   ├── client.ts              # Base API client with auth
│   │   ├── auth.ts                # Auth endpoints
│   │   ├── profiles.ts            # Profiles endpoints
│   │   ├── projects.ts            # Projects endpoints
│   │   ├── platforms.ts           # Platforms endpoints
│   │   ├── generate.ts            # Generate endpoints
│   │   ├── posts.ts               # Posts endpoints
│   │   └── index.ts
│   │
│   ├── hooks/                     # Custom hooks (state + logic)
│   │   ├── use-auth.ts
│   │   ├── use-profiles.ts
│   │   ├── use-projects.ts
│   │   ├── use-platforms.ts
│   │   ├── use-posts.ts
│   │   └── use-toast.ts
│   │
│   ├── services/                  # Business logic services
│   │   ├── auth.service.ts
│   │   ├── profiles.service.ts
│   │   ├── projects.service.ts
│   │   ├── platforms.service.ts
│   │   └── posts.service.ts
│   │
│   ├── utils/                     # Utility functions (pure functions)
│   │   ├── cn.ts                  # Class name merger
│   │   ├── format.ts              # Formatters
│   │   ├── validation.ts          # Zod schemas
│   │   └── helpers.ts             # Generic helpers
│   │
│   └── providers/                 # Context providers
│       ├── auth-provider.tsx
│       ├── toast-provider.tsx
│       └── theme-provider.tsx
│
├── types/                         # TypeScript types
│   ├── api.ts                     # API response types
│   ├── auth.ts                    # Auth types
│   ├── profile.ts                 # Profile types
│   ├── project.ts                 # Project types
│   ├── platform.ts                # Platform types
│   ├── post.ts                    # Post types
│   └── index.ts
│
├── config/
│   ├── env.ts                     # Environment variables
│   └── constants.ts               # App constants
│
└── __tests__/                     # Unit tests (mirrors src structure)
    ├── lib/
    │   ├── api/
    │   │   ├── client.test.ts
    │   │   ├── auth.test.ts
    │   │   └── ...
    │   ├── hooks/
    │   │   ├── use-auth.test.ts
    │   │   └── ...
    │   ├── services/
    │   │   ├── auth.service.test.ts
    │   │   └── ...
    │   └── utils/
    │       ├── cn.test.ts
    │       ├── format.test.ts
    │       └── validation.test.ts
    └── setup.ts
```

### Logic Placement Rules

| Logic Type | Location | Example |
| ---------- | -------- | ------- |
| API calls | `lib/api/*.ts` | `fetchProfiles()`, `createProfile()` |
| Business logic | `lib/services/*.ts` | `validateProfileRules()`, `formatPostForPlatform()` |
| State management | `lib/hooks/*.ts` | `useProfiles()`, `useAuth()` |
| Data transformation | `lib/utils/*.ts` | `formatDate()`, `truncateText()` |
| Validation schemas | `lib/utils/validation.ts` | Zod schemas |
| UI rendering | `components/**/*.tsx` | JSX only, calls hooks |
| Page composition | `app/**/page.tsx` | Composes components |

### Example: Correct Separation

```typescript
// ❌ BAD: Logic in component
// components/features/profiles/profile-list.tsx
export function ProfileList() {
  const [profiles, setProfiles] = useState([]);

  useEffect(() => {
    fetch('/api/profiles')
      .then(res => res.json())
      .then(data => setProfiles(data));
  }, []);

  const handleDelete = async (id: string) => {
    await fetch(`/api/profiles/${id}`, { method: 'DELETE' });
    setProfiles(profiles.filter(p => p.id !== id));
  };

  return <div>...</div>;
}

// ✅ GOOD: Logic in hooks, UI in component
// lib/hooks/use-profiles.ts
export function useProfiles() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfiles = async () => { /* ... */ };
  const deleteProfile = async (id: string) => { /* ... */ };

  return { profiles, isLoading, fetchProfiles, deleteProfile };
}

// components/features/profiles/profile-list.tsx
export function ProfileList() {
  const { profiles, isLoading, deleteProfile } = useProfiles();

  if (isLoading) return <Skeleton />;

  return (
    <div>
      {profiles.map(profile => (
        <ProfileCard
          key={profile.id}
          profile={profile}
          onDelete={() => deleteProfile(profile.id)}
        />
      ))}
    </div>
  );
}
```

---

## Testing Strategy

### Testing Requirements

Every phase **MUST** include unit tests for:
- All utility functions (`lib/utils/`)
- All API client functions (`lib/api/`)
- All custom hooks (`lib/hooks/`)
- All service functions (`lib/services/`)

### Test Setup

```bash
# Install testing dependencies
pnpm add -D vitest @testing-library/react @testing-library/jest-dom @vitejs/plugin-react jsdom
```

### Configuration Files

**vitest.config.ts**
```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/__tests__/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'src/__tests__/',
        '**/*.d.ts',
        'src/components/ui/', // shadcn/ui components
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

**package.json scripts**
```json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage",
    "test:ui": "vitest --ui"
  }
}
```

### CI/CD Pipeline

**.github/workflows/ci.yml**
```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 9

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Type check
        run: pnpm typecheck

      - name: Lint
        run: pnpm lint

      - name: Run tests
        run: pnpm test:coverage

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v4
        with:
          token: ${{ secrets.CODECOV_TOKEN }}
          files: ./coverage/lcov.info
          fail_ci_if_error: true

  build:
    runs-on: ubuntu-latest
    needs: test

    steps:
      - uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 9

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Build
        run: pnpm build
```

### Coverage Badge in README

Add to README.md:
```markdown
[![codecov](https://codecov.io/gh/YOUR_USERNAME/brandium-website/branch/main/graph/badge.svg)](https://codecov.io/gh/YOUR_USERNAME/brandium-website)
```

---

## Development Phases

### Phase 1: Foundation & Infrastructure

**Scope: Core setup and authentication**

#### 1.1 Project Setup

- [ ] Update `package.json` with project name and dependencies
- [ ] Configure environment variables (`.env.local`, `.env.example`)
- [ ] Set up Tailwind CSS with blue-600 theme
- [ ] Initialize shadcn/ui: `pnpm dlx shadcn@latest init`
- [ ] Configure TypeScript strict mode
- [ ] Add ESLint and Prettier configuration
- [ ] Set up path aliases (`@/` for `src/`)
- [ ] Set up Vitest and testing infrastructure
- [ ] Configure GitHub Actions CI pipeline

#### 1.2 Design System (shadcn/ui)

- [ ] Configure CSS variables for blue-600 theme in `globals.css`
- [ ] Install shadcn/ui components (check docs for each):
  - [ ] `pnpm dlx shadcn@latest add button`
  - [ ] `pnpm dlx shadcn@latest add input`
  - [ ] `pnpm dlx shadcn@latest add card`
  - [ ] `pnpm dlx shadcn@latest add badge`
  - [ ] `pnpm dlx shadcn@latest add skeleton`
  - [ ] `pnpm dlx shadcn@latest add toast` (sonner)
- [ ] Set up theme provider for dark/light mode
- [ ] Create `cn()` utility (comes with shadcn/ui init)

#### 1.3 API Client Infrastructure

- [ ] Create base API client with:
  - [ ] Automatic token injection
  - [ ] Error handling
  - [ ] Response typing
  - [ ] Environment-based URL switching
- [ ] Define TypeScript types for all API responses
- [ ] Create Zod schemas for validation
- [ ] **Write unit tests for API client**

#### 1.4 Authentication System

- [ ] Create `AuthProvider` context
- [ ] Implement `useAuth` hook with:
  - [ ] `login(email, password)`
  - [ ] `register(email, password)`
  - [ ] `logout()`
  - [ ] `user` state
  - [ ] `isLoading` state
  - [ ] `isAuthenticated` computed
- [ ] Create auth API functions
- [ ] Implement token storage (localStorage)
- [ ] Add automatic token refresh on app load
- [ ] **Write unit tests for auth hook and API functions**

#### 1.5 Route Protection

- [ ] Create auth layout with redirect logic
- [ ] Create dashboard layout with protection
- [ ] Implement middleware for route protection (optional)

#### 1.6 Landing Page (Minimal V0)

- [ ] Create simple landing page with:
  - [ ] Project name "Brandium"
  - [ ] Login button (shadcn/ui Button)
  - [ ] Register button (shadcn/ui Button)
  - [ ] Minimal styling matching portfolio theme

#### 1.7 Auth Pages

- [ ] Login page with:
  - [ ] Email/password form (shadcn/ui Input)
  - [ ] Form validation (Zod + React Hook Form)
  - [ ] Error handling
  - [ ] Loading states
  - [ ] Redirect to dashboard on success
  - [ ] Link to register
- [ ] Register page with:
  - [ ] Email/password form
  - [ ] Password requirements display
  - [ ] Form validation
  - [ ] Error handling
  - [ ] Loading states
  - [ ] Redirect to dashboard on success
  - [ ] Link to login

#### 1.8 Phase 1 Tests

- [ ] `lib/utils/cn.test.ts`
- [ ] `lib/utils/validation.test.ts`
- [ ] `lib/api/client.test.ts`
- [ ] `lib/api/auth.test.ts`
- [ ] `lib/hooks/use-auth.test.ts`
- [ ] Ensure coverage > 80% for Phase 1 code

**Deliverables Phase 1:**

- Working authentication flow
- Protected routes
- Minimal landing page
- Design system foundation (shadcn/ui)
- CI pipeline with tests
- Coverage badge in README

---

### Phase 2: Dashboard & Profiles

**Scope: Dashboard layout and profile management**

#### 2.1 Dashboard Layout

- [ ] Install shadcn/ui components:
  - [ ] `pnpm dlx shadcn@latest add dropdown-menu`
  - [ ] `pnpm dlx shadcn@latest add avatar`
  - [ ] `pnpm dlx shadcn@latest add separator`
  - [ ] `pnpm dlx shadcn@latest add sheet` (mobile sidebar)
- [ ] Create sidebar navigation with:
  - [ ] Logo/brand
  - [ ] Navigation links (Dashboard, Profiles, Projects, Platforms, Generate, Posts)
  - [ ] User menu (email, logout)
  - [ ] Active state indicators
- [ ] Create responsive header for mobile
- [ ] Implement collapsible sidebar
- [ ] Add breadcrumb navigation

#### 2.2 Dashboard Home Page

- [ ] Create overview dashboard with:
  - [ ] Welcome message
  - [ ] Quick stats cards (profiles count, projects count, platforms count, posts count)
  - [ ] Recent posts preview
  - [ ] Quick action buttons (New Profile, New Project, Generate)
- [ ] Implement skeleton loading states
- [ ] Add empty states with CTAs

#### 2.3 Profiles Module

- [ ] Install shadcn/ui components:
  - [ ] `pnpm dlx shadcn@latest add dialog`
  - [ ] `pnpm dlx shadcn@latest add alert-dialog`
  - [ ] `pnpm dlx shadcn@latest add textarea`
  - [ ] `pnpm dlx shadcn@latest add label`
- [ ] Create `useProfiles` hook with CRUD operations
- [ ] Create `profiles.service.ts` for business logic
- [ ] Create profiles list page:
  - [ ] Grid/list view of profiles
  - [ ] Profile cards with name, bio preview, tone tags
  - [ ] Create new profile button
  - [ ] Edit/delete actions
  - [ ] Empty state
  - [ ] Loading skeletons
- [ ] Create profile form component:
  - [ ] Name input
  - [ ] Bio textarea
  - [ ] Tone tags input (multi-select/tags)
  - [ ] Do rules list (dynamic add/remove)
  - [ ] Don't rules list (dynamic add/remove)
  - [ ] Form validation
- [ ] Create new profile page
- [ ] Create edit profile page
- [ ] Implement profile deletion with confirmation

#### 2.4 Phase 2 Tests

- [ ] `lib/api/profiles.test.ts`
- [ ] `lib/hooks/use-profiles.test.ts`
- [ ] `lib/services/profiles.service.test.ts`
- [ ] Ensure coverage > 80% for Phase 2 code

**Deliverables Phase 2:**

- Complete dashboard layout
- Full profiles CRUD
- Responsive navigation
- Unit tests for profiles module

---

### Phase 3: Projects & Platforms

**Scope: Project and platform management**

#### 3.1 Projects Module

- [ ] Create `useProjects` hook with CRUD operations
- [ ] Create `projects.service.ts` for business logic
- [ ] Create projects list page:
  - [ ] Grid/list view of projects
  - [ ] Project cards with name, description, audience
  - [ ] Key messages preview
  - [ ] Create new project button
  - [ ] Edit/delete actions
  - [ ] Empty state
  - [ ] Loading skeletons
- [ ] Create project form component:
  - [ ] Name input
  - [ ] Description textarea
  - [ ] Audience input
  - [ ] Key messages list (dynamic add/remove)
  - [ ] Form validation
- [ ] Create new project page
- [ ] Create edit project page
- [ ] Implement project deletion with confirmation

#### 3.2 Platforms Module

- [ ] Install shadcn/ui components:
  - [ ] `pnpm dlx shadcn@latest add select`
  - [ ] `pnpm dlx shadcn@latest add command` (for search/autocomplete)
- [ ] Create `usePlatforms` hook with CRUD operations
- [ ] Create `platforms.service.ts` for business logic
- [ ] Create platforms list page:
  - [ ] Grid/list view of platforms
  - [ ] Platform cards with name, guidelines, max length
  - [ ] Platform icons (LinkedIn, X, TikTok, etc.)
  - [ ] Create new platform button
  - [ ] Edit/delete actions
  - [ ] Empty state
  - [ ] Loading skeletons
- [ ] Create platform form component:
  - [ ] Name input (with common platform suggestions)
  - [ ] Style guidelines textarea
  - [ ] Max length input (optional)
  - [ ] Form validation
- [ ] Create new platform page
- [ ] Create edit platform page
- [ ] Implement platform deletion with confirmation

#### 3.3 Phase 3 Tests

- [ ] `lib/api/projects.test.ts`
- [ ] `lib/api/platforms.test.ts`
- [ ] `lib/hooks/use-projects.test.ts`
- [ ] `lib/hooks/use-platforms.test.ts`
- [ ] `lib/services/projects.service.test.ts`
- [ ] `lib/services/platforms.service.test.ts`
- [ ] Ensure coverage > 80% for Phase 3 code

**Deliverables Phase 3:**

- Full projects CRUD
- Full platforms CRUD
- Consistent UI patterns
- Unit tests for projects and platforms modules

---

### Phase 4: AI Generation

**Scope: Post generation feature**

#### 4.1 Generation Page

- [ ] Install shadcn/ui components:
  - [ ] `pnpm dlx shadcn@latest add popover`
  - [ ] `pnpm dlx shadcn@latest add progress`
- [ ] Create `useGenerate` hook
- [ ] Create `generate.service.ts` for business logic
- [ ] Create generation form with:
  - [ ] Profile selector (dropdown with profiles)
  - [ ] Project selector (dropdown with projects)
  - [ ] Platform selector (dropdown with platforms)
  - [ ] Goal input (optional text)
  - [ ] Raw idea textarea (required)
  - [ ] Generate button
- [ ] Implement selection previews (show selected profile/project/platform details)
- [ ] Add form validation
- [ ] Create loading state during generation (with animated indicator)

#### 4.2 Generation Results

- [ ] Display generated post in styled card
- [ ] Show character count (with platform max length indicator if selected)
- [ ] Copy to clipboard button
- [ ] Regenerate button
- [ ] Save/dismiss actions
- [ ] Show generation metadata (profile, project, platform used)

#### 4.3 Rate Limiting UI

- [ ] Display rate limit status
- [ ] Show remaining requests/tokens
- [ ] Disable generate button when rate limited
- [ ] Show cooldown timer

#### 4.4 Phase 4 Tests

- [ ] `lib/api/generate.test.ts`
- [ ] `lib/hooks/use-generate.test.ts`
- [ ] `lib/services/generate.service.test.ts`
- [ ] `lib/utils/format.test.ts` (character count, etc.)
- [ ] Ensure coverage > 80% for Phase 4 code

**Deliverables Phase 4:**

- Working AI generation
- Rate limit awareness
- Copy/save functionality
- Unit tests for generation module

---

### Phase 5: Posts History & Polish

**Scope: Posts management and final polish**

#### 5.1 Posts Module

- [ ] Install shadcn/ui components:
  - [ ] `pnpm dlx shadcn@latest add pagination`
  - [ ] `pnpm dlx shadcn@latest add tabs`
- [ ] Create `usePosts` hook with list/delete operations
- [ ] Create `posts.service.ts` for business logic
- [ ] Create posts list page:
  - [ ] Paginated list of posts
  - [ ] Post cards with preview, date, platform
  - [ ] Filter by platform/project/profile
  - [ ] Search functionality
  - [ ] Delete action with confirmation
  - [ ] Empty state
  - [ ] Loading skeletons
- [ ] Create post detail page:
  - [ ] Full generated text
  - [ ] Generation metadata (profile, project, platform, goal, raw idea)
  - [ ] Copy to clipboard
  - [ ] Delete action
  - [ ] Created date
- [ ] Implement pagination with `usePosts` hook

#### 5.2 Toast Notifications

- [ ] Configure sonner (shadcn/ui toast)
- [ ] Integrate toasts with all CRUD operations

#### 5.3 Error Handling

- [ ] Create error boundary component
- [ ] Add global error handling
- [ ] Create 404 page
- [ ] Create error fallback UI
- [ ] Add retry mechanisms for failed requests

#### 5.4 Loading States

- [ ] Review all pages for consistent loading states
- [ ] Add page transition animations
- [ ] Optimize skeleton loaders

#### 5.5 Accessibility

- [ ] Add proper ARIA labels
- [ ] Ensure keyboard navigation
- [ ] Test with screen readers
- [ ] Add focus indicators
- [ ] Ensure color contrast compliance

#### 5.6 Performance Optimization

- [ ] Implement React.memo where appropriate
- [ ] Add proper key props
- [ ] Optimize re-renders
- [ ] Lazy load routes
- [ ] Image optimization

#### 5.7 Phase 5 Tests

- [ ] `lib/api/posts.test.ts`
- [ ] `lib/hooks/use-posts.test.ts`
- [ ] `lib/services/posts.service.test.ts`
- [ ] All remaining utility functions
- [ ] **Final coverage check: > 80% overall**

**Deliverables Phase 5:**

- Complete posts history
- Toast notification system
- Error handling
- Accessibility compliance
- Performance optimization
- Full test coverage

---

## API Integration Reference

### Base Configuration

```typescript
// config/env.ts
export const env = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
};
```

### Endpoints Map

| Feature   | Endpoint           | Methods                          |
| --------- | ------------------ | -------------------------------- |
| Auth      | `/api/auth/*`      | POST (register, login), GET (me) |
| Profiles  | `/api/profiles/*`  | GET, POST, PUT, DELETE           |
| Projects  | `/api/projects/*`  | GET, POST, PUT, DELETE           |
| Platforms | `/api/platforms/*` | GET, POST, PUT, DELETE           |
| Generate  | `/api/generate`    | POST, GET (status)               |
| Posts     | `/api/posts/*`     | GET, DELETE                      |

---

## Environment Variables

```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:3001

# .env.production
NEXT_PUBLIC_API_URL=https://your-railway-url.railway.app
```

---

## Dependencies to Add

```bash
# Initialize shadcn/ui (will install necessary deps)
pnpm dlx shadcn@latest init

# Form handling (required by shadcn/ui forms)
pnpm add react-hook-form zod @hookform/resolvers

# Date formatting
pnpm add date-fns

# Testing
pnpm add -D vitest @testing-library/react @testing-library/jest-dom @vitejs/plugin-react jsdom @vitest/coverage-v8
```

---

## Quality Checklist

### Before Each Phase Completion

- [ ] All TypeScript errors resolved
- [ ] ESLint passes with no warnings
- [ ] All components have proper types
- [ ] Loading states implemented
- [ ] Error states implemented
- [ ] Empty states implemented
- [ ] Responsive design verified
- [ ] Dark/light mode working
- [ ] API integration tested with backend
- [ ] **Unit tests written and passing**
- [ ] **Coverage > 80% for phase code**
- [ ] **Documentation checked (Next.js, shadcn/ui)**

### V0 Release Checklist

- [ ] Authentication working (register, login, logout, persist)
- [ ] All CRUD operations functional
- [ ] AI generation working
- [ ] Rate limiting handled
- [ ] Posts history accessible
- [ ] Toast notifications working
- [ ] No console errors
- [ ] Mobile responsive
- [ ] Accessibility basics covered
- [ ] Environment variables documented
- [ ] **CI pipeline passing on all PRs**
- [ ] **Coverage badge in README**
- [ ] **Overall test coverage > 80%**

---

## Notes

### Scalability Considerations

1. **API Client**: Built with extensibility in mind for future interceptors, caching, etc.
2. **Component Architecture**: Atomic design with clear separation of concerns
3. **Type Safety**: Full TypeScript coverage prevents runtime errors
4. **Route Groups**: Next.js 16 route groups for clean URL structure
5. **State Management**: Context for global state, props for local, ready for Zustand/Jotai if needed
6. **Testing**: Comprehensive unit tests enable confident refactoring

### Maintainability Practices

1. **Consistent Naming**: kebab-case for files, PascalCase for components
2. **Colocation**: Related files grouped together
3. **Single Responsibility**: Each component/hook does one thing well
4. **Documentation**: Types serve as documentation
5. **Error Boundaries**: Graceful failure handling
6. **No Logic in TSX**: All business logic in hooks/services
7. **Test Coverage**: Every utility, hook, and service is tested

### Documentation First

**Before implementing any component or feature:**

1. Check [Next.js 16 docs](https://nextjs.org/docs) for latest patterns
2. Check [shadcn/ui docs](https://ui.shadcn.com) for component usage
3. Check [React 19 docs](https://react.dev) for hook patterns
4. Copy installation commands directly from docs

---

## Phase Summary

| Phase   | Focus                | Priority | Test Focus                     |
| ------- | -------------------- | -------- | ------------------------------ |
| Phase 1 | Foundation & Auth    | Critical | API client, auth, utils        |
| Phase 2 | Dashboard & Profiles | High     | Profiles CRUD, hooks           |
| Phase 3 | Projects & Platforms | High     | Projects/Platforms CRUD, hooks |
| Phase 4 | AI Generation        | High     | Generation logic, formatting   |
| Phase 5 | Posts & Polish       | Medium   | Posts, final coverage          |

Each phase builds on the previous one. Complete Phase 1 before proceeding to ensure a solid foundation.
