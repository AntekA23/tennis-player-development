import { NextResponse } from 'next/server';
import { db } from '@/db';
import { teams, teamMembers } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: Request) {
  console.log('🎯 JOIN TEAM API CALLED');
  try {
    const { inviteCode, userId } = await request.json();
    console.log('📝 Data received:', { inviteCode, userId });

    if (!inviteCode || !userId) {
      return NextResponse.json({ error: 'Invite code and user ID required' }, { status: 400 });
    }

    // Parse team ID from invite code (format: TEAM{id}{timestamp})
    const teamIdMatch = inviteCode.match(/^TEAM(\d+)/);
    if (!teamIdMatch) {
      return NextResponse.json({ error: 'Invalid invite code format' }, { status: 400 });
    }

    const teamId = parseInt(teamIdMatch[1]);

    // Check if team exists
    const team = await db.query.teams.findFirst({
      where: eq(teams.id, teamId),
    });

    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    // Check if user is already a member
    const existingMember = await db.query.teamMembers.findFirst({
      where: (teamMembers, { and, eq }) => and(
        eq(teamMembers.team_id, teamId),
        eq(teamMembers.user_id, userId)
      ),
    });

    if (existingMember) {
      return NextResponse.json({ error: 'Already a member of this team' }, { status: 409 });
    }

    // Add user to team
    await db.insert(teamMembers).values({
      team_id: teamId,
      user_id: userId,
      role: 'member',
      invited_by: team.created_by,
      status: 'accepted',
    });

    return NextResponse.json({ 
      message: 'Successfully joined team',
      team: team
    });
  } catch (error) {
    console.error('Join team error:', error);
    return NextResponse.json({ error: 'Failed to join team' }, { status: 500 });
  }
}