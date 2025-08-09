# Migration: Backend Data Filtering & Test Users

**Date**: 2025-08-09
**Author**: Claude Code
**Status**: ✅ Complete

## Summary
Implemented role-based backend data filtering for calendar events and created test user seeding system.

## Changes Made

### 1. Database Schema Updates
- Added `parent_child` table for parent-child relationships
- Added `event_participants` table for tracking event attendance
- Generated migration: `0006_early_wind_dancer.sql`

### 2. Permission System Updates
- Fixed date filtering bug (was using `eq` instead of `gte`/`lte`)
- Implemented role-based filtering in `getVisibleEvents()`:
  - **Coaches**: See all team events
  - **Parents**: See only events where their children are participants
  - **Players**: See only events they're participating in

### 3. Test User System
- Created `scripts/seed-test-users.ts` with:
  - Coach: coach@test.com
  - Parent: parent@test.com
  - Player: player@test.com
  - Sample events with proper participant relationships

### 4. Package Scripts
- Added `db:push` for applying migrations
- Added `db:generate` for creating new migrations
- Added `db:seed` for seeding test users

## Migration Steps

```bash
# 1. Apply database migration
npm run db:push

# 2. Seed test users (optional for testing)
npm run db:seed
```

## Testing Checklist
- [ ] Migration applies cleanly to production DB
- [ ] Coach can see all events
- [ ] Parent sees only their child's events
- [ ] Player sees only their participating events
- [ ] Parent request system still works
- [ ] No performance degradation

## Rollback Plan
If issues occur:
1. Revert code changes
2. Drop new tables: `parent_child`, `event_participants`
3. Restore previous `getVisibleEvents` implementation

## Notes
- New tables are empty by default, won't affect existing functionality
- Filtering is backward compatible - if no relationships exist, coaches still see all
- Test users use password: `testpass123`