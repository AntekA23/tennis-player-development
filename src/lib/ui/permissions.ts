import { Role, Activity, CREATOR_RULES, PARTICIPANT_RULES } from '@/lib/domain';

export type { Role, Activity };

/**
 * UI permissions wrapper - thin layer over server roles
 * Never contradicts server authority; provides UX hints only
 */

export interface UserTeamRole {
  role: Role;
  canCreateEvents: boolean;
}

export function canCreateActivity(userRole: Role, activity: Activity): boolean {
  return CREATOR_RULES[userRole]?.includes(activity) ?? false;
}

export function getAllowedActivities(userRole: Role): Activity[] {
  return CREATOR_RULES[userRole] ?? [];
}

export function canParticipateInActivity(memberRole: Role, activity: Activity): boolean {
  return PARTICIPANT_RULES[activity]?.includes(memberRole) ?? false;
}

export function getEligibleRoles(activity: Activity): Role[] {
  return PARTICIPANT_RULES[activity] ?? [];
}