import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { calendarEvents } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { cookies } from "next/headers";
import { canCreateEvent, type ActivityType } from "@/lib/permissions";

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

    // Find the event to clone
    const [originalEvent] = await db
      .select()
      .from(calendarEvents)
      .where(
        and(
          eq(calendarEvents.id, eventId),
          eq(calendarEvents.team_id, parseInt(teamId))
        )
      );

    if (!originalEvent) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }

    // Check if user has permission to create this type of event (cloning is creating)
    const createPermission = await canCreateEvent(userId, teamId, originalEvent.activity_type as ActivityType);
    if (!createPermission.allowed) {
      return NextResponse.json(
        { error: createPermission.reason || "Not authorized to clone this event type" },
        { status: 403 }
      );
    }

    // Clone the event with new dates (optional: adjust dates from request body)
    const body = await request.json();
    const { start_time, end_time } = body;

    const [clonedEvent] = await db.insert(calendarEvents).values({
      team_id: originalEvent.team_id,
      created_by: parseInt(userId),
      title: originalEvent.title,
      description: originalEvent.description,
      activity_type: originalEvent.activity_type,
      start_time: start_time ? new Date(start_time) : originalEvent.start_time,
      end_time: end_time ? new Date(end_time) : originalEvent.end_time,
      location: originalEvent.location,
      is_recurring: originalEvent.is_recurring,
      recurrence_pattern: originalEvent.recurrence_pattern,
      original_event_id: originalEvent.id,
    }).returning();

    return NextResponse.json({ event: clonedEvent }, { status: 201 });
  } catch (error) {
    console.error("Error cloning calendar event:", error);
    return NextResponse.json(
      { error: "Failed to clone event" },
      { status: 500 }
    );
  }
}