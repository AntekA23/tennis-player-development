# ADR-001: Player-Centric Architecture

## Status
Accepted

## Context
Traditional sports management systems are typically coach-centric, where coaches create teams and manage players. However, a player's career spans multiple coaches, teams, and training environments throughout their development.

## Decision
We will implement a player-centric architecture where:
- Players own their career data
- Players create their own "team" and invite coaches
- All data is organized around the player entity

## Consequences

### Positive
- **Data Continuity**: Player data persists across coach changes
- **Player Empowerment**: Players control their own development journey
- **Parent Visibility**: Parents can track progress regardless of coaching changes
- **Career Portfolio**: Players build a comprehensive career record

### Negative
- **Different Mental Model**: Coaches may expect to "own" teams
- **Initial Setup**: Players must take initiative to create teams
- **Complexity**: More complex permissions model

## Implementation
- `player_teams` table with `player_id` as owner
- Coaches join teams via invitation codes
- Players can have multiple coaches with different roles