# 🔒 Discipline-First Guardrails

This document enforces anti-chaos development principles to prevent drift back into complexity.

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