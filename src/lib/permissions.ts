import { db } from "@/db";
import { teamMembers, calendarEvents, users, parentChild, eventParticipants } from "@/db/schema";
import { eq, and, gte, lte, or, inArray } from "drizzle-orm";

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
    // First try to find member with any status to debug
    const [memberAny] = await db
      .select({
        role: teamMembers.role,
        userId: teamMembers.user_id,
        teamId: teamMembers.team_id,
        status: teamMembers.status,
      })
      .from(teamMembers)
      .where(
        and(
          eq(teamMembers.user_id, parseInt(userId)),
          eq(teamMembers.team_id, parseInt(teamId))
        )
      );

    console.log('[Permissions] Found team member:', { userId, teamId, memberAny });

    if (!memberAny) {
      console.log('[Permissions] No team member found for user:', userId, 'team:', teamId);
      return null;
    }

    // For now, accept both 'accepted' and 'pending' status to fix the issue
    // In production, you might want to only allow 'accepted'
    if (memberAny.status !== 'accepted' && memberAny.status !== 'pending') {
      console.log('[Permissions] Team member has invalid status:', memberAny.status);
      return null;
    }

    // Map team member roles to user roles
    // In team_members table: 'creator' and 'member' 
    // Need to get actual role from users table
    const [user] = await db
      .select({ role: users.role })
      .from(users)
      .where(eq(users.id, parseInt(userId)));

    if (!user) {
      console.log('[Permissions] User not found in users table');
      return null;
    }

    console.log('[Permissions] User role from users table:', user.role);

    return {
      role: user.role as UserRole,
      userId: memberAny.userId,
      teamId: memberAny.teamId,
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
  console.log('[Permissions] Checking create permission:', { userId, teamId, activityType });
  
  const userRole = await getUserTeamRole(userId, teamId);
  
  if (!userRole) {
    console.log('[Permissions] No user role found');
    return { allowed: false, reason: 'User not found in team' };
  }

  console.log('[Permissions] User role found:', userRole);

  switch (userRole.role) {
    case 'coach':
      // Coaches can create all event types
      console.log('[Permissions] Coach can create all events');
      return { allowed: true };
      
    case 'parent':
      // Parents can create tournaments for their children
      if (activityType === 'tournament') {
        return { allowed: true };
      }
      return { allowed: false, reason: 'Parents can only create tournaments. Use request system for other events.' };
      
    case 'player':
      // Players can only create sparring requests
      if (activityType === 'sparring_request') {
        return { allowed: true };
      }
      return { allowed: false, reason: 'Players can only create sparring match requests' };
      
    default:
      console.log('[Permissions] Invalid role:', userRole.role);
      return { allowed: false, reason: `Invalid role: ${userRole.role}` };
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

  let conditions: any[] = [eq(calendarEvents.team_id, parseInt(teamId))];
  
  // Add date filters if provided
  if (startDate) {
    conditions.push(gte(calendarEvents.start_time, startDate));
  }
  if (endDate) {
    conditions.push(lte(calendarEvents.end_time, endDate));
  }

  // Get all team events first
  const allEvents = await db
    .select()
    .from(calendarEvents)
    .where(and(...conditions));

  // Now filter based on role
  switch (userRole.role) {
    case 'coach':
      // Coaches see ALL team events
      return allEvents;
      
    case 'parent':
      // Parents see events involving their children OR events they created
      const children = await db
        .select({ childId: parentChild.child_id })
        .from(parentChild)
        .where(eq(parentChild.parent_id, parseInt(userId)));
      
      const childIds = children.map(c => c.childId);
      
      // Get events where children are participants
      const childEventIds = new Set<number>();
      if (childIds.length > 0) {
        const participatingEvents = await db
          .select({ eventId: eventParticipants.event_id })
          .from(eventParticipants)
          .where(inArray(eventParticipants.user_id, childIds));
        
        participatingEvents.forEach(p => childEventIds.add(p.eventId));
      }
      
      // Filter: events with children OR events parent created
      return allEvents.filter(event => 
        childEventIds.has(event.id) || 
        event.created_by === parseInt(userId)
      );
      
    case 'player':
      // Players see events they're participating in OR events they created
      const playerEventIds = new Set<number>();
      const playerEvents = await db
        .select({ eventId: eventParticipants.event_id })
        .from(eventParticipants)
        .where(eq(eventParticipants.user_id, parseInt(userId)));
      
      playerEvents.forEach(p => playerEventIds.add(p.eventId));
      
      // Filter: events participating in OR events player created
      return allEvents.filter(event => 
        playerEventIds.has(event.id) || 
        event.created_by === parseInt(userId)
      );
  }

  return [];
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
        canCreateEvents: true, // Can create tournaments
        canModifyEvents: false,
        canViewAllEvents: false, // Only child's events
        allowedEventTypes: ['tournament'], // Can create tournaments
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