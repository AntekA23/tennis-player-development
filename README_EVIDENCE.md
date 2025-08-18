# SONIQ – Evidence Steps (Phase-2 APIs)

## 1) Pick IDs (TablePlus)
```sql
-- Event (practice/gym/education)
select id, activity_type, start_time
from calendar_events
where activity_type in ('practice','gym','education')
order by start_time desc limit 1;

-- Player on that event
select user_id
from event_participants
where event_id = <EVENT_ID> and role = 'player'
limit 1;
```

## 2) Console one-liner (must return 200 + JSON)
```javascript
fetch(`/api/events/<EVENT_ID>/training-log`, {
  method:'POST',
  headers:{'Content-Type':'application/json'},
  credentials:'include',
  body:JSON.stringify({
    player_id:<PLAYER_ID>,
    attendance_status:'attended',
    performance_rating:8,
    notes:'QA evidence: console POST'
  })
}).then(r=>r.json()).then(console.log).catch(console.error);
```

## 3) DB verification (TablePlus)
```sql
select * from training_sessions
where event_id = <EVENT_ID> and player_id = <PLAYER_ID>;
```

## 4) Hard DB Gate (all must pass; screenshots)
```sql
-- Schema exists
select table_name from information_schema.tables
where table_schema='public' and table_name in
('calendar_events','event_participants','training_sessions','match_results');

select table_name from information_schema.views
where table_schema='public' and table_name='view_player_basic_stats';

-- Integrity (uniques/FKs)
select i.relname from pg_index x
join pg_class i on i.oid=x.indexrelid
join pg_class t on t.oid=x.indrelid
where t.relname='event_participants' and x.indisunique=true;

select tc.constraint_name,kcu.column_name,ccu.table_name,ccu.column_name
from information_schema.table_constraints tc
join information_schema.key_column_usage kcu using (constraint_name)
join information_schema.constraint_column_usage ccu using (constraint_name)
where tc.table_name='event_participants' and tc.constraint_type='FOREIGN KEY';

-- Role-by-type rehearsal (expect no rows)
select 1 from calendar_events e join event_participants ep on ep.event_id=e.id
where e.activity_type in ('practice','gym') and ep.role='parent';
```

## 🧷 End-of-day parking lot (what's next when you're back)

1. Flip `NEXT_PUBLIC_ENABLE_TRAINING_LOG_UI=true` (after evidence is logged) → redeploy.

2. Implement PR-1.1 (rev2) participant restrictions + tournament scope end-time.

3. Proceed to PR-3 Match Result Form once Training Log is proven in prod.

## Evidence Checklist

- [ ] TablePlus schema screenshots showing all tables/views exist
- [ ] Console API test screenshot showing 200 response
- [ ] DB verification screenshot showing inserted training_session row
- [ ] Integrity checks passing (FK constraints, unique indexes)
- [ ] Role validation queries returning 0 rows (no violations)

**Only after all evidence is captured and documented:**
- Set `NEXT_PUBLIC_ENABLE_TRAINING_LOG_UI=true` on Railway
- Redeploy to activate Training Log UI
- Feature is now evidence-backed and safe to use

---

# PR-DC1 Evidence Pack

## Pre-Coding DB Gate

Run this SQL to identify current participant role violations:

```sql
WITH e AS (SELECT id, activity_type::text AS etype FROM calendar_events),
ep AS (
  SELECT ep.event_id, ep.user_id, tm.role
  FROM event_participants ep JOIN team_members tm ON tm.user_id = ep.user_id
)
SELECT e.id, e.etype, ep.user_id, ep.role
FROM e JOIN ep ON ep.event_id=e.id
WHERE NOT (
  (e.etype='education' AND ep.role IN ('parent','player')) OR
  (e.etype IN ('practice','gym') AND ep.role IN ('player','coach')) OR
  (e.etype IN ('match','sparring_request') AND ep.role='player') OR
  (e.etype='tournament' AND ep.role IN ('parent','player','coach'))
);
```

**Result**: [Paste screenshot or rows here]

## Console One-Liners Testing

### Test 1: Negative - Parent in Match → 400
```javascript
// Replace EVT_ID with an existing event ID, PARENT_ID with a parent user ID
fetch('/api/calendar/events/EVT_ID', {
  method:'PUT', headers:{'Content-Type':'application/json'},
  body:JSON.stringify({
    activity_type:'match', start_at:new Date().toISOString(),
    participants:[{user_id:PARENT_ID}], endTouched:true
  })
}).then(r=>console.log('match/parent status', r.status));
```

**Expected**: Status 400
**Result**: [Paste status]

### Test 2: Positive - Education without endTouched → +60m
```javascript
// Replace EVT_EDU with event ID, PARENT_ID and PLAYER_ID with appropriate user IDs
fetch('/api/calendar/events/EVT_EDU', {
  method:'PUT', headers:{'Content-Type':'application/json'},
  body:JSON.stringify({
    activity_type:'education', start_at:new Date().toISOString(),
    participants:[{user_id:PARENT_ID},{user_id:PLAYER_ID}]
  })
}).then(r=>console.log('education status', r.status));
```

**Expected**: Status 200
**Result**: [Paste status]

### Test 3: Positive - Tournament National → +2d
```javascript
// Replace EVT_TOUR with event ID, PLAYER_ID with player user ID
fetch('/api/calendar/events/EVT_TOUR', {
  method:'PUT', headers:{'Content-Type':'application/json'},
  body:JSON.stringify({
    activity_type:'tournament', tournamentScope:'national',
    start_at:new Date().toISOString(),
    participants:[{user_id:PLAYER_ID}]
  })
}).then(r=>console.log('tournament status', r.status));
```

**Expected**: Status 200
**Result**: [Paste status]

## End-Time Verification

After running tests 2 and 3, verify computed end times:

```sql
SELECT id, activity_type, start_at, end_at
FROM calendar_events
WHERE id IN (EVT_EDU, EVT_TOUR);
```

**Result**: [Paste rows showing +60m for education, +2d for tournament]

## Quality Gates

```bash
npm run typecheck
npm run lint --max-warnings 0
npm run build
```

**Results**: [Paste output]

## LOC Count

```bash
# Count lines in changed files
wc -l src/lib/domain.ts
# Changes in API routes (use git diff to count)
```

**Total LOC**: [Confirm ≤130]

## Post-Merge Verification

After deployment, re-run the console checks to confirm production behavior matches test environment.

---

# PR-DB1: Database Constraint & Data Quality

## Migration Execution

### 1. Apply Migration
```sql
-- Run in Railway Console (copy-paste entire content)
\i drizzle/20250118_add_uq_event_participant.sql
```

### 2. Verify Constraint
```sql
-- Check constraint was created
SELECT 
  conname as constraint_name,
  contype as constraint_type,
  pg_get_constraintdef(oid) as definition
FROM pg_constraint 
WHERE conname LIKE '%event_participants%unique%' 
   OR conname LIKE '%event_user_unique%';
```

## Data Quality Validation

Execute each probe and document results:

### DQ-1: Duplicate Participants
```sql
\i dq/1_duplicate_participants.sql
```
**Expected**: 0 rows (no duplicates allowed after constraint)

### DQ-2: Role Mismatches  
```sql
\i dq/2_role_mismatches.sql
```
**Expected**: 0 rows (roles should be synchronized)

### DQ-3: Orphaned Participants
```sql
\i dq/3_orphaned_participants.sql  
```
**Expected**: 0 rows (all participants must be team members)

### DQ-4: Invalid Tournament Participants
```sql
\i dq/4_invalid_tournament_participants.sql
```
**Expected**: 0 rows (tournaments must have player participants)

## Evidence Package

Provide screenshots of:

1. **Migration Success**: Railway console showing successful constraint creation
2. **Constraint Verification**: Query result confirming constraint exists
3. **DQ Results**: All 4 probe results showing 0 rows returned
4. **Schema Validation**: TablePlus/Railway UI showing updated table structure

## Testing Constraint Enforcement

After migration, test that duplicate insertion fails:

```sql
-- This should fail with unique constraint violation
INSERT INTO event_participants (event_id, user_id, role) 
SELECT event_id, user_id, role 
FROM event_participants 
LIMIT 1;
```

**Expected**: Error message about unique constraint violation

## Local Development Setup

### 1. Sync Local DB
```bash
npx drizzle-kit pull:pg
```

### 2. Apply Migration Locally
```bash
psql $DATABASE_URL -f drizzle/20250118_add_uq_event_participant.sql
```

### 3. Run Data Quality Checks
```bash
for file in dq/*.sql; do
  echo "=== $file ==="
  psql $DATABASE_URL -f "$file"
  echo
done
```

## Quality Gates

Before merge, confirm:
- [ ] Migration applied successfully to production
- [ ] All 4 DQ probes return 0 rows
- [ ] Constraint violation test fails as expected  
- [ ] Schema changes visible in Railway UI
- [ ] Local database synchronized with production