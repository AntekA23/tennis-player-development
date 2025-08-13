import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/db";
import { calendarEvents } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const eventId = parseInt(id);
    if (isNaN(eventId)) {
      return NextResponse.json({ ok: false, error: "Invalid event ID" }, { status: 400 });
    }

    const body = await req.json();
    const { title, description, location, startISO, endISO } = body;

    // Validate times if both provided
    if (startISO && endISO) {
      const start = new Date(startISO);
      const end = new Date(endISO);
      if (isNaN(+start) || isNaN(+end) || end <= start) {
        return NextResponse.json({ ok: false, error: "Invalid time range" }, { status: 400 });
      }
    }

    const cookieStore = await cookies();
    const teamId = Number(cookieStore.get("teamId")?.value);
    if (!teamId) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    // Build update object with only provided fields
    const updates: any = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (location !== undefined) updates.location = location;
    if (startISO) updates.start_time = new Date(startISO);
    if (endISO) updates.end_time = new Date(endISO);

    // Update only if event belongs to the same team
    const [updatedEvent] = await db
      .update(calendarEvents)
      .set(updates)
      .where(and(
        eq(calendarEvents.id, eventId),
        eq(calendarEvents.team_id, teamId)
      ))
      .returning({ id: calendarEvents.id });

    if (!updatedEvent) {
      return NextResponse.json({ ok: false, error: "Event not found or access denied" }, { status: 404 });
    }

    console.log(`[events.patch] id=${eventId} team=${teamId}`);
    return NextResponse.json({ ok: true, id: updatedEvent.id });
  } catch (error) {
    console.error("[events.patch][error]", error);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
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
      return NextResponse.json({ ok: false, error: "Invalid event ID" }, { status: 400 });
    }

    const cookieStore = await cookies();
    const teamId = Number(cookieStore.get("teamId")?.value);
    if (!teamId) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    // Delete only if event belongs to the same team
    const [deletedEvent] = await db
      .delete(calendarEvents)
      .where(and(
        eq(calendarEvents.id, eventId),
        eq(calendarEvents.team_id, teamId)
      ))
      .returning({ id: calendarEvents.id });

    if (!deletedEvent) {
      return NextResponse.json({ ok: false, error: "Event not found or access denied" }, { status: 404 });
    }

    console.log(`[events.delete] id=${eventId} team=${teamId}`);
    return NextResponse.json({ ok: true, id: deletedEvent.id });
  } catch (error) {
    console.error("[events.delete][error]", error);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}