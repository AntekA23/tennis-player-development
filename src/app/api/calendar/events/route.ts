import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { calendarEvents } from "@/db/schema";
import { eq, and, gte, lte, asc } from "drizzle-orm";
import { cookies } from "next/headers";
import { canCreateEvent, type ActivityType } from "@/lib/permissions";

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
    const { title, description, activity_type, start_time, end_time, location, is_recurring, recurrence_pattern } = body;

    if (!title || !activity_type || !start_time || !end_time) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check role-based creation permission
    const createPermission = await canCreateEvent(userId, teamId, activity_type as ActivityType);
    if (!createPermission.allowed) {
      return NextResponse.json(
        { error: createPermission.reason || "Not authorized to create this event type" },
        { status: 403 }
      );
    }

    const validActivityTypes = ['practice', 'gym', 'match', 'tournament', 'education', 'sparring_request'];
    if (!validActivityTypes.includes(activity_type)) {
      return NextResponse.json(
        { error: "Invalid activity type" },
        { status: 400 }
      );
    }

    const [newEvent] = await db.insert(calendarEvents).values({
      team_id: parseInt(teamId),
      created_by: parseInt(userId),
      title,
      description: description || null,
      activity_type,
      start_time: new Date(start_time),
      end_time: new Date(end_time),
      location: location || null,
      is_recurring: is_recurring || false,
      recurrence_pattern: recurrence_pattern || null,
      original_event_id: null, // Will be set when cloning
    }).returning();

    return NextResponse.json({ event: newEvent }, { status: 201 });
  } catch (error) {
    console.error("Error creating calendar event:", error);
    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 }
    );
  }
}