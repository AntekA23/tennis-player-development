# ADR-002: Safe Database Migration Strategy

## Status
Accepted

## Context
Previous development attempts resulted in database debugging nightmares due to complex migrations and lack of verification procedures. We need a foolproof approach to database changes.

## Decision
Implement a conservative migration strategy:
1. **One table/column at a time**: Never batch changes
2. **Manual verification required**: Check Railway after each change
3. **Local testing mandatory**: Test everything locally first
4. **Visual confirmation**: Screenshot evidence of success
5. **Prepared rollbacks**: Have undo scripts ready

## Consequences

### Positive
- **Reduced Risk**: Minimal chance of corrupting production data
- **Easy Debugging**: Issues are isolated to single changes
- **Quick Recovery**: Can rollback immediately if needed
- **Clear Progress**: Visible checkpoints of success

### Negative
- **Slower Development**: Takes longer to implement changes
- **More Deployments**: Each change requires separate deployment
- **Manual Work**: Requires human verification

## Implementation
- Create DATABASE_SAFETY.md with procedures
- Build debug endpoint for database state
- Establish checkpoint system with screenshots
- Prepare rollback scripts for each migration