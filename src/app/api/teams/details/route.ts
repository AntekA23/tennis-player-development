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

    // Get user's team with members
    const userMembership = await db.query.teamMembers.findFirst({
      where: eq(teamMembers.user_id, parseInt(userId)),
      with: {
        team: {
          with: {
            members: {
              with: {
                user: {
                  columns: { email: true }
                }
              }
            }
          }
        }
      }
    });

    if (!userMembership) {
      return NextResponse.json({ team: null });
    }

    return NextResponse.json({ team: userMembership.team });
  } catch (error) {
    console.error('Team details error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}