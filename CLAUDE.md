# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server
- `npm run build` - Create production build  
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Architecture Overview

This is a Farcaster Mini App (formerly Frames) built with Next.js 15, TypeScript, and React. The app enables users to explore and interact with video content on the Farcaster social network.

### Key Technologies
- **Next.js 15** - React framework with App Router
- **Prisma** - Database ORM with PostgreSQL
- **Farcaster Quick Auth** - JWT-based authentication for API routes
- **TailwindCSS** - Styling with shadcn/ui components
- **Neynar SDK** - Farcaster API integration
- **Vidstack** - Video player component
- **PostHog** - Analytics and tracking
- **Upstash Redis** - Caching layer

### Project Structure

#### Core App Structure
- `src/app/` - Next.js App Router pages and layouts
  - `api/` - API routes for backend functionality
  - `components/` - Page-specific React components
  - `layout.tsx` - Root layout with authentication and providers

#### API Routes Architecture
The API is organized by feature:
- `og/` - Open Graph image generation for posts, profiles and channels (public)
- `feed/`, `videos/`, `video/`, `channel/` - Video feeds and content
- `comments/`, `reactions/` - Replies, likes and recasts
- `follow/`, `unfollow/`, `friends/` - Social features
- `user/`, `search/`, `trending/` - User data, search and trending lists
- `signer/`, `verify/` - Neynar signer creation and verification
- `onboard/` - One-time onboarding after a user adds the mini app
- `track/` - View, share and search tracking

#### Component Organization
- `src/app/components/` - Page-level components (feed, profile, video, navbar)
- `src/components/ui/` - Reusable UI components (shadcn/ui)
- `src/providers/` - React context providers (PostHog, Signer, Frame)

#### Data Layer
- `src/lib/` - Core utilities (Prisma, Neynar SDK, Redis, notifications)
- `src/utils/` - Helper functions and utilities
- `src/hooks/` - Custom React hooks
- `prisma/schema.prisma` - Database schema

### Authentication Flow
The client obtains a Farcaster Quick Auth JWT (`sdk.experimental.quickAuth()`) and sends it as a Bearer token. `src/middleware.ts` verifies it for every `/api/*` route except `og/`, strips any client-supplied `x-fid` header and sets `x-fid` to the verified FID. Route handlers must only read the user's FID from `x-fid`, never from the request body or params. Write actions use the user's Neynar signer stored in the database.

### Database Schema
- **User** - Stores Farcaster user data (FID, signer info, expiration)
- **Share** - Tracks user-to-user sharing relationships
- **View**, **Search**, **FeedSearch** - Viewing history and search tracking for feeds and trending lists

### Configuration Notes
- Prisma client generates to `src/generated/prisma/` (custom output path)
- TypeScript path aliases: `@/*` maps to `src/*`
- PostHog analytics configured with proxy rewrites for ad-blocker circumvention
- Remote image patterns allow all HTTPS domains for Farcaster content

### Development Workflow
1. Database changes require Prisma migration: `npx prisma migrate dev`
2. Generate Prisma client after schema changes: `npx prisma generate`
3. Environment variables required for Farcaster, database, and API integrations
4. ESLint configured but set to ignore during builds for flexibility