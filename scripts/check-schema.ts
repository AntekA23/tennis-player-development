// Schema validation script - verifies DB structure matches code expectations
import { db } from '../src/db';
import { teams, users, teamMembers } from '../src/db/schema';
import { sql } from 'drizzle-orm';

async function checkSchema() {
  console.log('🔍 Database Schema Validation');
  console.log('=============================\n');
  
  // Check if DATABASE_URL is available
  if (!process.env.DATABASE_URL) {
    console.log('⚠️  No DATABASE_URL found in environment');
    console.log('💡 To run this script:');
    console.log('   Local: Set up local Postgres or use Railway proxy');
    console.log('   Railway: npx railway run tsx scripts/check-schema.ts');
    console.log('   Manual: Copy Railway DB URL to .env.local as DATABASE_URL\n');
  }

  try {
    // 1. Check teams table structure
    console.log('📋 TEAMS TABLE:');
    console.log('---------------');
    
    // Get column info for teams table
    const teamsColumns = await db.execute(sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'teams' 
      ORDER BY ordinal_position;
    `);
    
    console.log('Columns:', teamsColumns.rows);
    
    // Test basic query
    const teamsCount = await db.select().from(teams);
    console.log(`Records: ${teamsCount.length} teams found`);
    
    // Check invite_code column specifically
    const teamsWithCodes = teamsCount.filter(team => team.invite_code);
    console.log(`Invite codes: ${teamsWithCodes.length}/${teamsCount.length} teams have invite codes`);
    
    console.log('\n📋 USERS TABLE:');
    console.log('---------------');
    
    const usersCount = await db.select().from(users);
    console.log(`Records: ${usersCount.length} users found`);
    
    console.log('\n📋 TEAM_MEMBERS TABLE:');
    console.log('----------------------');
    
    const membersCount = await db.select().from(teamMembers);
    console.log(`Records: ${membersCount.length} team memberships found`);
    
    // 2. Test relationships
    console.log('\n🔗 RELATIONSHIP TESTS:');
    console.log('----------------------');
    
    // Test team with members query
    const teamsWithMembers = await db.query.teams.findMany({
      with: {
        members: true,
      },
    });
    
    console.log(`Teams with members loaded: ${teamsWithMembers.length}`);
    teamsWithMembers.forEach(team => {
      console.log(`- "${team.name}" (${team.invite_code || 'NO CODE'}) has ${team.members.length} members`);
    });
    
    // 3. Critical field validation
    console.log('\n⚠️  CRITICAL VALIDATIONS:');
    console.log('-------------------------');
    
    // Check if invite_code column exists and is usable
    try {
      const codeTest = await db.select({ invite_code: teams.invite_code }).from(teams).limit(1);
      console.log('✅ invite_code column is queryable');
    } catch (error) {
      console.log('❌ invite_code column issue:', error);
    }
    
    // Check for teams without invite codes
    const teamsWithoutCodes = teamsCount.filter(team => !team.invite_code);
    if (teamsWithoutCodes.length > 0) {
      console.log(`⚠️  ${teamsWithoutCodes.length} teams missing invite codes:`);
      teamsWithoutCodes.forEach(team => {
        console.log(`   - "${team.name}" (ID: ${team.id})`);
      });
    } else {
      console.log('✅ All teams have invite codes');
    }
    
    console.log('\n🎉 Schema validation complete!');
    
  } catch (error) {
    console.error('❌ Schema validation failed:', error);
    
    if (error instanceof Error && error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 Connection Issues:');
      console.log('   • Cannot connect to Railway database from local environment');
      console.log('   • This is normal - Railway DB is not accessible locally');
      console.log('   • To validate schema:');
      console.log('     1. Use Railway UI to visually inspect tables');
      console.log('     2. Run: npx railway run tsx scripts/check-schema.ts');
      console.log('     3. Or test the deployed application end-to-end\n');
      console.log('⚠️  IMPORTANT: Do not proceed with DB changes without visual verification!');
    }
    
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  checkSchema().then(() => process.exit(0)).catch(console.error);
}

export { checkSchema };