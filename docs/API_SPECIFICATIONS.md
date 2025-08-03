# API Specifications - tRPC Routes

## Current Status

### Active Routes ✅
Currently minimal due to incremental development approach:
- **Empty router**: All routers temporarily disabled during CI/CD implementation
- **NextAuth endpoints**: `/api/auth/*` (Google OAuth)
- **Debug endpoints**: `/api/debug/*` (password protected)

### Disabled Routes 🟡
Temporarily disabled (files renamed to `.disabled`) until schema is complete:
- `auth.ts.disabled` - User authentication helpers
- `player.ts.disabled` - Player profile management  
- `team.ts.disabled` - Team creation and management
- `training.ts.disabled` - Training session management

## Planned API Structure

### Authentication Router (`auth`)

#### `auth.getCurrentUser`
```typescript
getCurrentUser: protectedProcedure.query(async ({ ctx }) => {
  // Returns current user with role information
  // Used for: Dashboard user info, role-based UI
})
```

**Input**: None (uses session)
**Output**: 
```typescript
{
  id: string;
  name: string;
  email: string;
  user_type: 'player' | 'parent' | 'coach';
  created_at: Date;
}
```

#### `auth.updateUserType` 
```typescript
updateUserType: protectedProcedure
  .input(z.object({ user_type: z.enum(['player', 'parent', 'coach']) }))
  .mutation(async ({ ctx, input }) => {
    // Updates user type in database
    // Used for: Role selection during onboarding
  })
```

### Player Router (`player`)

#### `player.create`
```typescript
create: protectedProcedure
  .input(z.object({
    name: z.string(),
    date_of_birth: z.date(),
    nationality: z.string(),
    dominant_hand: z.enum(['left', 'right']),
    backhand_style: z.enum(['one_handed', 'two_handed']).optional(),
    inspirational_player: z.string().optional(),
  }))
  .mutation(async ({ ctx, input }) => {
    // Creates new player profile
    // Links to current user account
  })
```

**Business Rules**: 
- Only users with `user_type: 'player'` can create profiles
- One profile per user account
- Creates corresponding `players` table entry

#### `player.getProfile`
```typescript
getProfile: protectedProcedure.query(async ({ ctx }) => {
  // Returns current user's player profile
  // Includes education data via join
})
```

**Output**:
```typescript
{
  id: string;
  user_id: string;
  date_of_birth: Date;
  nationality: string;
  dominant_hand: 'left' | 'right';
  backhand_style?: 'one_handed' | 'two_handed';
  utr_rating?: number;
  ntrp_rating?: number;
  inspirational_player?: string;
  bio?: string;
  education: {
    education_type: 'stationary' | 'remote' | 'hybrid';
    grade_level: string;
    curriculum: 'national' | 'international';
    school_name?: string;
    country?: string;
  } | null;
}
```

#### `player.updateProfile`
```typescript
updateProfile: protectedProcedure
  .input(z.object({
    nationality: z.string().optional(),
    dominant_hand: z.enum(['left', 'right']).optional(),
    utr_rating: z.number().min(0).max(16.5).optional(),
    ntrp_rating: z.number().min(1).max(7).optional(),
    inspirational_player: z.string().optional(),
    bio: z.string().optional(),
  }))
  .mutation(async ({ ctx, input }) => {
    // Updates existing player profile
    // Only own profile or parents can update
  })
```

#### `player.updateEducation`
```typescript
updateEducation: protectedProcedure
  .input(z.object({
    education_type: z.enum(['stationary', 'remote', 'hybrid']),
    grade_level: z.string(),
    curriculum: z.enum(['national', 'international']),
    school_name: z.string().optional(),
    country: z.string().optional(),
  }))
  .mutation(async ({ ctx, input }) => {
    // Upserts education information
  })
```

### Team Router (`team`)

#### `team.create`
```typescript
create: protectedProcedure
  .input(z.object({
    team_name: z.string().min(1),
    description: z.string().optional(),
  }))
  .mutation(async ({ ctx, input }) => {
    // Creates team owned by current player
    // Generates unique ULID invite code
    // Only players can create teams
  })
```

**Output**:
```typescript
{
  id: string;
  team_name: string;
  description?: string;
  invite_code: string; // 12-char ULID
  created_at: Date;
}
```

#### `team.inviteCoach`
```typescript
inviteCoach: protectedProcedure
  .input(z.object({
    invite_code: z.string().length(12),
    coach_type: z.enum(['head_coach', 'performance_coach', 'sparring_partner']),
  }))
  .mutation(async ({ ctx, input }) => {
    // Coach uses invite code to join team
    // Validates coach user_type
    // Creates team_coaches relationship
  })
```

#### `team.getMyTeam`
```typescript
getMyTeam: protectedProcedure.query(async ({ ctx }) => {
  // For players: returns their team with coaches
  // For coaches: returns teams they're part of
  // For parents: returns children's teams
})
```

**Output** (for players):
```typescript
{
  id: string;
  team_name: string;
  description?: string;
  invite_code: string;
  coaches: Array<{
    id: string;
    name: string;
    email: string;
    coach_type: 'head_coach' | 'performance_coach' | 'sparring_partner';
    permissions: 'view' | 'edit' | 'full';
    joined_at?: Date;
  }>;
}
```

#### `team.getCoachTeams`
```typescript
getCoachTeams: protectedProcedure.query(async ({ ctx }) => {
  // Returns all teams where user is a coach
  // Includes player information
})
```

### Parent Router (`parent`)

#### `parent.linkChild`
```typescript
linkChild: protectedProcedure
  .input(z.object({
    child_email: z.string().email(),
    relationship_type: z.enum(['mother', 'father', 'guardian']),
  }))
  .mutation(async ({ ctx, input }) => {
    // Creates parent-child relationship
    // Validates child exists and is under 18
    // Sends notification to child (if 13+)
  })
```

#### `parent.getChildren`
```typescript
getChildren: protectedProcedure.query(async ({ ctx }) => {
  // Returns all children linked to current parent
  // Includes player profiles and team information
})
```

#### `parent.switchToChild`
```typescript
switchToChild: protectedProcedure
  .input(z.object({ child_id: z.string() }))
  .mutation(async ({ ctx, input }) => {
    // Updates session to act on behalf of child
    // Validates parent-child relationship
    // Returns child's context
  })
```

## Middleware and Security

### `protectedProcedure`
```typescript
const protectedProcedure = publicProcedure.use(({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return next({
    ctx: {
      ...ctx,
      session: { ...ctx.session, user: ctx.session.user },
    },
  });
});
```

### `playerOnlyProcedure`
```typescript
const playerOnlyProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.session.user.user_type !== 'player') {
    throw new TRPCError({ code: 'FORBIDDEN' });
  }
  return next({ ctx });
});
```

### `coachOnlyProcedure`
```typescript
const coachOnlyProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.session.user.user_type !== 'coach') {
    throw new TRPCError({ code: 'FORBIDDEN' });
  }
  return next({ ctx });
});
```

## Error Handling

### Standard Error Codes
- `UNAUTHORIZED` - Not signed in
- `FORBIDDEN` - Wrong user type for operation
- `NOT_FOUND` - Resource doesn't exist
- `BAD_REQUEST` - Invalid input data
- `CONFLICT` - Resource already exists
- `INTERNAL_SERVER_ERROR` - Unexpected server error

### Error Response Format
```typescript
{
  error: {
    code: 'FORBIDDEN',
    message: 'Only players can create teams',
    data: {
      code: 'FORBIDDEN',
      httpStatus: 403,
      path: 'team.create'
    }
  }
}
```

## Testing Strategy

### Unit Tests (Future)
- Mock database queries
- Test business logic
- Validate input schemas

### Integration Tests (Future)  
- Test full API workflows
- Real database connections
- Multi-step user journeys

### CI/CD Integration
- API routes are type-checked in GitHub Actions
- Schema validation included in build process
- Migration compatibility verified

## Implementation Priority

### Phase 1B (Next)
1. `player.create` - For Sonia's profile
2. `player.getProfile` - Display player info
3. `player.updateEducation` - Education form

### Phase 1C (Week 2)
1. `parent.linkChild` - Parent-child relationships
2. `team.create` - Team creation
3. `team.inviteCoach` - Coach invitation system

### Phase 1D (Week 3)
1. Complex team queries
2. Permission system
3. Advanced coach management

This API design supports the player-centric model while providing type safety and comprehensive error handling.