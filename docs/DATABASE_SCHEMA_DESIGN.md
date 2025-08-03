# Database Schema Design - Low Level

## Current State (Phase 1A Complete)

### Existing Tables (schema-minimal.ts)

#### `user` table ✅ IMPLEMENTED
```sql
CREATE TABLE "user" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  email TEXT NOT NULL UNIQUE,
  emailVerified TIMESTAMP,
  image TEXT,
  role TEXT, -- Legacy field (parent, coach, player)
  user_type TEXT, -- New field (player, parent, coach) 
  createdAt TIMESTAMP DEFAULT NOW()
);
```

**Status**: ✅ Deployed with user_type column (Checkpoint 2 verified)  
**Migration**: 0002_illegal_silver_centurion.sql  
**Indexes**: Primary key on id, unique on email

#### NextAuth Tables ✅ IMPLEMENTED
- `account` - OAuth provider data
- `session` - User sessions  
- `verification_token` - Email verification

## Planned Tables (Player-Centric Design)

### Phase 1B: Basic Players Table

#### `players` table 🟡 NEXT TO IMPLEMENT
```sql
CREATE TABLE players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES "user"(id) NOT NULL,
  date_of_birth DATE,
  nationality TEXT,
  dominant_hand TEXT CHECK (dominant_hand IN ('left', 'right')),
  backhand_style TEXT CHECK (backhand_style IN ('one_handed', 'two_handed')),
  utr_rating DECIMAL(4,2), -- UTR rating (0.00 to 16.50)
  ntrp_rating DECIMAL(3,1), -- NTRP rating (1.0 to 7.0)
  inspirational_player TEXT,
  bio TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Foreign Keys**: 
- `user_id` → `user(id)` CASCADE DELETE
**Indexes**: 
- Primary key on id
- Index on user_id (one-to-one relationship)
- Index on utr_rating, ntrp_rating for sorting

#### `player_education` table 🟡 PLANNED
```sql
CREATE TABLE player_education (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID REFERENCES players(id) NOT NULL,
  education_type TEXT CHECK (education_type IN ('stationary', 'remote', 'hybrid')),
  grade_level TEXT,
  curriculum TEXT CHECK (curriculum IN ('national', 'international')),
  school_name TEXT,
  country TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Foreign Keys**:
- `player_id` → `players(id)` CASCADE DELETE
**Indexes**:
- Primary key on id
- Index on player_id

### Phase 1C: Parent-Child Relations

#### `parent_child_relations` table 🟡 PLANNED
```sql
CREATE TABLE parent_child_relations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID REFERENCES "user"(id) NOT NULL,
  child_id UUID REFERENCES "user"(id) NOT NULL,
  relationship_type TEXT CHECK (relationship_type IN ('mother', 'father', 'guardian')),
  has_full_access BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(parent_id, child_id) -- Prevent duplicate relations
);
```

**Business Rules**:
- Multiple parents can be linked to one child
- Child must have user_type = 'player'
- Parent must have user_type = 'parent'

### Phase 1D: Team Structure (Player-Centric)

#### `player_teams` table 🟡 PLANNED
```sql
CREATE TABLE player_teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID REFERENCES players(id) NOT NULL,
  team_name TEXT NOT NULL,
  description TEXT,
  invite_code TEXT UNIQUE NOT NULL, -- 12-char ULID (o3 recommendation)
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Business Rules**:
- One team per player (but player owns the team)
- Invite codes are ULIDs for global uniqueness
- Team can be deactivated but not deleted (audit trail)

#### `team_coaches` table 🟡 PLANNED
```sql
CREATE TABLE team_coaches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES player_teams(id) NOT NULL,
  coach_id UUID REFERENCES "user"(id) NOT NULL,
  coach_type TEXT CHECK (coach_type IN ('head_coach', 'performance_coach', 'sparring_partner')),
  permissions TEXT CHECK (permissions IN ('view', 'edit', 'full')) DEFAULT 'view',
  invited_at TIMESTAMP DEFAULT NOW(),
  joined_at TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  UNIQUE(team_id, coach_id) -- Prevent duplicate coach assignments
);
```

**Business Rules**:
- Multiple coaches per team (3 types supported)
- Coach must have user_type = 'coach'
- Invitation workflow: invited_at → joined_at
- Coaches can be temporarily deactivated

## Migration Plan

### Phase 1B: Players Table (Next)
1. **Migration 0003**: Create basic players table
2. **Migration 0004**: Add education table
3. **Test**: Create player profile for Sonia
4. **Verify**: CI/CD pipeline catches any issues

### Phase 1C: Relations (Week 2)
1. **Migration 0005**: Parent-child relations
2. **Migration 0006**: Team structure
3. **Test**: Multi-parent access, team creation

### Data Migration Strategy
1. **Existing users**: Keep current role field during transition
2. **New user_type**: Populate based on role field
3. **Gradual migration**: Move logic to use user_type over time
4. **Legacy cleanup**: Remove role field in Phase 2

## Indexes and Performance

### Critical Indexes
```sql
-- Player lookups
CREATE INDEX idx_players_user_id ON players(user_id);
CREATE INDEX idx_players_rating ON players(utr_rating, ntrp_rating);

-- Team relationships  
CREATE INDEX idx_team_coaches_team_id ON team_coaches(team_id);
CREATE INDEX idx_team_coaches_coach_id ON team_coaches(coach_id);
CREATE INDEX idx_parent_child_child_id ON parent_child_relations(child_id);

-- Invite codes
CREATE UNIQUE INDEX idx_player_teams_invite_code ON player_teams(invite_code);
```

### Query Patterns
- **Find player by user**: `user_id` lookup
- **Find team coaches**: `team_id` join
- **Find child's parents**: `child_id` lookup
- **Find available invite**: `invite_code` unique lookup

## Constraints and Validation

### Business Rule Constraints
```sql
-- Ensure coach types are valid
ALTER TABLE team_coaches ADD CONSTRAINT valid_coach_type 
  CHECK (coach_type IN ('head_coach', 'performance_coach', 'sparring_partner'));

-- Ensure ratings are in valid ranges
ALTER TABLE players ADD CONSTRAINT valid_utr_rating 
  CHECK (utr_rating >= 0.00 AND utr_rating <= 16.50);

ALTER TABLE players ADD CONSTRAINT valid_ntrp_rating 
  CHECK (ntrp_rating >= 1.0 AND ntrp_rating <= 7.0);

-- Ensure education types are valid
ALTER TABLE player_education ADD CONSTRAINT valid_education_type
  CHECK (education_type IN ('stationary', 'remote', 'hybrid'));
```

### Referential Integrity
- All foreign keys use CASCADE DELETE except where audit trail needed
- User deletion cascades to players, relations, and team memberships
- Team deletion cascades to coach assignments

## Backup and Recovery

### Current Backup Strategy
- Railway automatic backups (daily)
- Manual backup before each migration
- Export via debug endpoint JSON

### Recovery Procedures
1. **Migration failure**: Use prepared rollback scripts
2. **Data corruption**: Restore from Railway backup
3. **Schema issues**: Use debug endpoint to assess damage

This schema supports the player-centric model while maintaining flexibility for future tennis-specific features.