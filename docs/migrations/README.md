# Database Migration Documentation

This directory contains complete logs for all database migrations to ensure full traceability and prevent data loss.

## How to Use

### For Every Database Change:
1. **Copy the template**: Use `TEMPLATE-migration-log.md` as your starting point
2. **Fill in details**: Complete all sections with actual data
3. **Attach evidence**: Include screenshots and test results
4. **Name consistently**: Use format `YYYY-MM-DD-brief-description.md`

### Required Evidence for Every Migration:
- [ ] **Visual DB Screenshot** - Railway UI showing table structure
- [ ] **End-to-end Test Results** - Feature working on live deployment
- [ ] **Schema Validation** - Script output or connection info
- [ ] **Migration Commands** - Exact commands executed
- [ ] **Rollback Plan** - How to undo if needed

### Migration Process Checklist:
1. **Before Migration**:
   - [ ] Backup current DB state (screenshot existing tables)
   - [ ] Test migration on local/dev environment first
   - [ ] Prepare rollback plan

2. **During Migration**:
   - [ ] Document every command executed
   - [ ] Note any errors or unexpected behavior
   - [ ] Capture timestamps of key steps

3. **After Migration**:
   - [ ] Visual verification of new schema
   - [ ] End-to-end feature testing
   - [ ] Data preservation confirmation
   - [ ] Complete migration log with evidence

## Migration Naming Convention

```
YYYY-MM-DD-brief-description.md
```

**Examples:**
- `2025-08-06-invite-code-migration.md`
- `2025-08-10-add-user-profiles.md`
- `2025-08-15-team-permissions-schema.md`

## Emergency Procedures

### If Migration Fails:
1. **Stop immediately** - Don't attempt fixes without analysis
2. **Document the failure** - Screenshot errors, note what was attempted  
3. **Execute rollback plan** - Restore previous working state
4. **Update migration log** - Mark as failed with full details
5. **Review and revise** - Analyze root cause before retry

### If Data is Lost:
1. **Alert product owner immediately**
2. **Document what data was affected**
3. **Check for backup/restore options**
4. **Create incident report in migration log**
5. **Implement prevention measures**

## Current Migrations

- [2025-08-06-invite-code-migration.md](2025-08-06-invite-code-migration.md) - ✅ Complete
- `TEMPLATE-migration-log.md` - 📝 Template for new migrations

---

**Remember**: Never merge a PR without complete migration documentation and visual evidence!