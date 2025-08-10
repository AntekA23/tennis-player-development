import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { calendarEvents } from "@/db/schema";
import { cookies } from "next/headers";
import { getUserTeamRole } from "@/lib/permissions";
import { eq, and } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;
    const teamId = cookieStore.get("teamId")?.value;

    if (!userId || !teamId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Allow all authenticated team members to log sparring sessions
    const roleCheck = await getUserTeamRole(userId, teamId);
    if (!roleCheck) {
      return NextResponse.json({ 
        error: "You must be a team member to log sparring sessions" 
      }, { status: 403 });
    }

    const body = await request.json();
    const { 
      title, 
      description, 
      activity_type, 
      start_time, 
      end_time, 
      location,
      skill_preference,
      partner_preference,
      notes
    } = body;

    // Validate required fields
    if (!start_time || !end_time) {
      return NextResponse.json({ 
        error: "Start time and end time are required" 
      }, { status: 400 });
    }

    // Validate time ordering
    const startDate = new Date(start_time);
    const endDate = new Date(end_time);
    
    if (startDate >= endDate) {
      return NextResponse.json({ 
        error: "End time must be after start time" 
      }, { status: 400 });
    }

    if (startDate < new Date()) {
      return NextResponse.json({ 
        error: "Cannot log sparring in the past" 
      }, { status: 400 });
    }

    // Create the sparring session directly (no approval needed)
    const [newRequest] = await db.insert(calendarEvents).values({
      title: title || 'Sparring Session',
      description: description || null,
      activity_type: 'sparring_request',
      start_time: startDate,
      end_time: endDate,
      location: location || 'Tennis Court',
      created_by: parseInt(userId),
      team_id: parseInt(teamId),
      request_status: 'confirmed', // Already confirmed, no approval needed
    }).returning();

    return NextResponse.json({
      success: true,
      request: newRequest,
      message: "Sparring session logged successfully!"
    });

  } catch (error) {
    console.error("Failed to create sparring request:", error);
    return NextResponse.json({ 
      error: "Internal server error" 
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;
    const teamId = cookieStore.get("teamId")?.value;

    if (!userId || !teamId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user role to determine what requests they can see
    const roleCheck = await getUserTeamRole(userId, teamId);
    if (!roleCheck) {
      return NextResponse.json({ 
        error: "Failed to verify user role" 
      }, { status: 403 });
    }

    let requests;

    if (roleCheck.role === 'coach') {
      // Coaches can see all sparring requests for their team
      requests = await db
        .select()
        .from(calendarEvents)
        .where(
          and(
            eq(calendarEvents.team_id, parseInt(teamId)),
            eq(calendarEvents.activity_type, 'sparring_request')
          )
        );
    } else if (roleCheck.role === 'player') {
      // Players can only see their own sparring requests
      requests = await db
        .select()
        .from(calendarEvents)
        .where(
          and(
            eq(calendarEvents.team_id, parseInt(teamId)),
            eq(calendarEvents.activity_type, 'sparring_request'),
            eq(calendarEvents.created_by, parseInt(userId))
          )
        );
    } else {
      return NextResponse.json({ 
        error: "Parents cannot access sparring requests" 
      }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      requests: requests || []
    });

  } catch (error) {
    console.error("Failed to fetch sparring requests:", error);
    return NextResponse.json({ 
      error: "Internal server error" 
    }, { status: 500 });
  }
}