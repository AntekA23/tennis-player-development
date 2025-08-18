#!/usr/bin/env node
/**
 * PR-DC1 Evidence Test Suite
 * Run: npx tsx scripts/pr_dc1_evidence.ts
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const TEAM_ID = process.env.TEAM_ID || '1';
const PARENT_ID = process.env.PARENT_ID || '1';
const PLAYER_ID = process.env.PLAYER_ID || '2';
const NONTEAM_ID = process.env.NONTEAM_ID || '99999';

let failCount = 0;
const results: any[] = [];

async function test(name: string, method: string, path: string, body: any, expectedStatus: number, checks?: any) {
  console.log(`\n[TEST] ${name}`);
  console.log(`${method} ${path}`);
  console.log('Request:', JSON.stringify(body, null, 2));
  
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `teamId=${TEAM_ID}; userId=${PARENT_ID}`
      },
      body: JSON.stringify(body)
    });
    
    const json = await res.json().catch(() => ({}));
    console.log(`Response: ${res.status}`, json);
    
    if (res.status !== expectedStatus) {
      console.error(`❌ Expected ${expectedStatus}, got ${res.status}`);
      failCount++;
    } else {
      console.log(`✅ Status correct`);
    }
    
    if (checks) {
      for (const [key, expected] of Object.entries(checks)) {
        const actual = json[key];
        if (actual !== expected) {
          console.error(`❌ Expected ${key}=${expected}, got ${actual}`);
          failCount++;
        }
      }
    }
    
    results.push({ name, status: res.status, body: json });
    return json;
  } catch (err) {
    console.error(`❌ Request failed:`, err);
    failCount++;
    return null;
  }
}

async function main() {
  console.log('=== PR-DC1 Evidence Tests ===');
  console.log(`BASE_URL: ${BASE_URL}`);
  console.log(`TEAM_ID: ${TEAM_ID}`);
  console.log(`PARENT_ID: ${PARENT_ID}`);
  console.log(`PLAYER_ID: ${PLAYER_ID}`);
  console.log(`NONTEAM_ID: ${NONTEAM_ID}`);
  
  // Test 1: Invalid participants - Parent in Match
  await test(
    '1. Parent in Match → 400',
    'POST',
    '/api/calendar/events',
    {
      title: 'Test Match',
      activity_type: 'match',
      start_time: new Date().toISOString(),
      participants: [{ user_id: parseInt(PARENT_ID) }]
    },
    400,
    { error: 'invalid_participants' }
  );
  
  // Test 2: Tournament National
  const startTime = new Date().toISOString();
  const event2 = await test(
    '2. Tournament National → +2d',
    'POST',
    '/api/calendar/events',
    {
      title: 'National Tournament',
      activity_type: 'tournament',
      tournamentScope: 'national',
      start_time: startTime,
      participants: [{ user_id: parseInt(PLAYER_ID) }]
    },
    201
  );
  
  if (event2?.event) {
    const start = new Date(event2.event.start_time);
    const end = new Date(event2.event.end_time);
    const diffDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
    console.log(`Duration: ${diffDays} days`);
    if (Math.abs(diffDays - 2) > 0.1) {
      console.error('❌ Expected 2 days duration');
      failCount++;
    }
  }
  
  // Test 3: Tournament International-TE
  const event3 = await test(
    '3. Tournament International-TE → +3d',
    'POST',
    '/api/calendar/events',
    {
      title: 'International Tournament',
      activity_type: 'tournament',
      tournamentScope: 'international_te',
      start_time: startTime,
      participants: [{ user_id: parseInt(PLAYER_ID) }]
    },
    201
  );
  
  if (event3?.event) {
    const start = new Date(event3.event.start_time);
    const end = new Date(event3.event.end_time);
    const diffDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
    console.log(`Duration: ${diffDays} days`);
    if (Math.abs(diffDays - 3) > 0.1) {
      console.error('❌ Expected 3 days duration');
      failCount++;
    }
  }
  
  // Test 4: Education default end
  const event4 = await test(
    '4. Education → +60m',
    'POST',
    '/api/calendar/events',
    {
      title: 'Tennis Theory',
      activity_type: 'education',
      start_time: startTime,
      participants: [
        { user_id: parseInt(PARENT_ID) },
        { user_id: parseInt(PLAYER_ID) }
      ]
    },
    201
  );
  
  if (event4?.event) {
    const start = new Date(event4.event.start_time);
    const end = new Date(event4.event.end_time);
    const diffMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
    console.log(`Duration: ${diffMinutes} minutes`);
    if (Math.abs(diffMinutes - 60) > 1) {
      console.error('❌ Expected 60 minutes duration');
      failCount++;
    }
  }
  
  // Test 5: Not-in-team
  await test(
    '5. Not-in-team → 400',
    'POST',
    '/api/calendar/events',
    {
      title: 'Test Practice',
      activity_type: 'practice',
      start_time: startTime,
      end_time: new Date(Date.now() + 3600000).toISOString(),
      participants: [{ user_id: parseInt(NONTEAM_ID) }]
    },
    400,
    { error: 'participant_not_in_team' }
  );
  
  // Test 6: Tournament player guarantee
  await test(
    '6a. Tournament no players (multi-team) → 400',
    'POST',
    '/api/calendar/events',
    {
      title: 'Tournament No Players',
      activity_type: 'tournament',
      tournamentScope: 'national',
      start_time: startTime,
      participants: []
    },
    400,
    { error: 'select_player_required' }
  );
  
  // Note: 6b requires single-player team fixture
  console.log('\n[NOTE] Test 6b (single-player auto-add) requires specific team fixture');
  
  // Summary
  console.log('\n=== SUMMARY ===');
  console.log(`Tests run: ${results.length}`);
  console.log(`Failures: ${failCount}`);
  
  if (failCount > 0) {
    console.log('\n❌ TESTS FAILED');
    process.exit(1);
  } else {
    console.log('\n✅ ALL TESTS PASSED');
    process.exit(0);
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});