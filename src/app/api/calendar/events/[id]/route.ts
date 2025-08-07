import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { calendarEvents } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { cookies } from "next/headers";
import { canModifyEvent } from "@/lib/permissions";

export async function PUT(
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

    // Check role-based modification permission
    const modifyPermission = await canModifyEvent(userId, eventId, 'edit');
    if (!modifyPermission.allowed) {
      return NextResponse.json(
        { error: modifyPermission.reason || "Not authorized to edit this event" },
        { status: 403 }
      );
    }

    const [existingEvent] = await db
      .select()
      .from(calendarEvents)
      .where(
        and(
          eq(calendarEvents.id, eventId),
          eq(calendarEvents.team_id, parseInt(teamId))
        )
      );

    if (!existingEvent) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { title, description, activity_type, start_time, end_time, location } = body;

    if (activity_type) {
      const validActivityTypes = ['practice', 'gym', 'match', 'tournament', 'education'];
      if (!validActivityTypes.includes(activity_type)) {
        return NextResponse.json(
          { error: "Invalid activity type" },
          { status: 400 }
        );
      }
    }

    const [updatedEvent] = await db
      .update(calendarEvents)
      .set({
        title: title || existingEvent.title,
        description: description !== undefined ? description : existingEvent.description,
        activity_type: activity_type || existingEvent.activity_type,
        start_time: start_time ? new Date(start_time) : existingEvent.start_time,
        end_time: end_time ? new Date(end_time) : existingEvent.end_time,
        location: location !== undefined ? location : existingEvent.location,
        updated_at: new Date(),
      })
      .where(eq(calendarEvents.id, eventId))
      .returning();

    return NextResponse.json({ event: updatedEvent });
  } catch (error) {
    console.error("Error updating calendar event:", error);
    return NextResponse.json(
      { error: "Failed to update event" },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    // Check role-based modification permission
    const modifyPermission = await canModifyEvent(userId, eventId, 'delete');
    if (!modifyPermission.allowed) {
      return NextResponse.json(
        { error: modifyPermission.reason || "Not authorized to delete this event" },
        { status: 403 }
      );
    }

    const [existingEvent] = await db
      .select()
      .from(calendarEvents)
      .where(
        and(
          eq(calendarEvents.id, eventId),
          eq(calendarEvents.team_id, parseInt(teamId))
        )
      );

    if (!existingEvent) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }

    await db.delete(calendarEvents).where(eq(calendarEvents.id, eventId));

    return NextResponse.json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error("Error deleting calendar event:", error);
    return NextResponse.json(
      { error: "Failed to delete event" },
      { status: 500 }
    );
  }
}