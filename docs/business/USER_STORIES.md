# User Stories - Tennis Career Platform

## Primary Users

### 🎾 **Sonia (Player) - Age 13**
Target user for Phase 1 testing and validation.

#### Core User Stories

**US-001: Player Profile Creation**
- **As a** young tennis player
- **I want to** create my own profile with tennis-specific information
- **So that** my coaches have all the information they need about my playing style and goals

**Acceptance Criteria:**
- Can enter basic info (name, age, nationality)
- Can specify dominant hand and backhand style
- Can add current UTR/NTRP ratings
- Can select an inspirational player
- Can include a short bio about tennis goals

---

**US-002: Education Information Management**
- **As a** student athlete
- **I want to** document my education approach (stationary/remote/hybrid)
- **So that** my coaches can plan training around my school schedule

**Acceptance Criteria:**
- Can select education type
- Can specify grade level and curriculum type
- Can add school name and country
- Parents can update this information

---

**US-003: Team Creation and Ownership**
- **As a** young tennis player
- **I want to** create my own development team
- **So that** I can invite the coaches who help me and keep all my tennis data in one place

**Acceptance Criteria:**
- Can create a team with my name
- Receive a unique invite code to share
- Can see all coaches who join my team
- Can manage who has access to my information

### 👨‍👩‍👧 **Parents (Father & Mother)**
Both parents actively involved in Sonia's tennis development.

#### Core User Stories

**US-004: Dual Parent Access**
- **As a** tennis parent
- **I want to** both parents to have full access to our daughter's tennis information
- **So that** we can both stay informed and make decisions together

**Acceptance Criteria:**
- Both parents can link to child's account
- Can view all player information and progress
- Can update education and profile information
- Can see coach communications and feedback

---

**US-005: Educational Planning**
- **As a** parent planning my child's education
- **I want to** track education type and requirements alongside tennis
- **So that** I can balance academic and athletic development

**Acceptance Criteria:**
- Can update education information
- Can see how training schedule impacts school
- Can plan for different education approaches (remote/hybrid)

---

**US-006: Coach Oversight**
- **As a** parent investing in tennis coaching
- **I want to** see which coaches are working with my child
- **So that** I can ensure quality instruction and coordinate between coaches

**Acceptance Criteria:**
- Can view all coaches on child's team
- Can see coach specializations (head, performance, sparring)
- Can access coach feedback and communications

### 🎾 **Head Coach**
Primary technical and strategic coach.

#### Core User Stories

**US-007: Player Information Access**
- **As a** head tennis coach
- **I want to** access comprehensive player information
- **So that** I can provide personalized coaching and track development

**Acceptance Criteria:**
- Can view player profile, ratings, and playing style
- Can see education schedule to plan training
- Can access historical performance data
- Can coordinate with other coaches on the team

---

**US-008: Multi-Coach Coordination**  
- **As a** head coach working with performance and sparring coaches
- **I want to** see what other coaches are working on
- **So that** I can coordinate training and avoid conflicts

**Acceptance Criteria:**
- Can see other coaches on player's team
- Can view training schedules and focus areas
- Can communicate with other coaches
- Can plan complementary training approaches

### 🏃‍♂️ **Performance Coach**
Fitness and conditioning specialist.

#### Core User Stories

**US-009: Fitness Integration**
- **As a** performance coach
- **I want to** understand the player's technical training schedule
- **So that** I can plan fitness work that complements technical development

**Acceptance Criteria:**
- Can access player's full training calendar
- Can see technical coach's focus areas
- Can plan conditioning around match schedule
- Can track fitness progress over time

### 🎾 **Sparring Partner**
Practice partner and match play specialist.

#### Core User Stories

**US-010: Practice Planning**
- **As a** sparring partner
- **I want to** know what the player is working on technically
- **So that** I can structure practice matches to reinforce learning

**Acceptance Criteria:**
- Can see technical focus areas from head coach
- Can view player's current skill level and ratings
- Can plan appropriate challenge level for practice
- Can provide feedback on match play development

## Pain Points Addressed

### 🚫 **Current Problems**

**WhatsApp Chaos**
- Information scattered across multiple group chats
- Hard to find previous conversations
- No structured way to track progress
- Parents, coaches, and player all in different conversations

**No Centralized Information**
- Player details shared repeatedly via messages
- Education schedule communicated ad-hoc
- Coach specializations unclear
- No single source of truth for player information

**Lack of Coordination**
- Coaches don't know what others are working on
- Training conflicts due to poor communication
- Parents out of the loop on training focus
- No systematic approach to player development

### ✅ **Our Solution**

**Centralized Player Information**
- Single profile with all tennis and education data
- Always up-to-date and accessible to authorized team members
- Structured data instead of chat messages

**Clear Team Structure**
- Player owns their development team
- Clear coach roles and specializations
- Easy invitation system with unique codes
- Transparent access control

**Parent Integration**
- Both parents have full visibility
- Can update information as needed
- Clear communication channel with coaches
- Balance academic and athletic planning

## Success Metrics

### Phase 1 Success Criteria
- **Sonia can create her complete player profile** (< 5 minutes)
- **Both parents can access and update her information**
- **All 3 coaches can join her team** using invite codes
- **Coaches can view her profile and education info**
- **System replaces WhatsApp for basic coordination**

### Long-term Success Metrics
- **Time saved**: 30+ minutes/week on coordination
- **Information accuracy**: 100% up-to-date player data
- **Parent satisfaction**: 9/10 on visibility and control
- **Coach coordination**: Reduced training conflicts by 80%
- **Player ownership**: Sonia feels in control of her development

## User Journey Maps

### New Player Onboarding
1. **Sign up** with Google OAuth
2. **Select role** as "Player"
3. **Create profile** with tennis information
4. **Add education** details
5. **Create team** and get invite code
6. **Share code** with parents and coaches
7. **Welcome coaches** as they join

### Parent Access Flow
1. **Sign up** with Google OAuth
2. **Link to child** using email or invite
3. **Switch to child view** to see their information
4. **Update education** information as needed
5. **Monitor coach** team and communications

### Coach Joining Flow
1. **Receive invite code** from player/parent
2. **Sign up** with Google OAuth  
3. **Enter code** and select coach type
4. **Join team** and access player information
5. **Coordinate** with other team coaches

This user story collection focuses on solving real coordination problems for Sonia's tennis development while building a foundation for broader tennis community use.