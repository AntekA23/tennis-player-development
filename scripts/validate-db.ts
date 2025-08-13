#!/usr/bin/env npx tsx

/**
 * Database validation script to check sparring data
 * Usage: npm run validate-db
 */

import { db } from "../src/db";
import { calendarEvents, eventParticipants } from "../src/db/schema";
import { desc, eq } from "drizzle-orm";

async function validateDatabase() {
  console.log("🔍 Validating Database - Sparring Events");
  console.log("=" .repeat(50));

  try {
    // 1. Check recent calendar events
    console.log("\n📅 Recent Calendar Events (last 10):");
    const recentEvents = await db.select().from(calendarEvents)
      .orderBy(desc(calendarEvents.created_at))
      .limit(10);
    
    console.table(recentEvents.map(e => ({
      id: e.id,
      title: e.title,
      activity_type: e.activity_type,
      start_time: e.start_time?.toISOString()?.slice(0, 16) || 'null',
      team_id: e.team_id,
      created_by: e.created_by,
      created_at: e.created_at?.toISOString()?.slice(0, 16) || 'null'
    })));

    // 2. Check specifically for sparring events
    console.log("\n🎾 Sparring Events Only:");
    const sparringEvents = await db.select().from(calendarEvents)
      .where(eq(calendarEvents.activity_type, 'sparring' as any))
      .orderBy(desc(calendarEvents.created_at));
    
    if (sparringEvents.length === 0) {
      console.log("❌ No sparring events found");
      console.log("💡 Try creating one with Quick Add Sparring button");
    } else {
      console.table(sparringEvents.map(e => ({
        id: e.id,
        title: e.title,
        location: e.location || 'null',
        start_time: e.start_time?.toISOString() || 'null',
        end_time: e.end_time?.toISOString() || 'null',
        description: e.description || 'null'
      })));
    }

    // 3. Check event participants for sparring
    if (sparringEvents.length > 0) {
      console.log("\n👥 Sparring Event Participants:");
      for (const event of sparringEvents) {
        const participants = await db.select().from(eventParticipants)
          .where(eq(eventParticipants.event_id, event.id));
        console.log(`Event ${event.id} (${event.title}):`, participants);
      }
    }

    // 4. Summary
    console.log("\n📊 Summary:");
    console.log(`Total events: ${recentEvents.length}`);
    console.log(`Sparring events: ${sparringEvents.length}`);
    
    if (sparringEvents.length > 0) {
      console.log("✅ Sparring events found - Quick Add working!");
    } else {
      console.log("⚠️  No sparring events - test Quick Add feature");
    }

  } catch (error) {
    console.error("❌ Database connection failed:", error);
    console.log("\n💡 Make sure DATABASE_URL is set correctly");
    console.log("💡 Railway PostgreSQL should be accessible");
  }
}

validateDatabase().then(() => {
  console.log("\n✅ Validation complete");
  process.exit(0);
}).catch(error => {
  console.error("💥 Script failed:", error);
  process.exit(1);
});