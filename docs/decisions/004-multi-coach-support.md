# ADR-004: Multi-Coach Support per Player

## Status
Accepted

## Context
Modern tennis training involves multiple specialized coaches:
- Head coach for overall strategy and technique
- Performance/fitness coach for conditioning
- Sparring partners for practice matches
- Mental coaches, nutritionists (future)

Players typically work with 2-5 coaches simultaneously.

## Decision
Support multiple coaches per player with specific roles:
- Each coach has a defined type/role
- All coaches can view player data (initially)
- Future: role-based permissions
- Player controls coach access

## Consequences

### Positive
- **Reflects Reality**: Matches actual training structures
- **Specialization**: Each coach focuses on their expertise
- **Collaboration**: Coaches can see holistic player development
- **Flexibility**: Easy to add/remove coaches as needed

### Negative
- **Complexity**: More complex than single coach model
- **Potential Conflicts**: Coaches might have different approaches
- **Permission Management**: Future need for granular permissions

## Implementation
- `team_coaches` table with `coach_type` field
- Enum: 'head_coach' | 'performance_coach' | 'sparring_partner'
- Invitation system with role selection
- Dashboard showing all coaches for a player