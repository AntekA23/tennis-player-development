# 🔒 Discipline-First Guardrails

This document enforces anti-chaos development principles to prevent drift back into complexity.

## 🚨 STOP / PAUSE Conditions (Mandatory for All Development)

These rules apply to **all contributors**, including Claude Developer Agent.  
If any of these conditions are met, coding MUST STOP and work can only resume after Senior Advisor (ChatGPT) review and approval.

### STOP Conditions:
1. **No Approved Plan**
   - No step-by-step plan with defined success criteria approved by Senior Advisor.
   - Action: Request Senior Advisor plan before coding.

2. **Scope Creep**
   - Task includes changes not listed in the approved scope.
   - Action: Pause and request updated approval.

3. **LOC Limit Violation**
   - Estimated change size exceeds 150 LOC (excluding tests/docs).
   - Action: Seek explicit approval before proceeding.

4. **Quality Gate Risk**
   - Risk of failing `npm run typecheck`, `npm run lint --max-warnings 0`, or `npm run build`.
   - Action: Fix or get approval before continuing.

5. **Time Overrun**
   - Basic feature taking >1 hour to implement without results.
   - Action: Request plan simplification or scope reduction.

---

### Required STOP Messages:
When a STOP condition is hit, the Developer must output one of the following messages:

- **No Approved Plan**
```
🚨 STOP – No plan approved by Senior Advisor.
Cannot proceed until a step-by-step plan with success criteria is confirmed.
```

- **Scope Creep**
```
🚨 STOP – Task scope exceeds approved plan.
Requires Senior Advisor approval before continuing.
```

- **LOC Limit**
```
🚨 STOP – Estimated change size exceeds 150 LOC.
Confirm with Senior Advisor before proceeding.
```

- **Quality Risk**
```
🚨 STOP – Risk of failing quality gates (typecheck/lint/build).
Approval required before continuing.
```

- **Time Overrun**
```
🚨 STOP – Implementation taking >1 hour for a basic feature.
Requesting plan simplification before continuing.
```

For detailed STOP/PAUSE enforcement messages, see CLAUDE.md.

## Code Quality & PR Discipline

### ≤150 LOC per PR
- **Never merge huge PRs**
- Each pull request must be small, focused, and reviewable
- Large features broken into multiple PRs

### Red-First Evidence Blocks
- **Always define what "working" looks like before coding**
- Manual evidence: screenshots, videos, clear "expected" description
- Failing tests: write the test that fails first, then make it pass
- TODO/criteria must be clear in PR description

### Quality Commands (Zero Tolerance)
```bash
npm run typecheck  # No TypeScript errors allowed
npm run lint       # ESLint passes with --max-warnings 0
npm run build      # Project must build successfully
```

## CI/CD Guardrails

### Husky Pre-commit Hooks
- **Automatically runs**: `typecheck`, `lint`, `build` before every commit
- **No bypassing**: If hooks fail, commit is blocked
- **Local validation**: Catch issues before pushing

### CI Pipeline Requirements
- **GitHub Actions**: Automated checks on every PR
- **All checks must pass**: No green CI = no merge
- **No force merges**: Quality gates are mandatory

### Process Discipline
- **Incremental changes**: Every feature is its own PR
- **Clear quality gates**: Build + lint + typecheck = required
- **Deploy validation**: Must work on Railway production URL

## Database Field Addition Discipline

**CRITICAL: The #1 cause of production failures is missing/null fields after schema changes**

### Before Adding Any Field:
- [ ] Decide: Required (NOT NULL) or Optional (NULLABLE/DEFAULT)?
- [ ] Plan backfill strategy for existing rows
- [ ] Check all API endpoints that will read this field
- [ ] Verify frontend can handle null/undefined gracefully

### Field Addition Checklist:
1. **Migration Development**
   - Add field as NULLABLE initially (unless safe DEFAULT exists)
   - Include backfill UPDATE for existing rows if required
   - Only add NOT NULL constraint AFTER backfill completed

2. **Pre-Deploy Verification**
   ```sql
   -- Check existing row count that needs backfill
   SELECT COUNT(*) FROM table_name WHERE new_field IS NULL;
   ```

3. **API Safety Updates**
   - Use null-coalescing: `field ?? defaultValue`
   - Add validation for new required fields
   - Update TypeScript types to reflect nullability

4. **Post-Deploy Validation**
   - Verify all rows have valid values
   - Test with old data (pre-migration rows)
   - Check logs for any null-related errors

### Never Do This:
- ❌ Add NOT NULL field without DEFAULT or backfill
- ❌ Assume frontend will always send new field
- ❌ Deploy schema changes without API updates
- ❌ Skip testing with existing production data

## Database Discipline

- Every PR that modifies DB schema must include:
  - Manual verification that all migrations are applied in prod/dev DB
  - Visual evidence (TablePlus screenshot or migration logs)  
  - Confirmation that features work end-to-end with real DB data

### Mandatory DB Validation Steps
1. **Run schema validation:** `npx tsx scripts/check-schema.ts`
2. **Visual DB verification:** Screenshot actual table structure in Railway UI/TablePlus
3. **End-to-end feature test:** Prove feature works with real database data
4. **Migration traceability:** Document all steps in `docs/migrations/YYYY-MM-DD-description.md`
5. **Attach all evidence:** Screenshots, script output, and test results in PR

### Never merge until:
- [ ] Schema validation script passes (or connection issues documented)
- [ ] Visual DB screenshot confirms structure matches code
- [ ] Feature works end-to-end with real DB data
- [ ] Migration is fully documented in `/docs/migrations/`

## Final DB Validation Checklist

**Before merging any database-affecting PR:**

### 🔍 Schema Verification
- [ ] **Script attempted**: `npx tsx scripts/check-schema.ts` (connection issues logged if any)
- [ ] **Visual confirmation**: Screenshot of Railway UI showing table structure
- [ ] **Code alignment**: Database structure matches schema definitions in code

### 🧪 End-to-End Testing
- [ ] **Feature test run**: UI → Database → UI flow tested on live deployment
- [ ] **Data persistence**: New data properly stored and retrievable
- [ ] **Error handling**: Edge cases and error scenarios tested

### 📚 Documentation & Traceability  
- [ ] **Migration logged**: Complete entry in `docs/migrations/YYYY-MM-DD-description.md`
- [ ] **Evidence attached**: Screenshots, test results, script output included
- [ ] **Rollback plan**: Recovery steps documented if needed

### ✅ User Validation
- [ ] **Product owner tested**: Feature confirmed working on Railway URL
- [ ] **Requirements met**: Implementation matches original specifications
- [ ] **No data loss**: Existing data preserved through migration

**🚨 MERGE BLOCKER**: If ANY checkbox above is unchecked, PR cannot be merged.

## Evidence-Based Development

### Red-First Approach
- **Manual evidence first**: Define success criteria with screenshots/videos
- **Failing test approach**: Write test that fails, then implement
- **Clear expectations**: PR description explains what "working" means

### Validation Requirements
- **Manual test artifacts**: Screenshots/videos in PR or documentation
- **Production validation**: Feature works on live Railway URL
- **User acceptance**: Product owner validates feature meets requirements

## Quality Gate Enforcement

### Before Every Commit
- [ ] Is change <150 lines?
- [ ] Does `npm run typecheck` pass?
- [ ] Does `npm run lint` pass?
- [ ] Does `npm run build` pass?
- [ ] Is there evidence of what "working" means?

### Before Every Merge
- [ ] Does CI pass?
- [ ] Can feature be demonstrated on Railway URL?
- [ ] Has product owner validated the feature?
- [ ] Is there clear documentation of what was built?

### Every Feature
- [ ] Demo works on Railway production URL?
- [ ] Product owner confirms "this is what I wanted"?
- [ ] Evidence documented (screenshots/videos)?
- [ ] Ready for next development step?

## Alignment Testing

### Rapid Validation Checkpoints
- ✅ **Feature Demo** - Show working feature immediately
- ✅ **User Validation** - Product owner confirms expectations met
- ✅ **Railway URL Test** - Feature works live in production
- ✅ **Navigation Flow** - End-to-end user scenarios work

### Misalignment Signals (STOP if any occur)
- ❌ Taking >1 hour for basic feature implementation
- ❌ User cannot test the feature immediately
- ❌ Feature doesn't work on Railway deployment
- ❌ Unclear what to build next
- ❌ Debugging rabbit holes >30 minutes

## Commands Reference

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server

# Quality Checks (all must pass)
npm run typecheck        # TypeScript validation
npm run lint             # ESLint with zero warnings
npm run build            # Production build validation

# Git Hooks (automatic)
git commit               # Triggers: typecheck + lint + build
```

## Emergency Procedures

### If Quality Gates Fail
1. **Fix immediately** - Don't bypass or ignore
2. **Simplify approach** - If stuck >30 minutes, simplify
3. **Ask for help** - Don't debug in isolation >1 hour
4. **Document issues** - Add to lessons learned

### If Deployment Breaks
1. **Immediate rollback** - Revert to last working commit
2. **Fix quality gates** - Ensure all checks pass locally
3. **Test on Railway** - Validate fix works in production
4. **Document root cause** - Prevent future occurrences

## Success Metrics

- **PR size**: 90%+ of PRs ≤150 LOC
- **Build success**: 100% of commits pass quality checks
- **Deploy success**: 100% of merges deploy successfully
- **User validation**: 100% of features validated by product owner
- **Time to deploy**: Features live on Railway within minutes of merge

These guardrails ensure sustainable development velocity and prevent technical debt accumulation.