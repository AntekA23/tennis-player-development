# CLAUDE.md

**Before any code action, explicitly read QUALITY.md and confirm discipline-first alignment. No green = no merge.**

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🚨 MANDATORY SESSION START PROTOCOL

**Before any code action, Claude must:**

1. **Read QUALITY.md** - Confirm understanding of discipline-first guardrails
2. **Verify alignment** - Ensure proposed changes follow quality requirements
3. **Size check** - Confirm changes will be ≤150 LOC (excluding docs/tests)
4. **Evidence plan** - Define what "working" looks like before coding
5. **Risk assessment** - If guardrails are at risk, STOP and request user validation

## 🚨 MANDATORY SESSION START PROTOCOL (DB Focus)

**For any code change that affects the database:**

### Pre-Migration Checks:
1. **Field Analysis** - List all new fields and their nullability
2. **Backfill Plan** - Document how existing rows will be handled
3. **API Review** - Verify all endpoints handle new fields safely

### During Migration:
1. Apply migration to test environment first
2. Check for existing rows that need backfill:
   ```sql
   SELECT COUNT(*) FROM table WHERE new_field IS NULL;
   ```
3. Run backfill if needed before adding constraints
4. Manually verify DB structure in TablePlus/Railway UI

### Post-Migration Validation:
1. **Visual DB verification** - Screenshot showing new fields with data
2. **Null check** - Confirm no unexpected nulls in required fields
3. **API test** - GET/POST/PUT all work with new schema
4. **Old data test** - Verify pre-existing records still work
5. **Document in migration log** - Complete entry with evidence

**If any discipline guardrail is at risk:**
- **STOP immediately**
- **Request user validation** before proceeding
- **Explain the risk** and proposed mitigation
- **Wait for explicit approval** to continue

## 🚨 MANDATORY PAUSE CONDITIONS (DB Focus)

**Claude MUST stop and request evidence if ANY of these conditions are true:**

### Missing Evidence:
- [ ] No visual DB screenshot provided by user
- [ ] Schema validation script fails to connect (normal for Railway)
- [ ] No end-to-end feature test results provided
- [ ] User has not confirmed feature works on live URL

### Database Risks:
- [ ] Migration command failed or returned errors
- [ ] Cannot verify if existing data was preserved  
- [ ] New columns/tables not confirmed to exist
- [ ] Feature behavior doesn't match expected database changes

### Field Addition Risks:
- [ ] Adding NOT NULL field without DEFAULT value
- [ ] No backfill strategy for existing rows
- [ ] API endpoints not updated to handle new fields
- [ ] Frontend crashes on null/undefined values
- [ ] "column does not exist" errors in logs

**PAUSE MESSAGE TEMPLATE:**
```
🚨 STOPPING - Database Evidence Required

I cannot proceed with further database-related changes until you provide:

1. **Visual DB Screenshot** - Railway UI showing table structure
2. **End-to-end Test** - Confirm feature works on live application  
3. **Data Preservation** - Verify existing data was not lost
4. **Schema Validation** - Run deployed app to test DB structure

Please provide evidence before I continue with any database work.
```

**Guardrail violations that require STOP:**
- PR would exceed 150 LOC
- Quality gates (typecheck/lint/build) failing
- No clear evidence of what "working" means
- Taking >1 hour for basic feature
- Complex changes without user approval

## Development Commands

```bash
npm run dev        # Start development server
npm run build      # Build for production  
npm run start      # Start production server
npm run lint       # ESLint with --max-warnings 0
npm run typecheck  # TypeScript validation (no errors)
```

## 🔒 DISCIPLINE-FIRST GUARDRAILS (MANDATORY)

### Quality Gates (Zero Tolerance)
- ✅ **≤150 LOC per PR** - Never merge huge changes
- ✅ **npm run typecheck** - Zero TypeScript errors allowed
- ✅ **npm run lint** - Zero ESLint warnings allowed (--max-warnings 0)
- ✅ **npm run build** - Must build successfully
- ✅ **Husky pre-commit** - Automatic quality checks before commit
- ✅ **CI/CD pipeline** - GitHub Actions enforces all checks

### Evidence-Based Development
- ✅ **Red-first approach** - Define what "working" looks like before coding
- ✅ **Manual evidence** - Screenshots/videos of features working
- ✅ **Railway validation** - Feature must work on production URL
- ✅ **User validation** - Product owner confirms expectations met

## Product Architecture & Development Principles

**Platform Vision:**  
A player-centric tennis career platform designed to leverage modern AI services for data-driven insights and growth.

**Development Model:**  
- Rapid, incremental delivery via "vibe coding"
- Claude Code: main implementer
- ChatGPT: advisor and QA/strategy  
- Product Owner: vision, UX, validation

**Technology Stack (MVP):**
- **Frontend:** Next.js 15 (TypeScript, Tailwind CSS), SSR enabled
- **Backend:** Next.js API routes (migrate to dedicated backend if needed)
- **Database:** PostgreSQL via Railway, using Drizzle ORM
- **AI Integration:** External APIs only (OpenAI, Anthropic, etc.)

## Code Architecture

**Current Structure:**
- `src/app/` - Next.js App Router pages and layouts
- `src/app/page.tsx` - Homepage with tennis platform branding
- `src/app/about/page.tsx` - About page with project information
- `src/app/layout.tsx` - Root layout with Tailwind CSS
- `src/app/globals.css` - Global styles and Tailwind imports

**Key Principles:**
- **Player-centric design** - everything revolves around player development
- **Simple first** - start with basic functionality, add complexity when proven needed
- **AI as a Service** - no local AI processing, external APIs only
- **Evidence-based development** - test and validate before adding features

## Development Guidelines

**Architecture Decisions:**
- Use Next.js API routes for MVP backend
- PostgreSQL + Drizzle ORM for data persistence  
- External AI APIs for insights and analysis
- SSR enabled for flexibility and SEO

**Code Style:**
- TypeScript strict mode
- Tailwind CSS for styling
- Component-based architecture
- Clear separation of concerns

**Quality Requirements:**
- All code must pass `npm run typecheck`
- All code must pass `npm run lint --max-warnings 0`
- All code must pass `npm run build`
- Husky enforces these checks pre-commit
- GitHub Actions CI enforces on every PR

## Development Workflow

1. **Before Coding:** Define success criteria (what "working" looks like)
2. **Small Changes:** Keep PRs ≤150 LOC for reviewability
3. **Quality Gates:** All commits must pass typecheck + lint + build
4. **Evidence:** Screenshot/video proof of features working
5. **Deploy:** Push to main triggers automatic Railway deployment
6. **Validate:** User confirms feature works on Railway URL

**AI Integration Pattern:**
- All AI features use external APIs
- Secure API key management via environment variables
- Async processing for AI tasks
- Clear error handling for API failures

## Deployment

**Railway Configuration:**
- Automatic deployment on push to main branch
- SSR build (no static export)
- PostgreSQL service integrated
- Environment variables managed in Railway dashboard

**Required Environment Variables:**
- `DATABASE_URL` - PostgreSQL connection (provided by Railway)
- Additional variables added as features develop

## Current Features

- ✅ Next.js 15 with TypeScript and Tailwind CSS  
- ✅ Homepage with tennis platform branding
- ✅ About page with navigation
- ✅ Railway deployment with SSR
- ✅ GitHub integration for auto-deployment
- ✅ Quality gates: Husky + GitHub Actions CI
- ✅ Discipline guardrails enforced

## Alignment Testing

**Before Every Commit:**
- [ ] Is change <150 lines?
- [ ] Does `npm run typecheck` pass?
- [ ] Does `npm run lint` pass?
- [ ] Does `npm run build` pass?
- [ ] Is there evidence of what "working" means?

**Before Every Feature:**
- [ ] Demo works on Railway production URL?
- [ ] Product owner confirms "this is what I wanted"?
- [ ] Evidence documented (screenshots/videos)?
- [ ] Ready for next development step?

**Misalignment Signals (STOP immediately):**
- ❌ Taking >1 hour for basic feature implementation
- ❌ User cannot test the feature immediately
- ❌ Feature doesn't work on Railway deployment
- ❌ Unclear what to build next
- ❌ Quality gates failing

## Emergency Procedures

**If Quality Gates Fail:**
1. Fix immediately - don't bypass
2. Simplify approach if stuck >30 minutes
3. Document issues for lessons learned

**If Deployment Breaks:**
1. Immediate rollback to last working commit
2. Fix quality gates locally
3. Test on Railway before merge

This platform prioritizes sustainable development velocity through enforced discipline and quality gates.