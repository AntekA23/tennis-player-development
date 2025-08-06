import { NextResponse } from 'next/server';
import { db } from '@/db';
import { teams, teamMembers } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: Request) {
  console.log('🎯 JOIN TEAM API CALLED - CACHE BUST TEST');
  try {
    const { inviteCode, userId } = await request.json();
    console.log('📝 Data received:', { inviteCode, userId });

    if (!inviteCode || !userId) {
      return NextResponse.json({ error: 'Invite code and user ID required' }, { status: 400 });
    }

    // Find team by exact invite code match
    const team = await db.query.teams.findFirst({
      where: eq(teams.invite_code, inviteCode),
    });

    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    // Check if user is already a member
    const existingMember = await db.query.teamMembers.findFirst({
      where: (teamMembers, { and, eq }) => and(
        eq(teamMembers.team_id, team.id),
        eq(teamMembers.user_id, userId)
      ),
    });

    if (existingMember) {
      return NextResponse.json({ error: 'Already a member of this team' }, { status: 409 });
    }

    // Add user to team
    await db.insert(teamMembers).values({
      team_id: team.id,
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