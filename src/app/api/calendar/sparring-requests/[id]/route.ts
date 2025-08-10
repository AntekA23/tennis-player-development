import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { calendarEvents, eventParticipants } from "@/db/schema";
import { cookies } from "next/headers";
import { getUserTeamRole } from "@/lib/permissions";
import { eq, and } from "drizzle-orm";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;
    const teamId = cookieStore.get("teamId")?.value;

    if (!userId || !teamId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify user is a coach
    const roleCheck = await getUserTeamRole(userId, teamId);
    if (!roleCheck || roleCheck.role !== 'coach') {
      return NextResponse.json({ 
        error: "Only coaches can approve/decline sparring requests" 
      }, { status: 403 });
    }

    const requestId = parseInt(id);
    const body = await request.json();
    const { action, assigned_partner_id, location } = body;

    if (!['approve', 'decline'].includes(action)) {
      return NextResponse.json({ 
        error: "Action must be 'approve' or 'decline'" 
      }, { status: 400 });
    }

    // Get the existing sparring request
    const [existingRequest] = await db
      .select()
      .from(calendarEvents)
      .where(
        and(
          eq(calendarEvents.id, requestId),
          eq(calendarEvents.team_id, parseInt(teamId)),
          eq(calendarEvents.activity_type, 'sparring_request')
        )
      );

    if (!existingRequest) {
      return NextResponse.json({ 
        error: "Sparring request not found" 
      }, { status: 404 });
    }

    if (existingRequest.request_status !== 'pending') {
      return NextResponse.json({ 
        error: "This request has already been processed" 
      }, { status: 400 });
    }

    let updateData: any = {
      request_status: action === 'approve' ? 'approved' : 'declined',
      approved_by: parseInt(userId),
    };

    // If approving, update title and location
    if (action === 'approve') {
      updateData.title = `Sparring Match${assigned_partner_id ? ' (Paired)' : ''}`;
      if (location) {
        updateData.location = location;
      }
    }

    // Update the sparring request
    const [updatedRequest] = await db
      .update(calendarEvents)
      .set(updateData)
      .where(eq(calendarEvents.id, requestId))
      .returning();

    // If approved and partner assigned, add both players as participants
    if (action === 'approve') {
      // Add the original requester as participant
      await db.insert(eventParticipants).values({
        event_id: requestId,
        user_id: existingRequest.created_by,
        status: 'confirmed',
      });

      // Add assigned partner if specified
      if (assigned_partner_id) {
        await db.insert(eventParticipants).values({
          event_id: requestId,
          user_id: parseInt(assigned_partner_id),
          status: 'confirmed',
        });
      }
    }

    const message = action === 'approve' 
      ? 'Sparring request approved successfully!'
      : 'Sparring request declined.';

    return NextResponse.json({
      success: true,
      request: updatedRequest,
      message
    });

  } catch (error) {
    console.error("Failed to process sparring request:", error);
    return NextResponse.json({ 
      error: "Internal server error" 
    }, { status: 500 });
  }
}