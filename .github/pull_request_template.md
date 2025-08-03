## Discipline-First Checklist

- [ ] ≤150 LOC changed
- [ ] Passes `npm run typecheck`
- [ ] Passes `npm run lint --max-warnings 0`
- [ ] Passes `npm run build`
- [ ] Manual/automated evidence attached (screenshot, log, Notion link)
- [ ] Product Owner (Bartek) validation

## Evidence Required

**Choose one:**
- [ ] **Screenshot/Video** - Visual proof of feature working on Railway deployment
- [ ] **Notion Product Log** - Link to entry in product development log
- [ ] **Manual Test Results** - Clear description of test scenarios and results
- [ ] **Automated Test** - New test cases covering the feature

**Evidence Link/Description:**
<!-- Paste screenshot, link to Notion, or describe test evidence here -->

## Feature Description

**What does this PR do?**
<!-- Brief description of the feature/fix -->

**Why is this needed?**
<!-- Player-centric justification for the change -->

**How to test:**
1. <!-- Step-by-step instructions for testing on Railway URL -->
2. 
3. 

## Quality Gates Status

- [ ] **Local validation** - All quality commands pass locally
- [ ] **CI validation** - GitHub Actions CI passes
- [ ] **Railway deployment** - Feature works on production URL
- [ ] **Red-first evidence** - Success criteria were defined before implementation

## Risk Assessment

- [ ] **Low risk** - Simple change, well-tested
- [ ] **Medium risk** - New functionality, requires validation
- [ ] **High risk** - Complex change, needs careful review

**If medium/high risk, explain mitigation:**
<!-- Describe how risks are mitigated -->

---

**By submitting this PR, I confirm:**
- This change follows discipline-first, evidence-based development principles
- The feature works on Railway production deployment
- Quality gates are enforced and passing
- Evidence demonstrates the feature meets requirements