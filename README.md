# Brandium

[![CI](https://github.com/TristanHourtoulle/brandium-website/actions/workflows/ci.yml/badge.svg)](https://github.com/TristanHourtoulle/brandium-website/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/TristanHourtoulle/brandium-website/branch/main/graph/badge.svg)](https://codecov.io/gh/TristanHourtoulle/brandium-website)

Personal branding tool that generates personalized social media posts using AI.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5.x (strict mode)
- **Styling**: Tailwind CSS 4.x
- **UI Components**: shadcn/ui
- **React**: 19.x
- **Form Handling**: React Hook Form + Zod
- **Testing**: Vitest + Testing Library

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 9+

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

### Available Commands

```bash
# Development
pnpm dev              # Start dev server

# Build & Production
pnpm build            # Build for production
pnpm start            # Start production server

# Quality
pnpm lint             # Run ESLint
pnpm typecheck        # Run TypeScript type checking

# Testing
pnpm test             # Run tests in watch mode
pnpm test:run         # Run tests once
pnpm test:coverage    # Run tests with coverage
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:3001` |

## Project Structure

```text
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Auth route group (login, register)
│   └── (dashboard)/       # Protected dashboard routes
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── forms/             # Form components
│   ├── features/          # Feature-specific components
│   └── layout/            # Layout components
├── lib/
│   ├── api/               # API client functions
│   ├── hooks/             # Custom React hooks
│   ├── services/          # Business logic services
│   ├── utils/             # Utility functions
│   └── providers/         # Context providers
├── types/                 # TypeScript type definitions
└── config/                # Environment and constants
```

## Features

### Core Features

- User authentication (login/register)
- Protected routes with dashboard layout
- Dark/light mode support
- Responsive design

### Content Management

- **Profile management**: Create and manage personal brand profiles with tone, voice guidelines, and rules
- **Platform management**: Configure social media platforms with style guidelines and character limits
- **Project management**: Organize content around specific topics, products, or campaigns

### AI Content Generation

- **Post generation**: Generate personalized social media posts using AI
- **Post iterations**: Refine and improve generated posts with natural language prompts (e.g., "make it shorter", "add emojis")
- **Version history**: Browse and switch between all versions of a post
- **Rate limiting**: Built-in rate limit tracking and display
- **Post history**: View, filter, search, and manage all generated posts

### User Experience

- **Guided onboarding**: 4-step wizard to help new users set up their first profile, project, platform, and generate their first post
- Toast notifications for all actions
- Comprehensive error handling with error boundaries
- Loading states and skeleton loaders
- Accessibility improvements (skip links, ARIA labels, keyboard navigation)
- Reusable UI components (PageHeader, etc.)
- Celebration animations (confetti) for key milestones

## License

Private
