// Quick script to get test IDs from the database
// Run with: node get-test-ids.js

import { db } from './src/db/index.js';
import { calendarEvents, users, eventParticipants } from './src/db/schema.js';
import { eq, and, or, sql } from 'drizzle-orm';

async function getTestIds() {
  console.log('\n🔍 Finding IDs for testing...\n');
  
  // Get practice/gym/education events
  const trainingEvents = await db
    .select({
      id: calendarEvents.id,
      title: calendarEvents.title,
      type: calendarEvents.activity_type,
      participants: sql`COUNT(DISTINCT ${eventParticipants.user_id})`
    })
    .from(calendarEvents)
    .leftJoin(eventParticipants, 
      and(
        eq(eventParticipants.event_id, calendarEvents.id),
        eq(eventParticipants.role, 'player')
      )
    )
    .where(
      or(
        eq(calendarEvents.activity_type, 'practice'),
        eq(calendarEvents.activity_type, 'gym'),
        eq(calendarEvents.activity_type, 'education')
      )
    )
    .groupBy(calendarEvents.id, calendarEvents.title, calendarEvents.activity_type)
    .limit(5);
    
  console.log('Training Events (for training-log API):');
  trainingEvents.forEach(e => {
    console.log(`  ID: ${e.id} - "${e.title}" (${e.type}) - ${e.participants} players`);
  });
  
  // Get match/sparring events
  const matchEvents = await db
    .select({
      id: calendarEvents.id,
      title: calendarEvents.title,
      type: calendarEvents.activity_type,
      participants: sql`COUNT(DISTINCT ${eventParticipants.user_id})`
    })
    .from(calendarEvents)
    .leftJoin(eventParticipants,
      and(
        eq(eventParticipants.event_id, calendarEvents.id),
        eq(eventParticipants.role, 'player')
      )
    )
    .where(
      or(
        eq(calendarEvents.activity_type, 'match'),
        eq(calendarEvents.activity_type, 'sparring_request')
      )
    )
    .groupBy(calendarEvents.id, calendarEvents.title, calendarEvents.activity_type)
    .having(sql`COUNT(DISTINCT ${eventParticipants.user_id}) = 2`)
    .limit(5);
    
  console.log('\nMatch Events (for match-result API - need exactly 2 players):');
  matchEvents.forEach(e => {
    console.log(`  ID: ${e.id} - "${e.title}" (${e.type}) - ${e.participants} players`);
  });
  
  // Get users
  const allUsers = await db
    .select({
      id: users.id,
      email: users.email,
      role: users.role
    })
    .from(users)
    .limit(10);
    
  console.log('\nUsers:');
  allUsers.forEach(u => {
    console.log(`  ID: ${u.id} - ${u.email} (${u.role})`);
  });
  
  // Get a specific event's participants
  if (trainingEvents.length > 0) {
    const eventId = trainingEvents[0].id;
    const participants = await db
      .select({
        userId: eventParticipants.user_id,
        email: users.email,
        role: eventParticipants.role
      })
      .from(eventParticipants)
      .innerJoin(users, eq(users.id, eventParticipants.user_id))
      .where(eq(eventParticipants.event_id, eventId));
      
    console.log(`\nParticipants in event ${eventId}:`);
    participants.forEach(p => {
      console.log(`  User ID: ${p.userId} - ${p.email} (${p.role})`);
    });
  }
  
  if (matchEvents.length > 0) {
    const eventId = matchEvents[0].id;
    const participants = await db
      .select({
        userId: eventParticipants.user_id,
        email: users.email,
        role: eventParticipants.role
      })
      .from(eventParticipants)
      .innerJoin(users, eq(users.id, eventParticipants.user_id))
      .where(eq(eventParticipants.event_id, eventId));
      
    console.log(`\nParticipants in match event ${eventId}:`);
    participants.forEach(p => {
      console.log(`  User ID: ${p.userId} - ${p.email} (${p.role})`);
    });
  }
  
  console.log('\n📝 Update test-phase2-apis.js TEST_DATA with these IDs!');
  
  process.exit(0);
}

getTestIds().catch(console.error);