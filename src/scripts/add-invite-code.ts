// Temporary script to add invite codes to existing teams
import { db } from '../db';
import { teams } from '../db/schema';
import { eq } from 'drizzle-orm';

async function addInviteCodes() {
  console.log('Adding invite codes to existing teams...');
  
  // Get all teams without invite codes
  const teamsWithoutCodes = await db.query.teams.findMany({
    where: (teams, { isNull }) => isNull(teams.invite_code),
  });
  
  console.log(`Found ${teamsWithoutCodes.length} teams without invite codes`);
  
  for (const team of teamsWithoutCodes) {
    // Generate unique invite code
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const inviteCode = `TEAM${randomSuffix}`;
    
    // Update team with invite code
    await db.update(teams)
      .set({ invite_code: inviteCode })
      .where(eq(teams.id, team.id));
    
    console.log(`Team "${team.name}" (ID: ${team.id}) assigned code: ${inviteCode}`);
  }
  
  console.log('✅ All teams now have invite codes');
}

// Run if called directly
if (require.main === module) {
  addInviteCodes().catch(console.error);
}