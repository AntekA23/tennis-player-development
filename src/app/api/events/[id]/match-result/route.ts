import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/db";
import { matchResults, calendarEvents, eventParticipants } from "@/db/schema";
import { eq, and } from "drizzle-orm";

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
    const { winner_id, score_text, notes } = body;

    // Validate required fields
    if (!score_text) {
      return NextResponse.json(
        { error: "Missing required field: score_text" },
        { status: 400 }
      );
    }

    // Validate tennis score format (e.g., "6-4 6-2" or "6-4 3-6 6-3")
    const tennisScoreRegex = /^\d{1,2}-\d{1,2}( \d{1,2}-\d{1,2})*$/;
    if (!tennisScoreRegex.test(score_text.trim())) {
      return NextResponse.json(
        { error: "Invalid score format. Use format like '6-4 6-2' or '6-4 3-6 6-3'" },
        { status: 400 }
      );
    }

    // Verify event exists and is match-type
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

    // Verify event is match-related
    const matchTypes = ['match', 'sparring_request'];
    if (!matchTypes.includes(event.activity_type)) {
      return NextResponse.json(
        { error: "Match results can only be added to match or sparring events" },
        { status: 400 }
      );
    }

    // Get all player participants for this event
    const players = await db
      .select()
      .from(eventParticipants)
      .where(
        and(
          eq(eventParticipants.event_id, eventId),
          eq(eventParticipants.role, 'player')
        )
      );

    // Verify exactly 2 player participants
    if (players.length !== 2) {
      return NextResponse.json(
        { error: `Match requires exactly 2 player participants. Found ${players.length}` },
        { status: 400 }
      );
    }

    const player1_id = players[0].user_id;
    const player2_id = players[1].user_id;

    // Validate winner_id if provided
    if (winner_id !== undefined && winner_id !== null) {
      const winnerIdNum = parseInt(winner_id);
      if (winnerIdNum !== player1_id && winnerIdNum !== player2_id) {
        return NextResponse.json(
          { error: "Winner must be one of the match participants" },
          { status: 400 }
        );
      }
    }

    // Check if result already exists for this event
    const existingResult = await db
      .select()
      .from(matchResults)
      .where(eq(matchResults.event_id, eventId));

    if (existingResult.length > 0) {
      return NextResponse.json(
        { error: "Match result already exists for this event" },
        { status: 400 }
      );
    }

    // Create match result
    const [result] = await db
      .insert(matchResults)
      .values({
        event_id: eventId,
        player1_id,
        player2_id,
        winner_id: winner_id ? parseInt(winner_id) : null,
        score_text: score_text.trim(),
        notes: notes || null,
        logged_by: parseInt(userId),
      })
      .returning();

    return NextResponse.json({ 
      success: true,
      match_result: result,
      message: "Match result saved successfully"
    });

  } catch (error) {
    console.error("Error saving match result:", error);
    return NextResponse.json(
      { error: "Failed to save match result" },
      { status: 500 }
    );
  }
}