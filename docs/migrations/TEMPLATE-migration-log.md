# Migration Log: [Brief Description]

**Date:** YYYY-MM-DD  
**Migration:** [Detailed description of what was changed]  
**Environment:** Railway Production DB / Local Dev / Both  
**PR Link:** [Link to GitHub PR]

## Problem
[Describe the issue that required database changes]

## Solution Applied

### 1. Schema Changes
```sql
-- SQL changes made or Drizzle schema modifications
-- Include exact column definitions, constraints, etc.
```

### 2. Migration Steps
1. **Step 1** - [Describe each step taken]
2. **Step 2** - [Include commands executed]  
3. **Step 3** - [Note any issues encountered]

### 3. Commands Executed
```bash
# Copy-paste the exact commands run
cd "path/to/project"
npx drizzle-kit push --force
# Result: [✓] Changes applied
```

## Validation Results ✅/❌

### Database Structure Verified:
- [ ] **Visual screenshot attached** - Railway UI showing new columns/tables
- [ ] **Schema script passes** - `npx tsx scripts/check-schema.ts` output attached
- [ ] **Existing data preserved** - No data loss confirmed
- [ ] **New structure working** - Can query new columns/tables

### End-to-End Testing Results:
- [ ] **Feature creation test** - [Describe test and result]
- [ ] **Feature usage test** - [Describe test and result]  
- [ ] **Error scenarios** - [Test edge cases and error handling]
- [ ] **UI integration** - [Frontend properly uses new DB structure]

### Evidence Attached:
- Screenshot 1: [Description] 
- Screenshot 2: [Description]
- Test Results: [Link or description]
- Schema Output: [Script output or link]

## Next Steps
- [ ] [Any follow-up tasks]
- [ ] [Performance monitoring if needed]
- [ ] [Additional features that depend on this change]

## Files Changed
- `src/db/schema.ts` - [What was modified]
- `src/app/api/*/route.ts` - [API changes if any]
- Other files: [List any other affected files]

## Rollback Plan (if needed)
```sql
-- How to undo this change if something goes wrong
-- Include specific rollback steps
```

## Commit Information
- **Hash:** [git commit hash]
- **Message:** "[commit message]"
- **Branch:** [branch name if not main]

---

**Migration completed by:** [Name]  
**Validated by:** [Product Owner name]  
**Status:** ✅ Complete / ❌ Issues / ⏳ In Progress