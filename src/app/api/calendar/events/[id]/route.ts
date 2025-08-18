import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/db";
import { calendarEvents, teamMembers, eventParticipants } from "@/db/schema";
import { eq, and, inArray } from "drizzle-orm";
import { normType, PARTICIPANT_RULES, type Activity, type Role } from '@/lib/domain';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const eventId = parseInt(id);
    if (isNaN(eventId)) {
      return NextResponse.json({ error: "Invalid event ID" }, { status: 400 });
    }

    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;
    const teamId = Number(cookieStore.get("teamId")?.value);
    
    if (!userId || !teamId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Check if event exists and user is on same team
    const [existingEvent] = await db
      .select()
      .from(calendarEvents)
      .where(and(
        eq(calendarEvents.id, eventId),
        eq(calendarEvents.team_id, teamId)
      ));

    if (!existingEvent) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const incoming = await req.json();
    const { title, description, location, start_time, end_time, activity_type, type, participants, participantUserIds, tournamentScope, endTouched } = incoming;

    // Normalize type
    const normalizedType = normType(activity_type ?? type ?? existingEvent.activity_type) as Activity;
    
    // Map sparring back to sparring_request for database storage
    const dbActivityType = normalizedType === 'sparring' ? 'sparring_request' : normalizedType;
    
    let computedEndTime = end_time;

    // End authority
    const endTouchedFlag = endTouched === true;
    
    if (!endTouchedFlag) {
      if (normalizedType === 'education' && (start_time || existingEvent.start_time)) {
        const startAt = new Date(start_time || existingEvent.start_time);
        computedEndTime = new Date(startAt.getTime() + 60*60*1000).toISOString();
      }
      if (normalizedType === 'tournament') {
        const scope = (tournamentScope as string)?.toLowerCase();
        if (!scope || !['national', 'international_te'].includes(scope)) {
          return NextResponse.json({ error: 'missing_tournament_scope' }, { status: 400 });
        }
        const startAt = new Date(start_time || existingEvent.start_time);
        const days = scope === 'national' ? 2 : 3;
        computedEndTime = new Date(startAt.getTime() + days*24*60*60*1000).toISOString();
      }
    }

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
          eq(teamMembers.team_id, teamId),
          inArray(teamMembers.user_id, uniqueIds)
        ));
      
      // Check if all participants are in the team
      if (members.length !== uniqueIds.length) {
        return NextResponse.json({ error: 'participant_not_in_team' }, { status: 400 });
      }
      
      const allowed = new Set(PARTICIPANT_RULES[normalizedType]);
      const invalid = members.filter(m => !allowed.has(m.role as Role));
      
      if (invalid.length > 0) {
        return NextResponse.json({ error: 'invalid_participants' }, { status: 400 });
      }
    }

    // Tournament player guarantee: ensure at least one player participant
    if (normalizedType === 'tournament') {
      // Count players in provided participants
      const currentPlayerCount = uniqueIds.length > 0 ?
        (await db.select({ user_id: teamMembers.user_id, role: teamMembers.role })
          .from(teamMembers)
          .where(and(
            eq(teamMembers.team_id, teamId),
            inArray(teamMembers.user_id, uniqueIds)
          ))).filter((m: any) => m.role === 'player').length : 0;

      if (currentPlayerCount === 0) {
        // No players in participants - check if we can auto-add
        const teamPlayers = await db.select({ user_id: teamMembers.user_id })
          .from(teamMembers)
          .where(and(
            eq(teamMembers.team_id, teamId),
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
        // If players.length === 0, continue (no players on team)
      }
    }

    // Validate times if provided
    if (start_time && computedEndTime) {
      const start = new Date(start_time);
      const end = new Date(computedEndTime);
      if (isNaN(+start) || isNaN(+end) || end <= start) {
        return NextResponse.json({ error: "Invalid time range" }, { status: 400 });
      }
    }

    // Build update object with only provided fields (minimal approach)
    const updates: any = { updated_at: new Date() };
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (location !== undefined) updates.location = location;
    if (start_time) updates.start_time = new Date(start_time);
    if (computedEndTime) updates.end_time = new Date(computedEndTime);
    if (dbActivityType !== existingEvent.activity_type) updates.activity_type = dbActivityType;

    const [updatedEvent] = await db
      .update(calendarEvents)
      .set(updates)
      .where(eq(calendarEvents.id, eventId))
      .returning();

    console.log(`[events.edit] id=${eventId} team=${teamId} user=${userId}`);
    return NextResponse.json({ event: updatedEvent });
  } catch (error) {
    console.error("Error updating calendar event:", error);
    return NextResponse.json({ error: "Failed to update event" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const eventId = parseInt(id);
    if (isNaN(eventId)) {
      return NextResponse.json({ error: "Invalid event ID" }, { status: 400 });
    }

    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;
    const teamId = Number(cookieStore.get("teamId")?.value);
    
    if (!userId || !teamId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Check if event exists and user is on same team  
    const [existingEvent] = await db
      .select()
      .from(calendarEvents)
      .where(and(
        eq(calendarEvents.id, eventId),
        eq(calendarEvents.team_id, teamId)
      ));

    if (!existingEvent) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Delete the event
    await db.delete(calendarEvents).where(eq(calendarEvents.id, eventId));

    console.log(`[events.delete] id=${eventId} team=${teamId} user=${userId}`);
    return NextResponse.json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error("Error deleting calendar event:", error);
    return NextResponse.json({ error: "Failed to delete event" }, { status: 500 });
  }
}