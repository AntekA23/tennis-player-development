import { config } from "dotenv";
import { db } from "../src/db";
import { users, calendarEvents } from "../src/db/schema";

// Load environment variables
config({ path: ".env" });

async function checkDatabase() {
  try {
    console.log("Checking production database...\n");
    
    // Check users
    const userList = await db.select().from(users);
    console.log(`Users in DB: ${userList.length}`);
    userList.forEach(u => {
      console.log(`  - ${u.email} (${u.role})`);
    });
    
    // Check events
    const events = await db.select().from(calendarEvents);
    console.log(`\nEvents in DB: ${events.length}`);
    const eventTypes = [...new Set(events.map(e => e.activity_type))];
    console.log(`Event types: ${eventTypes.join(", ")}`);
    
    // Check for test users specifically
    const testEmails = ['coach@test.com', 'parent@test.com', 'player@test.com'];
    const testUsers = userList.filter(u => testEmails.includes(u.email));
    
    if (testUsers.length > 0) {
      console.log("\n✅ Test users already exist in production!");
      console.log("You can now test the application with these accounts:");
      console.log("  Coach: coach@test.com / testpass123");
      console.log("  Parent: parent@test.com / testpass123");
      console.log("  Player: player@test.com / testpass123");
    } else {
      console.log("\n⚠️ Test users not found. You may need to seed them.");
    }
    
    process.exit(0);
  } catch (error) {
    console.error("Error checking database:", error);
    process.exit(1);
  }
}

checkDatabase();