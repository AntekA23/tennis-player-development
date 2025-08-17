import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { calendarEvents, eventParticipants, teamMembers } from "@/db/schema";
import { eq, and, gte, lte, asc, inArray } from "drizzle-orm";
import { cookies } from "next/headers";
import { canCreateEvent, type ActivityType } from "@/lib/permissions";

// Type normalizer: collapse synonyms/typos
const normType = (s: string) => s.trim().toLowerCase()
  .replace('sparing', 'sparring')
  .replace('sparring request', 'sparring');

// Role normalizer: defensive mapping for any legacy values
const normRole = (role: string) => {
  switch (role) {
    case 'member': return 'player';
    case 'creator': return 'coach';
    default: return role;
  }
};

// Helper: validate participant roles for event type
const validateParticipantRoles = (eventType: string, roles: string[]): boolean => {
  const t = eventType.toLowerCase();
  return (
    (t === 'education' && roles.every(r => r === 'parent' || r === 'player')) ||
    ((t === 'practice' || t === 'gym') && roles.every(r => r === 'player' || r === 'coach')) ||
    ((t === 'match' || t === 'sparring_request') && roles.every(r => r === 'player')) ||
    (t === 'tournament' && roles.every(r => r === 'parent' || r === 'player' || r === 'coach'))
  );
};

export async function GET(request: NextRequest) {
  try {
    const ck = await cookies();
    const teamId = Number(ck.get("teamId")?.value);
    
    // If no teamId, return empty events with debug info
    if (!teamId) {
      return NextResponse.json({ 
        events: [], 
        meta: { teamId: null, count: 0, debug: "No teamId in cookies" }
      });
    }

    // Simple date range: last 30 days to next 60 days
    const start = new Date(); 
    start.setDate(start.getDate() - 30);
    const end = new Date(); 
    end.setDate(end.getDate() + 60);

    console.log(`[Events API] Fetching for teamId=${teamId}, range=${start.toISOString()} to ${end.toISOString()}`);

    // Get ALL events for this team in date range (no role filtering)
    const events = await db.select().from(calendarEvents)
      .where(and(
        eq(calendarEvents.team_id, teamId),
        gte(calendarEvents.start_time, start),
        lte(calendarEvents.start_time, end)
      ))
      .orderBy(asc(calendarEvents.start_time));

    console.log(`[Events API] Found ${events.length} events`);

    return NextResponse.json({ 
      events, 
      meta: { teamId, count: events.length, dateRange: { start, end } }
    });
  } catch (error) {
    console.error("Error fetching calendar events:", error);
    return NextResponse.json(
      { error: "Failed to fetch events", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;
    const teamId = cookieStore.get("teamId")?.value;

    if (!userId || !teamId) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const body = await request.json();
    let { title, description, activity_type, start_time, end_time, location, is_recurring, recurrence_pattern, participants, participantUserIds, tournamentScope, endTouched } = body;

    if (!title || !activity_type || !start_time) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Normalize activity type using normType() function
    const normalized = normType(activity_type);
    const normalizedType = (normalized === 'sparring' ? 'sparring_request' : normalized) as any;

    // Check role-based creation permission
    const createPermission = await canCreateEvent(userId, teamId, activity_type as ActivityType);
    console.log('[API] Create event permission check:', { userId, teamId, activity_type, createPermission });
    if (!createPermission.allowed) {
      return NextResponse.json(
        { error: createPermission.reason || "Not authorized to create this event type" },
        { status: 403 }
      );
    }

    const validActivityTypes = ['practice', 'gym', 'match', 'tournament', 'education', 'sparring_request'];
    if (!validActivityTypes.includes(normalizedType)) {
      return NextResponse.json(
        { error: "Invalid activity type" },
        { status: 400 }
      );
    }

    // Compute end time based on activity type if not manually set
    let computedEndTime = end_time;
    if (!endTouched) {
      if (normalizedType === 'education') {
        // Education: +60 minutes
        const startDate = new Date(start_time);
        const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
        computedEndTime = endDate.toISOString();
      } else if (normalizedType === 'tournament') {
        // Tournament: +2d/+3d based on scope
        if (!tournamentScope) {
          return NextResponse.json(
            { error: "Tournament scope required (National or International-TE)" },
            { status: 400 }
          );
        }
        const startDate = new Date(start_time);
        const days = tournamentScope === 'National' ? 2 : 3;
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + days);
        computedEndTime = endDate.toISOString();
      } else if (!end_time) {
        return NextResponse.json(
          { error: "End time required" },
          { status: 400 }
        );
      }
    }

    // Validate participant roles if provided via participantUserIds
    if (participantUserIds && participantUserIds.length > 0) {
      const memberRoles = await db
        .select({ user_id: teamMembers.user_id, role: teamMembers.role })
        .from(teamMembers)
        .where(and(
          eq(teamMembers.team_id, parseInt(teamId)),
          inArray(teamMembers.user_id, participantUserIds)
        ));

      // Apply defensive role normalization and validate
      const normalizedRoles = memberRoles.map(m => normRole(m.role));
      const isValid = (
        (normalized === 'education' && normalizedRoles.every(r => r === 'parent' || r === 'player')) ||
        (['practice', 'gym'].includes(normalized) && normalizedRoles.every(r => r === 'player' || r === 'coach')) ||
        (['match', 'sparring'].includes(normalized) && normalizedRoles.every(r => r === 'player')) ||
        (normalized === 'tournament' && normalizedRoles.every(r => ['parent', 'player', 'coach'].includes(r)))
      );

      if (!isValid) {
        const invalidRoles = normalizedRoles.filter(r => {
          if (normalized === 'education') return !['parent', 'player'].includes(r);
          if (['practice', 'gym'].includes(normalized)) return !['player', 'coach'].includes(r);
          if (['match', 'sparring'].includes(normalized)) return r !== 'player';
          if (normalized === 'tournament') return !['parent', 'player', 'coach'].includes(r);
          return true;
        });
        return NextResponse.json({ 
          error: "invalid_participants", 
          invalid: invalidRoles 
        }, { status: 400 });
      }
    }

    // Validate participant roles if provided via participants array (legacy)
    if (participants && participants.length > 0) {
      const participantRoles = participants.map((p: any) => p.role);
      const isValid = validateParticipantRoles(normalizedType, participantRoles);
      if (!isValid) {
        return NextResponse.json(
          { error: "Invalid participant roles for this event type" },
          { status: 400 }
        );
      }
    }

    // Tournament player guarantee: ensure at least one player participant
    if (normalizedType === 'tournament') {
      const currentPlayerCount = participantUserIds ? 
        (await db.select({ user_id: teamMembers.user_id, role: teamMembers.role })
          .from(teamMembers)
          .where(and(
            eq(teamMembers.team_id, parseInt(teamId)),
            inArray(teamMembers.user_id, participantUserIds)
          ))).filter(m => normRole(m.role) === 'player').length : 0;

      if (currentPlayerCount === 0) {
        // No players in participants - check if we can auto-add
        const teamPlayers = await db.select({ user_id: teamMembers.user_id, role: teamMembers.role })
          .from(teamMembers)
          .where(and(
            eq(teamMembers.team_id, parseInt(teamId)),
            eq(teamMembers.status, 'accepted')
          ));

        const players = teamPlayers.filter(member => normRole(member.role) === 'player');

        if (players.length === 1) {
          // Auto-add the single player
          participantUserIds = [...(participantUserIds || []), players[0].user_id];
        } else if (players.length > 1) {
          // Multiple players - require manual selection
          return NextResponse.json({
            error: "select_player_required",
            message: "Tournament requires at least one player participant"
          }, { status: 400 });
        }
        // If players.length === 0, continue (no players on team)
      }
    }

    // Log the data being inserted
    console.log('[API] Creating event with data:', {
      team_id: parseInt(teamId),
      created_by: parseInt(userId),
      title,
      activity_type: normalizedType,
      start_time,
      end_time: computedEndTime,
      start_date: new Date(start_time),
      end_date: new Date(computedEndTime)
    });

    const [newEvent] = await db.insert(calendarEvents).values({
      team_id: parseInt(teamId),
      created_by: parseInt(userId),
      title,
      description: description || null,
      activity_type: normalizedType,
      start_time: new Date(start_time),
      end_time: new Date(computedEndTime),
      location: location || null,
      is_recurring: is_recurring || false,
      recurrence_pattern: recurrence_pattern || null,
      original_event_id: null, // Will be set when cloning
    }).returning();

    // Add participants if provided via participantUserIds (preferred method)
    if (participantUserIds && Array.isArray(participantUserIds) && participantUserIds.length > 0) {
      const memberRoles = await db
        .select({ user_id: teamMembers.user_id, role: teamMembers.role })
        .from(teamMembers)
        .where(and(
          eq(teamMembers.team_id, parseInt(teamId)),
          inArray(teamMembers.user_id, participantUserIds)
        ));

      const participantValues = memberRoles.map(m => ({
        event_id: newEvent.id,
        user_id: m.user_id,
        role: m.role === 'coach' ? 'coach' : 'player', // Map team role to participant role
        status: 'confirmed',
        created_at: new Date(),
        updated_at: new Date(),
      }));

      await db.insert(eventParticipants).values(participantValues);
    }
    // Add participants if provided via participants array (legacy method)
    else if (participants && Array.isArray(participants) && participants.length > 0) {
      const participantValues = participants.map((p: any) => ({
        event_id: newEvent.id,
        user_id: p.user_id,
        role: p.role || 'player',
        status: 'confirmed',
        created_at: new Date(),
        updated_at: new Date(),
      }));

      await db.insert(eventParticipants).values(participantValues);
    }

    return NextResponse.json({ event: newEvent }, { status: 201 });
  } catch (error) {
    console.error("Error creating calendar event:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to create event: ${errorMessage}` },
      { status: 500 }
    );
  }
}