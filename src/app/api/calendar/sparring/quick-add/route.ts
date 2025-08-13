import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/db";
import { calendarEvents, eventParticipants } from "@/db/schema";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const start = new Date(body?.startISO);
    const end = new Date(body?.endISO);

    if (!body?.startISO || !body?.endISO || isNaN(+start) || isNaN(+end) || end <= start) {
      return NextResponse.json({ ok: false, error: "Invalid time range" }, { status: 400 });
    }

    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;
    const teamId = cookieStore.get("teamId")?.value;
    if (!userId || !teamId) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    // Minimal insert values - no approval workflow
    const baseValues: any = {
      title: body?.title ?? "Sparring",
      description: body?.notes ?? null,
      start_time: start,
      end_time: end,
      location: body?.location ?? null,
      activity_type: "sparring_request", // Use existing enum value
      created_by: Number(userId),
      team_id: Number(teamId),
    };

    const [row] = await db
      .insert(calendarEvents)
      .values(baseValues)
      .returning({ id: calendarEvents.id });

    // Add creator as participant
    if (row?.id) {
      await db.insert(eventParticipants).values({
        event_id: row.id,
        user_id: Number(userId),
        status: "confirmed",
      });
    }

    console.log("[quick-add-sparring]", { teamId, userId, insertedId: row?.id });
    return NextResponse.json({ ok: true, id: row?.id });
  } catch (e) {
    console.error("[quick-add-sparring][error]", e);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}