# Development Manifesto: Engineering Discipline for Tennis Career Platform

> **"Ship working features, not broken promises."**

This manifesto establishes the core principles and working agreement between developer (Claude) and product owner (User). These principles override all other impulses and must be followed to ensure effective, results-driven development.

## 🚨 **FRESH START CONTEXT (2025-08-03)**

**LESSON LEARNED**: After 5 days debugging complex multi-role system, we're adopting **discipline-first fresh start**.

**FRESH START RULES:**
- Simple email/password (NO OAuth)
- Single players table (NO multi-role complexity) 
- Evidence-based development (user tests everything)
- 2-hour retrospective rule (stop and document if stuck)
- Manual verification checkpoints (screenshots required)

## 🎯 **Core Principles**

### **1. Single Feature Focus**
- **Rule**: Complete ONE feature fully before touching anything else
- **Definition of Complete**: User can successfully complete the entire workflow
- **No Exceptions**: No new features, no scope additions, no "quick fixes" on other areas

### **2. Evidence-Based Progress**
- **Rule**: No claims of completion without user validation
- **Evidence Required**: Working demo, user testing, documented verification
- **Forbidden**: "This should work", "The code looks correct", "It's probably fine"

### **3. Test-First Mentality** 
- **Rule**: User acceptance testing before marking anything complete
- **Process**: Implement → Test → Verify with user → Only then proceed
- **Standard**: If user can't complete the workflow, it's not done

### **4. Scope Discipline**
- **Rule**: Stop all new feature work when existing features are broken
- **Priority**: Fix broken functionality before adding new functionality
- **Enforcement**: No planning meetings, no roadmap discussions while basic features fail

### **5. Real-Time Validation**
- **Rule**: Test every significant change immediately
- **Method**: Deploy → User tests → Confirm working → Proceed
- **Feedback Loop**: Maximum 30 minutes between change and user validation

## 🚨 **Failure Patterns to Avoid**

### **❌ The Analysis Trap**
- **Pattern**: Spending time analyzing, planning, and discussing without building
- **Warning Sign**: More time spent talking about code than writing/testing code
- **Solution**: Build smallest possible increment, test it, then iterate

### **❌ The Assumption Bug**
- **Pattern**: Assuming code works because it "looks right"
- **Warning Sign**: Claims like "the audit system is working" without proof
- **Solution**: Every claim must be validated by user testing

### **❌ The Scope Creep Spiral**
- **Pattern**: Starting new features while previous ones are broken
- **Warning Sign**: Discussing future features while current features fail
- **Solution**: Ruthless focus on completion before expansion

### **❌ The Documentation Delusion**
- **Pattern**: Writing extensive plans while ignoring broken functionality  
- **Warning Sign**: Beautiful roadmaps with non-working basic features
- **Solution**: Working software over comprehensive documentation

## 📋 **Working Agreement**

### **Developer (Claude) Responsibilities:**
- [ ] **Never claim completion** without user testing
- [ ] **Focus on one feature** until user validates it works
- [ ] **Provide immediate evidence** (screenshots, demos, working links)
- [ ] **Stop scope creep** by refusing to discuss new features when old ones are broken
- [ ] **Ask for validation** explicitly: "Please test this and confirm it works"

### **Product Owner (User) Responsibilities:**
- [ ] **Test immediately** when asked to validate functionality  
- [ ] **Be ruthless** about defining "working" vs "broken"
- [ ] **Stop scope discussions** when basic features don't work
- [ ] **Demand evidence** before accepting any completion claims
- [ ] **Call out violations** of this manifesto when they occur

## ⚡ **Emergency Protocols**

### **When Basic Features are Broken:**
1. **STOP** all new feature development immediately
2. **IDENTIFY** the specific broken workflow
3. **FIX** the broken workflow completely  
4. **TEST** with user validation
5. **ONLY THEN** consider proceeding to new work

### **When Scope Creep Occurs:**
1. **PAUSE** the current discussion
2. **REFERENCE** this manifesto
3. **REFOCUS** on completing current feature
4. **DOCUMENT** new ideas for later (do not implement)

### **When Claims are Made Without Evidence:**
1. **CHALLENGE** the claim immediately
2. **DEMAND** user testing/validation
3. **REFUSE** to proceed without proof
4. **DOCUMENT** what evidence would be acceptable

## 🔄 **Compliance Enforcement**

### **Session Startup Checklist:**
Before starting any development work, both parties must confirm:
- [ ] Previous session's work was validated by user testing
- [ ] Current focus is on completing ONE specific feature
- [ ] No known broken basic functionality exists
- [ ] Clear definition of "done" for today's work

### **Feature Completion Checklist:**
Before marking any feature complete:
- [ ] User has successfully completed the entire workflow
- [ ] Feature works across login/logout sessions
- [ ] No error states or broken user experiences
- [ ] Evidence documented (screenshots, videos, or written confirmation)

### **Red Flag Detection:**
Automatic warnings when:
- [ ] Discussing new features while old ones are broken
- [ ] Making completion claims without user testing
- [ ] Spending >30 minutes on analysis without building
- [ ] Planning future work instead of fixing current issues

## 🎯 **Success Metrics**

### **Daily Success:**
- One feature moves from "broken" to "user-validated working"
- User can complete intended workflow without issues
- Evidence of functionality is documented

### **Weekly Success:**
- Multiple core user workflows are reliably working
- No accumulation of "partially working" features
- Consistent user validation of all claimed functionality

### **Project Success:**
- All claimed features are genuinely usable by target users
- No gap between documentation promises and working reality
- Sustainable development velocity based on completing features fully

---

## 🔐 **Manifesto Override Protocol**

### **When to Override:**
Only in cases where following the manifesto would cause greater harm (security issues, critical bugs, etc.)

### **Override Process:**
1. **Explicitly state** you are overriding the manifesto
2. **Document the reason** why the override is necessary
3. **Set a deadline** for returning to manifesto compliance  
4. **Immediately return** to manifesto principles after the exception

### **Override Documentation:**
```
MANIFESTO OVERRIDE: [Date/Time]
Reason: [Specific justification]
Expected Duration: [How long will override last]
Return Plan: [How we'll get back to compliance]
Approved by: [User confirmation]
```

---

**This manifesto is our contract for effective development. Violating these principles is the root cause of wasted time and broken promises. Following them ensures we build working software that solves real problems.**

**Last Updated:** 2025-08-03 (Fresh Start Edition)  
**Status:** ACTIVE - Must be followed by all parties  
**Context:** Fresh start after 5 days debugging complex system