import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/db";
import { calendarEvents, teamMembers } from "@/db/schema";
import { eq, and, inArray } from "drizzle-orm";

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

    const body = await req.json();
    const { title, description, location, start_time, end_time, type, participantUserIds, tournamentScope, endTouched } = body;

    let computedEndTime = end_time;
    let normalizedType = existingEvent.activity_type;

    // Type normalization and validation
    if (type) {
      const normalized = normType(type);
      const validTypes = ['education', 'practice', 'gym', 'match', 'sparring', 'tournament'];
      if (!validTypes.includes(normalized)) {
        return NextResponse.json({ error: "Invalid activity type" }, { status: 400 });
      }
      // Map sparring back to sparring_request for database
      normalizedType = normalized === 'sparring' ? 'sparring_request' : normalized as any;
    }

    // Server duration authority: compute when !endTouched
    if (endTouched !== true) {
      if (normalizedType === 'education' && start_time) {
        // Education: +60 minutes
        const startDate = new Date(start_time);
        const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
        computedEndTime = endDate.toISOString();
      } else if (normalizedType === 'tournament') {
        // Tournament: +2d/+3d based on scope
        if (!tournamentScope || !['National', 'International-TE'].includes(tournamentScope)) {
          return NextResponse.json({ error: "missing_tournament_scope" }, { status: 400 });
        }
        const startDate = new Date(start_time || existingEvent.start_time);
        const days = tournamentScope === 'National' ? 2 : 3;
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + days);
        computedEndTime = endDate.toISOString();
      }
    }

    // Validate participant roles if provided
    if (participantUserIds && participantUserIds.length > 0) {
      const memberRoles = await db
        .select({ user_id: teamMembers.user_id, role: teamMembers.role })
        .from(teamMembers)
        .where(and(
          eq(teamMembers.team_id, teamId),
          inArray(teamMembers.user_id, participantUserIds)
        ));

      // Apply defensive role normalization and validate
      const normalizedRoles = memberRoles.map(m => normRole(m.role));
      const isValid = (
        (normalizedType === 'education' && normalizedRoles.every(r => r === 'parent' || r === 'player')) ||
        (['practice', 'gym'].includes(normalizedType) && normalizedRoles.every(r => r === 'player' || r === 'coach')) ||
        (['match', 'sparring'].includes(normalizedType) && normalizedRoles.every(r => r === 'player')) ||
        (normalizedType === 'tournament' && normalizedRoles.every(r => ['parent', 'player', 'coach'].includes(r)))
      );

      if (!isValid) {
        const invalidRoles = normalizedRoles.filter(r => {
          if (normalizedType === 'education') return !['parent', 'player'].includes(r);
          if (['practice', 'gym'].includes(normalizedType)) return !['player', 'coach'].includes(r);
          if (['match', 'sparring'].includes(normalizedType)) return r !== 'player';
          if (normalizedType === 'tournament') return !['parent', 'player', 'coach'].includes(r);
          return true;
        });
        return NextResponse.json({ 
          error: "invalid_participants", 
          invalid: invalidRoles 
        }, { status: 400 });
      }
    }

    // Tournament player guarantee: ensure at least one player participant
    let updatedParticipantUserIds = participantUserIds;
    if (normalizedType === 'tournament' && participantUserIds) {
      const currentPlayerRoles = await db
        .select({ user_id: teamMembers.user_id, role: teamMembers.role })
        .from(teamMembers)
        .where(and(
          eq(teamMembers.team_id, teamId),
          inArray(teamMembers.user_id, participantUserIds)
        ));

      const currentPlayerCount = currentPlayerRoles.filter((m: any) => normRole(m.role) === 'player').length;

      if (currentPlayerCount === 0) {
        // No players in participants - check if we can auto-add
        const teamPlayers = await db.select({ user_id: teamMembers.user_id, role: teamMembers.role })
          .from(teamMembers)
          .where(and(
            eq(teamMembers.team_id, teamId),
            eq(teamMembers.status, 'accepted')
          ));

        const players = teamPlayers.filter(member => normRole(member.role) === 'player');

        if (players.length === 1) {
          // Auto-add the single player
          updatedParticipantUserIds = [...participantUserIds, players[0].user_id];
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
    if (normalizedType !== existingEvent.activity_type) updates.activity_type = normalizedType;

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