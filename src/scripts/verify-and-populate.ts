// Script to verify invite_code column exists and populate existing teams
import { db } from '../db';
import { teams } from '../db/schema';
import { eq } from 'drizzle-orm';

async function verifyAndPopulate() {
  console.log('🔍 Verifying invite_code column exists...');
  
  try {
    // First, try to query the invite_code column to verify it exists
    const allTeams = await db.query.teams.findMany({
      columns: {
        id: true,
        name: true,
        invite_code: true,
      }
    });
    
    console.log('✅ invite_code column exists! Current teams:');
    allTeams.forEach(team => {
      console.log(`- Team "${team.name}" (ID: ${team.id}) - Code: ${team.invite_code || 'NULL'}`);
    });
    
    // Find teams without invite codes and add them
    const teamsWithoutCodes = allTeams.filter(team => !team.invite_code);
    
    if (teamsWithoutCodes.length === 0) {
      console.log('✅ All teams already have invite codes!');
      return;
    }
    
    console.log(`📝 Adding invite codes to ${teamsWithoutCodes.length} teams...`);
    
    for (const team of teamsWithoutCodes) {
      // Generate unique invite code
      const randomSuffix = Math.floor(100000 + Math.random() * 900000);
      const inviteCode = `TEAM${randomSuffix}`;
      
      // Update team with invite code
      await db.update(teams)
        .set({ invite_code: inviteCode })
        .where(eq(teams.id, team.id));
      
      console.log(`✅ Team "${team.name}" (ID: ${team.id}) assigned code: ${inviteCode}`);
    }
    
    console.log('🎉 All teams now have invite codes!');
    
  } catch (error) {
    console.error('❌ Error:', error);
    if (error instanceof Error && error.message.includes('column "invite_code" does not exist')) {
      console.log('💡 The invite_code column does not exist yet. Migration may not have been applied.');
    }
  }
}

// Run if called directly
if (require.main === module) {
  verifyAndPopulate().then(() => process.exit(0)).catch(console.error);
}