// Single source of truth for activities and roles
export type Role = 'player' | 'coach' | 'parent';
export type Activity =
  'education' | 'practice' | 'gym' | 'match' | 'sparring' | 'tournament';

export const normType = (s: string): Activity =>
  (s ?? '').trim().toLowerCase()
    .replace('sparing','sparring')
    .replace('sparring request','sparring')
    .replace('sparring_request','sparring') as Activity;

export const PARTICIPANT_RULES: Record<Activity, Role[]> = {
  education:   ['parent','player'],
  practice:    ['player','coach'],
  gym:         ['player','coach'],
  match:       ['player'],
  sparring:    ['player'],
  tournament:  ['parent','player','coach'],
};

// Creator rules are used by UI; added now for completeness (UI uses in PR-UI1)
export const CREATOR_RULES: Record<Role, Activity[]> = {
  parent: ['tournament','education'],
  player: ['practice','gym','sparring'],
  coach:  ['practice','gym','match','sparring','tournament','education'],
};