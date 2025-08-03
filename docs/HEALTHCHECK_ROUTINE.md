# Development Healthcheck Routine

> **"Before you build, prove you should."**

This healthcheck routine must be executed at the start of every development session and before beginning any new feature work. It enforces compliance with our [Development Manifesto](./DEVELOPMENT_MANIFESTO.md) and prevents scope creep, broken promises, and wasted effort.

## 🚨 **MANDATORY PRE-WORK CHECKLIST**

Before starting ANY development work, both parties must answer these questions:

### **1. Previous Work Validation** ✅
- [ ] **Has the user tested the last completed feature?**
- [ ] **Did the user confirm it works as intended?**
- [ ] **Is there documented evidence of working functionality?**

**🚩 RED FLAG**: If any answer is "No", STOP all new work and validate previous work first.

### **2. Current State Assessment** ✅  
- [ ] **Are there any known broken basic features?**
- [ ] **Can users complete core workflows successfully?**
- [ ] **Is the current focus on ONE specific feature?**

**🚩 RED FLAG**: If basic features are broken, STOP all new development and fix them first.

### **3. Session Goals Clarity** ✅
- [ ] **Is today's goal clearly defined and specific?**
- [ ] **Is the goal achievable in one focused session?**
- [ ] **Is the "definition of done" explicitly agreed upon?**

**🚩 RED FLAG**: If goals are vague or too large, break them down further before proceeding.

### **4. Scope Discipline Check** ✅
- [ ] **Are we completing existing work before starting new work?**
- [ ] **Are we avoiding discussions of future features?**
- [ ] **Are we focused on user problems, not technical complexity?**

**🚩 RED FLAG**: If discussing new features while old ones are broken, STOP and refocus.

### **5. Evidence Standards** ✅
- [ ] **Will we test functionality immediately after building it?**
- [ ] **Will we require user validation before proceeding?**
- [ ] **Are we prepared to show working demos, not just code?**

**🚩 RED FLAG**: If planning to claim completion without user testing, reset expectations.

## 🔍 **RED FLAG DETECTION SYSTEM**

### **Immediate Red Flags (STOP IMMEDIATELY):**

#### **🚩 The Broken Foundation Flag**
- **Trigger**: Basic user workflows are not working
- **Examples**: Login fails, profile doesn't save, core features broken
- **Action**: STOP all new work until basic functionality is restored
- **Override**: Only for security or data loss prevention

#### **🚩 The Assumption Flag**  
- **Trigger**: Claims of working functionality without user testing
- **Examples**: "The audit system should work", "Profile saving is probably fine"
- **Action**: IMMEDIATELY test with user before proceeding
- **Override**: None - this flag cannot be overridden

#### **🚩 The Scope Creep Flag**
- **Trigger**: Discussing new features while current ones are incomplete
- **Examples**: Planning calendar views while profile forms are broken
- **Action**: Table new discussions and complete current work
- **Override**: Only for critical user feedback requiring immediate pivot

### **Warning Flags (PROCEED WITH CAUTION):**

#### **⚠️ The Analysis Paralysis Flag**
- **Trigger**: >30 minutes of discussion without building anything
- **Action**: Start building the smallest possible increment
- **Escalation**: Becomes red flag after 1 hour without action

#### **⚠️ The Perfect Solution Flag**
- **Trigger**: Designing complex systems instead of solving immediate problems
- **Action**: Build minimal working version first
- **Escalation**: Becomes red flag if delaying user validation

#### **⚠️ The Documentation Over Delivery Flag**
- **Trigger**: Writing extensive plans while features remain broken
- **Action**: Fix functionality first, document later
- **Escalation**: Becomes red flag if basic workflows don't work

## 📊 **COMPLIANCE SCORING SYSTEM**

### **Daily Compliance Score (0-10):**

**Score Calculation:**
- ✅ Started with healthcheck: +2 points
- ✅ Focused on single feature: +2 points  
- ✅ User tested all changes: +2 points
- ✅ No scope creep occurred: +2 points
- ✅ Evidence provided for all claims: +2 points

**Score Interpretation:**
- **8-10**: Excellent discipline, sustainable progress
- **6-7**: Good work, minor improvements needed
- **4-5**: Poor discipline, high risk of wasted effort
- **0-3**: Critical failure, reset methodology immediately

### **Weekly Compliance Tracking:**
```
Week of [DATE]:
Mon: [Score] - [Notes]
Tue: [Score] - [Notes]  
Wed: [Score] - [Notes]
Thu: [Score] - [Notes]
Fri: [Score] - [Notes]

Weekly Average: [X.X]
Trend: [Improving/Stable/Declining]
```

## 🛠️ **CORRECTIVE ACTIONS**

### **When Red Flags are Triggered:**

#### **Step 1: IMMEDIATE STOP**
- Halt all development activity
- Document the red flag trigger
- Acknowledge the manifesto violation

#### **Step 2: ROOT CAUSE ANALYSIS**
- Why did the red flag occur?
- What manifesto principle was violated?
- How can we prevent this in the future?

#### **Step 3: CORRECTIVE ACTION**
- Address the immediate issue (fix broken feature, validate claims, etc.)
- Return to manifesto compliance
- Resume work only after compliance is restored

#### **Step 4: DOCUMENTATION**
```
RED FLAG INCIDENT: [Date/Time]
Flag Type: [Which red flag was triggered]
Trigger: [What caused the flag]
Impact: [How much time/effort was wasted]
Resolution: [What was done to fix it]
Prevention: [How to avoid in future]
```

## 🔄 **SESSION STARTUP PROTOCOL**

### **Every Development Session Must Begin With:**

1. **Read the Manifesto**: Review core principles (2 minutes)
2. **Execute Healthcheck**: Complete all 5 checklist items (5 minutes)
3. **Address Red Flags**: Fix any issues before proceeding (varies)
4. **Set Session Goals**: Define specific, testable objectives (3 minutes)
5. **Confirm Agreement**: Both parties commit to manifesto compliance

### **Session Startup Template:**
```
=== DEVELOPMENT SESSION STARTUP ===
Date: [DATE]
Session Goal: [Specific objective]

HEALTHCHECK RESULTS:
□ Previous work validated: [Y/N] - [Evidence]
□ No broken basics: [Y/N] - [Status]  
□ Clear session goals: [Y/N] - [Goal]
□ Scope discipline: [Y/N] - [Focus]
□ Evidence standards: [Y/N] - [Method]

RED FLAGS DETECTED: [None/List]
CORRECTIVE ACTIONS: [None/Description]

COMPLIANCE COMMITMENT:
Developer: [Agreed to follow manifesto]
Product Owner: [Agreed to enforce manifesto]

PROCEED: [Y/N]
```

## 📈 **SUCCESS PATTERNS**

### **Green Light Indicators:**
- [ ] All healthcheck items pass consistently
- [ ] User can complete intended workflows
- [ ] Features work reliably across sessions
- [ ] No accumulation of "partially working" features
- [ ] Sustainable development velocity

### **Sustainable Development Rhythm:**
1. **Morning**: Execute healthcheck, set focused goals
2. **Build**: Implement smallest possible increment
3. **Test**: Immediate user validation of changes
4. **Validate**: Confirm working functionality with evidence
5. **Document**: Record what works, plan next increment

## 🎯 **HEALTHCHECK EVOLUTION**

### **Monthly Review:**
- Which red flags occur most frequently?
- What corrective actions are most effective?
- How can the healthcheck routine be improved?
- What new failure patterns have emerged?

### **Continuous Improvement:**
This healthcheck routine should evolve based on actual failures and successes. When new failure patterns emerge, add corresponding red flags. When red flags become obsolete, remove them to keep the system lean and effective.

---

**This healthcheck routine is mandatory. Skipping it leads to the failure patterns we're trying to avoid. Following it ensures focused, effective development that delivers working software.**

**Version:** 1.0  
**Last Updated:** {DATE}  
**Status:** ACTIVE - Must be executed before all development work