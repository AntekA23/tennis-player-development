# Tennis Player Development Platform

![CI](https://github.com/AntekA23/tennis-player-development/actions/workflows/ci.yml/badge.svg)

A player-centric tennis career platform designed to leverage modern AI services for data-driven insights and growth.

## Product Architecture & Development Principles

**Platform Vision:**  
A player-centric tennis career platform, designed to leverage modern AI services for data-driven insights and growth.

**Development Model:**  
- Rapid, incremental delivery via "vibe coding":
    - Claude Code: main implementer
    - ChatGPT: advisor and QA/strategy
    - Product Owner (User): vision, UX, validation

**Technology Stack (MVP):**
- **Frontend:** Next.js (TypeScript, Tailwind CSS), SSR enabled for flexibility and future growth.
- **Backend:** Next.js API routes; plan to migrate to dedicated backend if scale or AI usage requires.
- **Database:** PostgreSQL via Railway, using Drizzle ORM.
- **AI Integration:** All AI via secure external APIs (OpenAI, Anthropic, etc.), following "AI as a Service" pattern.

**Why This Stack?**
- Modern, scalable, flexible for rapid development
- Easy integration with AI APIs
- Clear separation of concerns, supports modular growth

**Next Decision Checkpoints:**
- Dedicated backend (when/if)
- Background job handling for AI tasks
- Multi-tenant/team data model

## Quick Start

### Local Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

### Build Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

### Railway.com Deployment

The application automatically deploys to Railway when changes are pushed to the main branch.

**Environment Variables:**
- `DATABASE_URL`: PostgreSQL connection string (provided by Railway)
- Additional variables will be added as features are implemented

## Current Features

- ✅ Next.js 15 with TypeScript and Tailwind CSS
- ✅ Static homepage with tennis platform branding
- ✅ About page with navigation
- ✅ Railway deployment with SSR enabled
- ✅ GitHub integration for automatic deployments

## Development Philosophy

This project follows discipline-first, evidence-based development principles:
- Start simple, add complexity only when needed
- Rapid prototyping with modern tools
- AI integration as external services
- Player-centric design approach

Built for competitive tennis families • Modern platform for tennis player development
