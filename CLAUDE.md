# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Brandium is a personal branding tool that generates personalized social media posts using AI. This is the frontend application built with Next.js 16 (App Router) that integrates with a separate backend API.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5.x (strict mode)
- **Styling**: Tailwind CSS 4.x
- **UI Components**: shadcn/ui
- **React**: 19.x
- **State Management**: React Context + Hooks
- **Form Handling**: React Hook Form + Zod
- **Testing**: Vitest + Testing Library

## Commands

```bash
# Development
pnpm dev          # Start dev server

# Build & Production
pnpm build        # Build for production
pnpm start        # Start production server

# Quality
pnpm lint         # Run ESLint

# Testing (when configured)
pnpm test              # Run tests in watch mode
pnpm test:run          # Run tests once
pnpm test:coverage     # Run tests with coverage
```

## Architecture

### Directory Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Auth route group (login, register)
│   └── (dashboard)/       # Protected dashboard routes
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── forms/             # Form components (UI only)
│   ├── layout/            # Layout components
│   └── features/          # Feature-specific components
├── lib/
│   ├── api/               # API client functions
│   ├── hooks/             # Custom React hooks
│   ├── services/          # Business logic
│   ├── utils/             # Utility functions
│   └── providers/         # Context providers
├── types/                 # TypeScript type definitions
└── config/                # Environment and constants
```

### Code Organization Rules

**Separation of Concerns**: Never put business logic in `.tsx` files. Components handle only:
- Rendering UI
- Calling hooks
- Handling user interactions (delegating to hooks/services)

| Logic Type | Location |
|------------|----------|
| API calls | `lib/api/*.ts` |
| Business logic | `lib/services/*.ts` |
| State management | `lib/hooks/*.ts` |
| Data transformation | `lib/utils/*.ts` |
| Validation schemas | `lib/utils/validation.ts` |
| UI rendering | `components/**/*.tsx` |

### Path Aliases

Use `@/` for imports from `src/`:
```typescript
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/hooks/use-auth";
```

## Design System

- **Primary Color**: `blue-600` (#2563EB)
- **Font**: Geist (Sans & Mono)
- **Theme**: Light mode default with dark mode support
- **UI Library**: Always use shadcn/ui components as foundation

### Adding shadcn/ui Components

Always check [ui.shadcn.com](https://ui.shadcn.com) before adding components:
```bash
pnpm dlx shadcn@latest add button
pnpm dlx shadcn@latest add input
```

## Backend Integration

- **Development**: `http://localhost:3001`
- **Production**: Railway deployment URL
- Environment variable: `NEXT_PUBLIC_API_URL`

## Documentation Requirements

Before implementing features, consult:
1. [Next.js 16 docs](https://nextjs.org/docs) - App Router patterns, Server vs Client Components
2. [shadcn/ui docs](https://ui.shadcn.com) - Component installation and usage
3. [React 19 docs](https://react.dev) - Hooks and patterns

## Git Commit Rules

**IMPORTANT**: When creating commits, never include:

- "Generated with Claude Code" or similar AI attribution
- "Co-Authored-By: Claude" or any co-author mention
- Any reference to AI tools in commit messages

All commits must be attributed solely to the repository owner.
