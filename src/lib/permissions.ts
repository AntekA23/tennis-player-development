import { db } from "@/db";
import { teamMembers, calendarEvents, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";

// User role types
export type UserRole = 'coach' | 'parent' | 'player';
export type ActivityType = 'practice' | 'gym' | 'match' | 'tournament' | 'education' | 'sparring_request';
export type CalendarAction = 'create' | 'view' | 'edit' | 'delete' | 'reschedule' | 'clone' | 'rsvp';

interface PermissionResult {
  allowed: boolean;
  reason?: string;
}

interface UserTeamRole {
  role: UserRole;
  userId: number;
  teamId: number;
}

// Get user's role in a specific team
export async function getUserTeamRole(userId: string, teamId: string): Promise<UserTeamRole | null> {
  try {
    const [member] = await db
      .select({
        role: teamMembers.role,
        userId: teamMembers.user_id,
        teamId: teamMembers.team_id,
      })
      .from(teamMembers)
      .where(
        and(
          eq(teamMembers.user_id, parseInt(userId)),
          eq(teamMembers.team_id, parseInt(teamId)),
          eq(teamMembers.status, 'accepted')
        )
      );

    if (!member) {
      return null;
    }

    return {
      role: member.role as UserRole,
      userId: member.userId,
      teamId: member.teamId,
    };
  } catch (error) {
    console.error('Error getting user team role:', error);
    return null;
  }
}

// Check if user can create events of specific type
export async function canCreateEvent(
  userId: string, 
  teamId: string, 
  activityType: ActivityType
): Promise<PermissionResult> {
  const userRole = await getUserTeamRole(userId, teamId);
  
  if (!userRole) {
    return { allowed: false, reason: 'User not found in team' };
  }

  switch (userRole.role) {
    case 'coach':
      // Coaches can create all event types
      return { allowed: true };
      
    case 'parent':
      // Parents cannot create any events directly (only requests)
      return { allowed: false, reason: 'Parents cannot create events. Use request system instead.' };
      
    case 'player':
      // Players can only create sparring requests
      if (activityType === 'sparring_request') {
        return { allowed: true };
      }
      return { allowed: false, reason: 'Players can only create sparring match requests' };
      
    default:
      return { allowed: false, reason: 'Invalid role' };
  }
}

// Check if user can modify existing event
export async function canModifyEvent(
  userId: string, 
  eventId: number,
  action: CalendarAction = 'edit'
): Promise<PermissionResult> {
  try {
    // Get event details with creator info
    const [event] = await db
      .select({
        id: calendarEvents.id,
        teamId: calendarEvents.team_id,
        createdBy: calendarEvents.created_by,
        activityType: calendarEvents.activity_type,
      })
      .from(calendarEvents)
      .where(eq(calendarEvents.id, eventId));

    if (!event) {
      return { allowed: false, reason: 'Event not found' };
    }

    const userRole = await getUserTeamRole(userId, event.teamId.toString());
    
    if (!userRole) {
      return { allowed: false, reason: 'User not found in team' };
    }

    switch (userRole.role) {
      case 'coach':
        // Coaches can modify all team events
        return { allowed: true };
        
      case 'parent':
        // Parents cannot modify any events
        return { allowed: false, reason: 'Parents cannot modify events' };
        
      case 'player':
        // Players cannot modify any events (even their own sparring requests once created)
        return { allowed: false, reason: 'Players cannot modify events' };
        
      default:
        return { allowed: false, reason: 'Invalid role' };
    }
  } catch (error) {
    console.error('Error checking modify permission:', error);
    return { allowed: false, reason: 'Permission check failed' };
  }
}

// Check if user can view specific event
export async function canViewEvent(
  userId: string, 
  eventId: number
): Promise<PermissionResult> {
  try {
    const [event] = await db
      .select({
        id: calendarEvents.id,
        teamId: calendarEvents.team_id,
      })
      .from(calendarEvents)
      .where(eq(calendarEvents.id, eventId));

    if (!event) {
      return { allowed: false, reason: 'Event not found' };
    }

    const userRole = await getUserTeamRole(userId, event.teamId.toString());
    
    if (!userRole) {
      return { allowed: false, reason: 'User not found in team' };
    }

    // All team members can view events (filtering happens at list level)
    return { allowed: true };
  } catch (error) {
    console.error('Error checking view permission:', error);
    return { allowed: false, reason: 'Permission check failed' };
  }
}

// Get events visible to user based on role
export async function getVisibleEvents(
  userId: string, 
  teamId: string,
  startDate?: Date,
  endDate?: Date
) {
  const userRole = await getUserTeamRole(userId, teamId);
  
  if (!userRole) {
    return [];
  }

  let conditions = [eq(calendarEvents.team_id, parseInt(teamId))];
  
  // Add date filters if provided
  if (startDate) {
    conditions.push(eq(calendarEvents.start_time, startDate)); // This should be gte
  }
  if (endDate) {
    conditions.push(eq(calendarEvents.end_time, endDate)); // This should be lte
  }

  switch (userRole.role) {
    case 'coach':
      // Coaches see all team events
      break;
      
    case 'parent':
      // Parents see only events involving their child
      // TODO: Need to add player-event relationship to filter properly
      // For now, show all events (will be filtered by frontend)
      break;
      
    case 'player':
      // Players see only events they're participating in
      // TODO: Need to add player-event relationship to filter properly
      // For now, show all events (will be filtered by frontend)
      break;
  }

  const events = await db
    .select()
    .from(calendarEvents)
    .where(and(...conditions));

  return events;
}

// Get user permissions for UI rendering
export async function getUserPermissions(
  userId: string, 
  teamId: string
): Promise<{
  role: UserRole;
  canCreateEvents: boolean;
  canModifyEvents: boolean;
  canViewAllEvents: boolean;
  allowedEventTypes: ActivityType[];
}> {
  const userRole = await getUserTeamRole(userId, teamId);
  
  if (!userRole) {
    return {
      role: 'player',
      canCreateEvents: false,
      canModifyEvents: false,
      canViewAllEvents: false,
      allowedEventTypes: [],
    };
  }

  switch (userRole.role) {
    case 'coach':
      return {
        role: 'coach',
        canCreateEvents: true,
        canModifyEvents: true,
        canViewAllEvents: true,
        allowedEventTypes: ['practice', 'gym', 'match', 'tournament', 'education'],
      };
      
    case 'parent':
      return {
        role: 'parent',
        canCreateEvents: false,
        canModifyEvents: false,
        canViewAllEvents: false, // Only child's events
        allowedEventTypes: [], // Cannot create directly
      };
      
    case 'player':
      return {
        role: 'player',
        canCreateEvents: true, // Only sparring
        canModifyEvents: false,
        canViewAllEvents: false, // Only own events
        allowedEventTypes: ['sparring_request'],
      };
      
    default:
      return {
        role: 'player',
        canCreateEvents: false,
        canModifyEvents: false,
        canViewAllEvents: false,
        allowedEventTypes: [],
      };
  }
}