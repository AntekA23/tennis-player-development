import { db } from "../src/db";
import { users, teams, teamMembers, parentChild, calendarEvents, eventParticipants } from "../src/db/schema";
import bcrypt from "bcryptjs";

async function seedTestUsers() {
  console.log("🌱 Starting test user seeding...");

  try {
    // Hash password for all test users
    const hashedPassword = await bcrypt.hash("testpass123", 10);

    // Create test users
    console.log("Creating test users...");
    const [coach] = await db.insert(users).values({
      email: "coach@test.com",
      password: hashedPassword,
      role: "coach",
    }).returning();

    const [parent] = await db.insert(users).values({
      email: "parent@test.com",
      password: hashedPassword,
      role: "parent",
    }).returning();

    const [player] = await db.insert(users).values({
      email: "player@test.com",
      password: hashedPassword,
      role: "player",
    }).returning();

    console.log("✅ Test users created");

    // Create test team
    console.log("Creating test team...");
    const [testTeam] = await db.insert(teams).values({
      name: "Test Tennis Academy",
      created_by: coach.id,
      invite_code: "TEST123",
    }).returning();

    console.log("✅ Test team created");

    // Add members to team
    console.log("Adding members to team...");
    await db.insert(teamMembers).values([
      {
        team_id: testTeam.id,
        user_id: coach.id,
        role: "coach",
        invited_by: coach.id,
        status: "accepted",
      },
      {
        team_id: testTeam.id,
        user_id: parent.id,
        role: "parent",
        invited_by: coach.id,
        status: "accepted",
      },
      {
        team_id: testTeam.id,
        user_id: player.id,
        role: "player",
        invited_by: coach.id,
        status: "accepted",
      },
    ]);

    console.log("✅ Team members added");

    // Create parent-child relationship
    console.log("Creating parent-child relationship...");
    await db.insert(parentChild).values({
      parent_id: parent.id,
      child_id: player.id,
    });

    console.log("✅ Parent-child relationship created");

    // Create sample events
    console.log("Creating sample events...");
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const [practiceEvent] = await db.insert(calendarEvents).values({
      team_id: testTeam.id,
      created_by: coach.id,
      title: "Morning Practice",
      description: "Regular team practice session",
      activity_type: "practice",
      start_time: new Date(tomorrow.setHours(9, 0, 0, 0)),
      end_time: new Date(tomorrow.setHours(11, 0, 0, 0)),
      location: "Court 1",
    }).returning();

    const [matchEvent] = await db.insert(calendarEvents).values({
      team_id: testTeam.id,
      created_by: coach.id,
      title: "Friendly Match",
      description: "Match against neighboring club",
      activity_type: "match",
      start_time: new Date(nextWeek.setHours(14, 0, 0, 0)),
      end_time: new Date(nextWeek.setHours(16, 0, 0, 0)),
      location: "Center Court",
    }).returning();

    const [educationEvent] = await db.insert(calendarEvents).values({
      team_id: testTeam.id,
      created_by: parent.id,
      title: "Study Time",
      description: "Exam preparation (parent request)",
      activity_type: "education",
      start_time: new Date(tomorrow.setHours(15, 0, 0, 0)),
      end_time: new Date(tomorrow.setHours(17, 0, 0, 0)),
      location: "Library",
    }).returning();

    console.log("✅ Sample events created");

    // Add player as participant to practice and match
    console.log("Adding event participants...");
    await db.insert(eventParticipants).values([
      {
        event_id: practiceEvent.id,
        user_id: player.id,
        status: "confirmed",
      },
      {
        event_id: matchEvent.id,
        user_id: player.id,
        status: "confirmed",
      },
    ]);

    console.log("✅ Event participants added");

    console.log("\n🎉 Test data seeding completed successfully!");
    console.log("\n📋 Test Accounts:");
    console.log("Coach: coach@test.com / testpass123");
    console.log("Parent: parent@test.com / testpass123");
    console.log("Player: player@test.com / testpass123");
    console.log("Team Invite Code: TEST123");

  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
}

// Run the seeding
seedTestUsers().then(() => process.exit(0));