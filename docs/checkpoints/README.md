# Database Verification Checkpoints

This folder contains screenshots and verification evidence for database migrations.

## Naming Convention
`YYYY-MM-DD-checkpoint-X-description.png`

Examples:
- `2025-01-29-checkpoint-1-initial-database-state.png`
- `2025-01-30-checkpoint-2-players-table-created.png`
- `2025-01-30-checkpoint-3-education-data-populated.png`

## What to Capture

### Before Migration
- Railway Drizzle Studio showing current tables
- Row counts for existing tables
- Current schema structure

### After Migration
- New table/column visible in Railway
- Sample data in new structures
- All existing data still intact

### Functional Verification
- Login/logout still works
- Existing features unchanged
- New feature working (if applicable)

## Verification Checklist

For each checkpoint:
- [ ] Screenshot of Railway database
- [ ] Test login functionality
- [ ] Verify existing data intact
- [ ] Check new feature works
- [ ] Update DEVELOPMENT_LOG.md with status
- [ ] Confirm rollback script ready

## Emergency Screenshots

If something goes wrong:
1. **Immediately** screenshot the current state
2. Save as `YYYY-MM-DD-ERROR-description.png`
3. Document what was attempted
4. Note any error messages
5. Don't attempt fixes until you understand the issue

## Database Debug Endpoint

Use `/api/debug/db` to get JSON data about:
- Table structure
- Row counts  
- Sample records
- Migration status

Save JSON output as `.json` files alongside screenshots for complete verification.