import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/db";
import { calendarEvents } from "@/db/schema";
import { eq, and } from "drizzle-orm";

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
    const { title, description, location, start_time, end_time } = body;

    // Validate times if provided
    if (start_time && end_time) {
      const start = new Date(start_time);
      const end = new Date(end_time);
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
    if (end_time) updates.end_time = new Date(end_time);

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