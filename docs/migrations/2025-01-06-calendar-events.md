# Calendar Events Migration

Date: 2025-01-06
Migration: 0004_small_harrier.sql

## Purpose
Add calendar_events table to support team activity scheduling (Phase 1 of calendar feature).

## Schema Changes

### New Table: calendar_events
```sql
CREATE TABLE "calendar_events" (
  "id" serial PRIMARY KEY NOT NULL,
  "team_id" integer NOT NULL,
  "created_by" integer NOT NULL,
  "title" varchar(255) NOT NULL,
  "description" text,
  "activity_type" "activity_type" NOT NULL,
  "start_time" timestamp with time zone NOT NULL,
  "end_time" timestamp with time zone NOT NULL,
  "location" varchar(255),
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);
```

### New Enum: activity_type
```sql
CREATE TYPE "public"."activity_type" AS ENUM('practice', 'gym', 'match', 'tournament', 'education');
```

### Foreign Keys
- `team_id` -> `teams.id`
- `created_by` -> `users.id`

## Design Decisions

1. **Activity Type as ENUM**: Using database ENUM instead of free text for type safety and reliable filtering
2. **UTC Timestamps**: All times stored with timezone (UTC) for consistent handling across time zones
3. **Ownership Tracking**: Both team_id and created_by for permission logic and audit trail
4. **Audit Fields**: created_at and updated_at for tracking changes

## Quality Checks
- ✅ TypeScript validation passed
- ✅ ESLint validation passed (0 warnings)
- ✅ Build successful
- ✅ Migration under 150 LOC (18 lines)

## Migration Command
```bash
npx drizzle-kit push
```

## Rollback
```sql
DROP TABLE IF EXISTS "calendar_events";
DROP TYPE IF EXISTS "activity_type";
```

## Next Steps
- Apply migration to Railway database
- Implement CRUD API endpoints (Phase 2)
- Add basic UI components (Phase 3)