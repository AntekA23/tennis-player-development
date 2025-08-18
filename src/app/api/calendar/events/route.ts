import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { calendarEvents, eventParticipants, teamMembers } from "@/db/schema";
import { eq, and, gte, lte, asc, inArray } from "drizzle-orm";
import { cookies } from "next/headers";
import { canCreateEvent, type ActivityType } from "@/lib/permissions";
import { normType, PARTICIPANT_RULES, type Activity, type Role } from '@/lib/domain';

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

    const incoming = await request.json();
    let { title, description, activity_type, start_time, end_time, location, is_recurring, recurrence_pattern, participants, participantUserIds, tournamentScope, endTouched } = incoming;

    if (!title || !activity_type || !start_time) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Normalize type
    const type = normType(activity_type) as Activity;
    // Map sparring back to sparring_request for database storage
    const dbActivityType = type === 'sparring' ? 'sparring_request' : type;

    // Check role-based creation permission
    const createPermission = await canCreateEvent(userId, teamId, dbActivityType as ActivityType);
    console.log('[API] Create event permission check:', { userId, teamId, activity_type: dbActivityType, createPermission });
    if (!createPermission.allowed) {
      return NextResponse.json(
        { error: createPermission.reason || "Not authorized to create this event type" },
        { status: 403 }
      );
    }


    // End authority
    let endAt = end_time;
    const endTouchedFlag = endTouched === true;
    
    if (!endTouchedFlag) {
      if (type === 'education') {
        endAt = new Date(new Date(start_time).getTime() + 60*60*1000).toISOString();
      } else if (type === 'tournament') {
        const scope = (tournamentScope as string)?.toLowerCase();
        if (!['national','international_te'].includes(scope ?? '')) {
          return NextResponse.json({ error:'missing_tournament_scope' }, { status:400 });
        }
        const days = scope === 'national' ? 2 : 3;
        endAt = new Date(new Date(start_time).getTime() + days*24*60*60*1000).toISOString();
      }
    }
    // For other types, do not error if endAt is missing when !endTouched; persist as-is if DB allows.

    // Enforce participant roles using team_members.role only
    const participantIds: number[] = (participants ?? []).map((p:any) => p.user_id)
      .concat(participantUserIds ?? []);
    
    const uniqueIds = Array.from(new Set(participantIds));
    
    if (uniqueIds.length > 0) {
      // Fetch team member roles for those ids (server authority)
      const members = await db
        .select({ user_id: teamMembers.user_id, role: teamMembers.role })
        .from(teamMembers)
        .where(and(
          eq(teamMembers.team_id, parseInt(teamId)),
          inArray(teamMembers.user_id, uniqueIds)
        ));
      
      // Check if all participants are in the team
      if (members.length !== uniqueIds.length) {
        return NextResponse.json({ error: 'participant_not_in_team' }, { status: 400 });
      }
      
      const allowed = new Set(PARTICIPANT_RULES[type]);
      const invalid = members.filter(m => !allowed.has(m.role as Role));
      
      if (invalid.length > 0) {
        return NextResponse.json({ error: 'invalid_participants' }, { status: 400 });
      }
    }

    // Tournament player guarantee: ensure at least one player participant
    if (type === 'tournament') {
      // Count players in provided participants
      const currentPlayerCount = uniqueIds.length > 0 ? 
        (await db.select({ user_id: teamMembers.user_id, role: teamMembers.role })
          .from(teamMembers)
          .where(and(
            eq(teamMembers.team_id, parseInt(teamId)),
            inArray(teamMembers.user_id, uniqueIds)
          ))).filter(m => m.role === 'player').length : 0;

      if (currentPlayerCount === 0) {
        // No players in participants - check if we can auto-add
        const teamPlayers = await db.select({ user_id: teamMembers.user_id })
          .from(teamMembers)
          .where(and(
            eq(teamMembers.team_id, parseInt(teamId)),
            eq(teamMembers.role, 'player'),
            eq(teamMembers.status, 'accepted')
          ));

        if (teamPlayers.length === 1) {
          // Auto-add the single player
          uniqueIds.push(teamPlayers[0].user_id);
        } else if (teamPlayers.length > 1) {
          // Multiple players - require manual selection
          return NextResponse.json({
            error: "select_player_required",
            message: "Tournament requires at least one player participant"
          }, { status: 400 });
        }
        // If teamPlayers.length === 0, continue (no players on team)
      }
    }

    // Log the data being inserted
    console.log('[API] Creating event with data:', {
      team_id: parseInt(teamId),
      created_by: parseInt(userId),
      title,
      activity_type: dbActivityType,
      start_time,
      end_time: endAt,
      start_date: new Date(start_time),
      end_date: new Date(endAt)
    });

    const [newEvent] = await db.insert(calendarEvents).values({
      team_id: parseInt(teamId),
      created_by: parseInt(userId),
      title,
      description: description || null,
      activity_type: dbActivityType,
      start_time: new Date(start_time),
      end_time: new Date(endAt),
      location: location || null,
      is_recurring: is_recurring || false,
      recurrence_pattern: recurrence_pattern || null,
      original_event_id: null, // Will be set when cloning
    }).returning();

    // Add participants if provided
    if (uniqueIds && uniqueIds.length > 0) {
      const memberRoles = await db
        .select({ user_id: teamMembers.user_id, role: teamMembers.role })
        .from(teamMembers)
        .where(and(
          eq(teamMembers.team_id, parseInt(teamId)),
          inArray(teamMembers.user_id, uniqueIds)
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