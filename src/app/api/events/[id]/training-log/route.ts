import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/db";
import { trainingSessions, calendarEvents, eventParticipants } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { normType } from '@/lib/domain';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const eventId = parseInt(id);
    const body = await request.json();
    const { player_id, attendance_status, performance_rating, notes } = body;

    // Validate required fields
    if (!player_id || !attendance_status) {
      return NextResponse.json(
        { error: "Missing required fields: player_id, attendance_status" },
        { status: 400 }
      );
    }

    // Explicit mapping: attended→present, missed→absent, late→late
    const map: Record<string,'present'|'absent'|'late'> = {
      attended: 'present',
      missed: 'absent',
      late: 'late',
    };
    const status = map[(attendance_status ?? '').toLowerCase()];
    if (!status) {
      return NextResponse.json({ error: 'invalid_status' }, { status: 400 });
    }
    
    const mappedStatus = status;

    // Validate performance_rating if provided
    if (performance_rating !== undefined && (performance_rating < 1 || performance_rating > 10)) {
      return NextResponse.json(
        { error: "Performance rating must be between 1 and 10" },
        { status: 400 }
      );
    }

    // Verify event exists and is training-type
    const [event] = await db
      .select()
      .from(calendarEvents)
      .where(
        and(
          eq(calendarEvents.id, eventId),
          eq(calendarEvents.team_id, parseInt(teamId))
        )
      );

    if (!event) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }

    // Verify event is training-related (use normalized type)
    const normalizedType = normType(event.activity_type);
    const trainingTypes = ['practice', 'gym', 'education'];
    if (!trainingTypes.includes(normalizedType)) {
      return NextResponse.json(
        { error: "Training logs can only be added to practice, gym, or education events" },
        { status: 400 }
      );
    }

    // Verify player is participant in the event
    const [participant] = await db
      .select()
      .from(eventParticipants)
      .where(
        and(
          eq(eventParticipants.event_id, eventId),
          eq(eventParticipants.user_id, parseInt(player_id)),
          eq(eventParticipants.role, 'player')
        )
      );

    if (!participant) {
      return NextResponse.json(
        { error: "Player is not registered as a participant in this event" },
        { status: 400 }
      );
    }

    // Upsert training session
    const existingSession = await db
      .select()
      .from(trainingSessions)
      .where(
        and(
          eq(trainingSessions.event_id, eventId),
          eq(trainingSessions.player_id, parseInt(player_id))
        )
      );

    let result;
    if (existingSession.length > 0) {
      // Update existing session
      [result] = await db
        .update(trainingSessions)
        .set({
          attendance_status: mappedStatus,
          performance_rating: performance_rating || null,
          notes: notes || null,
          logged_by: parseInt(userId),
          updated_at: new Date(),
        })
        .where(eq(trainingSessions.id, existingSession[0].id))
        .returning();
    } else {
      // Create new session
      [result] = await db
        .insert(trainingSessions)
        .values({
          event_id: eventId,
          player_id: parseInt(player_id),
          attendance_status: mappedStatus,
          performance_rating: performance_rating || null,
          notes: notes || null,
          logged_by: parseInt(userId),
        })
        .returning();
    }

    return NextResponse.json({ 
      success: true,
      training_session: result,
      message: "Training log saved successfully"
    });

  } catch (error) {
    console.error("Error saving training log:", error);
    return NextResponse.json(
      { error: "Failed to save training log" },
      { status: 500 }
    );
  }
}