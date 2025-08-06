import { NextResponse } from 'next/server';
import { db } from '@/db';
import { teams, teamMembers } from '@/db/schema';

export async function POST(request: Request) {
  console.log('🎯 CREATE TEAM API CALLED');
  try {
    const { teamName, userId } = await request.json();

    if (!teamName || !userId) {
      return NextResponse.json({ error: 'Team name and user ID required' }, { status: 400 });
    }

    // Generate unique invite code
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const inviteCode = `TEAM${randomSuffix}`;

    // Create team with invite code
    const newTeam = await db.insert(teams).values({
      name: teamName,
      created_by: userId,
      invite_code: inviteCode,
    }).returning();

    // Add creator as first member
    await db.insert(teamMembers).values({
      team_id: newTeam[0].id,
      user_id: userId,
      role: 'creator',
      invited_by: userId,
      status: 'accepted',
    });

    console.log(`Team "${teamName}" created! Invite code: ${inviteCode}`);

    return NextResponse.json({ 
      team: newTeam[0], 
      inviteCode,
      message: 'Team created successfully'
    });
  } catch (error) {
    console.error('Create team error:', error);
    return NextResponse.json({ error: 'Failed to create team' }, { status: 500 });
  }
}