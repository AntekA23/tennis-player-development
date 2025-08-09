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

    // Verify user is a parent
    const roleCheck = await getUserTeamRole(userId, teamId);
    if (!roleCheck || roleCheck.role !== 'parent') {
      return NextResponse.json({ 
        error: "Only parents can submit requests" 
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
      request_type,
      status = 'pending'
    } = body;

    // Validate required fields
    if (!start_time || !end_time) {
      return NextResponse.json({ 
        error: "Start time and end time are required" 
      }, { status: 400 });
    }

    // Validate activity type for parent requests
    if (activity_type !== 'education') {
      return NextResponse.json({ 
        error: "Parent requests must be education type" 
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
        error: "Cannot request time in the past" 
      }, { status: 400 });
    }

    // Create the request as a pending education event
    const [newRequest] = await db.insert(calendarEvents).values({
      title: title || (request_type === 'education' ? 'Education Request' : 'Unavailable Period'),
      description: description || null,
      activity_type: 'education',
      start_time: startDate,
      end_time: endDate,
      location: location || null,
      created_by: parseInt(userId), // Parent who created the request
      team_id: parseInt(teamId), // Use actual team ID from cookies
      // Add custom fields for tracking requests
      // These would need to be added to schema in future
      // request_type: request_type,
      // status: status
    }).returning();

    return NextResponse.json({
      success: true,
      request: newRequest,
      message: `${request_type === 'education' ? 'Education' : 'Unavailable'} request submitted successfully. Coach will review and approve.`
    });

  } catch (error) {
    console.error("Failed to create parent request:", error);
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
      // Coaches can see all education requests (pending parent requests)
      requests = await db
        .select()
        .from(calendarEvents)
        .where(eq(calendarEvents.activity_type, 'education'));
    } else if (roleCheck.role === 'parent') {
      // Parents can only see their own requests
      requests = await db
        .select()
        .from(calendarEvents)
        .where(
          and(
            eq(calendarEvents.activity_type, 'education'),
            eq(calendarEvents.created_by, parseInt(userId))
          )
        );
    } else {
      return NextResponse.json({ 
        error: "Players cannot access parent requests" 
      }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      requests: requests || []
    });

  } catch (error) {
    console.error("Failed to fetch parent requests:", error);
    return NextResponse.json({ 
      error: "Internal server error" 
    }, { status: 500 });
  }
}