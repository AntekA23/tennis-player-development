# CLAUDE.md - Fresh Start Tennis Player Development

This file provides guidance to Claude Code (claude.ai/code) when working with the FRESH START tennis player development project.

## 🚨 **CRITICAL: Fresh Start Principles**

### **What We're Building**
- Simple player-only tennis development platform
- Basic email/password authentication (NO OAuth initially)
- One table (players) with working CRUD
- Evidence-based development with manual verification

### **What We're NOT Building (Yet)**
- ❌ NO Google/OAuth authentication
- ❌ NO parents, coaches, teams, or multi-role system
- ❌ NO complex features until basic CRUD works perfectly
- ❌ NO assumptions - only evidence

## 📐 **Core Discipline Rules**

### **1. Evidence Over Everything**
- No feature is "done" without screenshots
- Manual testing in incognito browser required
- User must verify before any merge
- CI green is necessary but NOT sufficient

### **2. Two-Hour Rule**
- If stuck for >2 hours: STOP
- Write retrospective in `/docs/retrospectives/`
- Document root cause and new rule
- Update this file with learning

### **3. Branch & PR Discipline**
- Each feature in own branch: `feat/`, `fix/`, `chore/`
- Keep changes ≤150 lines, ≤25 files
- PR must include:
  - Screenshots of working feature
  - SQL evidence from database
  - Incognito browser test results

## 🔒 **Mandatory Security & Testing Checkpoints**

### **Before EVERY Merge**
- [ ] **Incognito Browser Test**: Register → Login → Save Profile → Logout → Login → Verify Data
- [ ] **SQL Migration Evidence**: `SELECT * FROM drizzle."__drizzle_migrations"`
- [ ] **DB Structure Verification**: Schema matches actual database tables
- [ ] **No Secrets Check**: `git diff --staged` shows no .env or sensitive data
- [ ] **Deployed Test**: Feature works on Railway, not just localhost

### **Database Migration Rules**
- ✅ ALL `CREATE TABLE` statements use `IF NOT EXISTS`
- ✅ ALL `ALTER TABLE ... ADD COLUMN` statements use `IF NOT EXISTS`
- ✅ One table per migration file
- ✅ Manual verification after each migration
- ✅ Schema snapshot saved in `/docs/schema-snapshots/`

### **Authentication Security**
- bcrypt with ≥10 salt rounds
- Passwords never logged or exposed
- Sessions expire appropriately
- All endpoints validate authentication

## 🏗️ **Technical Stack (Minimal)**

### **Core Dependencies**
- Next.js 15 with App Router
- TypeScript
- Drizzle ORM
- PostgreSQL (Railway)
- Tailwind CSS
- bcrypt for password hashing

### **NO Additional Complexity**
- NO tRPC (use simple API routes)
- NO complex state management
- NO OAuth providers
- NO unnecessary abstractions

## 📋 **Development Workflow**

### **Phase 1: Setup**
1. Create public GitHub repository
2. Initialize Next.js with TypeScript
3. Setup database connection
4. Create comprehensive documentation

### **Phase 2: Database**
1. Create single `players` table
2. Write idempotent migration
3. Verify in Railway console
4. Save schema snapshot

### **Phase 3: Basic Auth**
1. Register endpoint with bcrypt
2. Login endpoint with session
3. Simple auth pages
4. Full incognito test cycle

### **Phase 4: Profile CRUD**
1. View/edit profile endpoints
2. Profile page with form
3. Save/load functionality
4. Complete persistence testing

## 📁 **Project Structure**

```
tennis-player-development/
├── README.md              # Security warnings, no-secrets policy
├── .gitignore            # Comprehensive secret exclusion
├── CLAUDE.md             # This file
├── src/
│   ├── app/              # Next.js app router
│   │   ├── api/          # Simple API routes
│   │   ├── auth/         # Login/register pages
│   │   └── profile/      # Player profile page
│   └── lib/
│       ├── db/           # Drizzle setup and migrations
│       └── auth/         # bcrypt helpers
├── docs/
│   ├── retrospectives/   # Learning from failures
│   ├── schema-snapshots/ # DB state after migrations
│   └── security/         # Security checklists
```

## ✅ **Definition of Done**

A feature is ONLY complete when:
1. Code is written and commits are clean
2. Incognito browser test passes completely
3. Data persists through logout/login cycle
4. Screenshots prove it works on deployed Railway
5. SQL queries show correct database state
6. User has manually verified and approved

## 🚨 **Red Flags to Avoid**

- 🚩 "It works on my machine" - must work on Railway
- 🚩 "The CI is green" - manual test still required
- 🚩 "I think it's working" - show evidence
- 🚩 Adding complexity before basics work
- 🚩 Debugging for >2 hours without retrospective

## 📝 **Retrospective Template**

When stuck >2 hours, create `/docs/retrospectives/YYYY-MM-DD-issue.md`:

```markdown
# Retrospective: [Issue]
Date: YYYY-MM-DD
Time Spent: Xh

## What Happened
[Description]

## Root Cause
[Why it failed]

## Solution
[What worked]

## New Rule
[Discipline update to prevent recurrence]
```

## 🎯 **Success Criteria**

The project succeeds when a new user can:
1. Register with email/password
2. Login successfully
3. Create/edit their player profile
4. Save changes
5. Logout
6. Login again
7. See their saved profile data

All verified with screenshots and zero assumptions.