import { NextResponse } from 'next/server';
import { db } from '@/db';
import { teamMembers } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // Check if user is in any team
    const membership = await db.query.teamMembers.findFirst({
      where: eq(teamMembers.user_id, parseInt(userId)),
    });

    return NextResponse.json({ 
      hasTeam: !!membership,
      teamId: membership?.team_id 
    });
  } catch (error) {
    console.error('Team check error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}