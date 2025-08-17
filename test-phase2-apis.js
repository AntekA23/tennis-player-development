// Test script for Phase 2 API endpoints
// Run with: node test-phase2-apis.js

const API_BASE = 'http://localhost:3000/api';

// Test data - adjust IDs based on your actual database
const TEST_DATA = {
  // These should be real IDs from your database
  practiceEventId: 1,  // A practice/gym/education event
  matchEventId: 2,     // A match or sparring_request event  
  playerId: 3,         // A player who is participant in above events
  player2Id: 4,        // Second player for match (must be participant)
  coachId: 1,          // User making the API calls
  teamId: 1,           // Your team ID
};

// Helper to make API calls with cookies
async function apiCall(path, method, body) {
  const cookies = `userId=${TEST_DATA.coachId}; teamId=${TEST_DATA.teamId}`;
  
  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Cookie': cookies
    },
    body: JSON.stringify(body)
  });
  
  const data = await response.json();
  return { status: response.status, data };
}

async function testTrainingLog() {
  console.log('\n📋 Testing Training Log API...\n');
  
  // Test 1: Create training log
  console.log('1. Creating training log...');
  const createResult = await apiCall(
    `/events/${TEST_DATA.practiceEventId}/training-log`,
    'POST',
    {
      player_id: TEST_DATA.playerId,
      attendance_status: 'present',
      performance_rating: 8,
      notes: 'Great backhand practice today'
    }
  );
  console.log(`   Status: ${createResult.status}`);
  console.log(`   Response:`, createResult.data);
  
  // Test 2: Update same training log (upsert)
  console.log('\n2. Updating training log (upsert)...');
  const updateResult = await apiCall(
    `/events/${TEST_DATA.practiceEventId}/training-log`,
    'POST',
    {
      player_id: TEST_DATA.playerId,
      attendance_status: 'late',
      performance_rating: 7,
      notes: 'Arrived 10 minutes late but good effort'
    }
  );
  console.log(`   Status: ${updateResult.status}`);
  console.log(`   Response:`, updateResult.data);
  
  // Test 3: Invalid attendance status
  console.log('\n3. Testing invalid attendance status...');
  const invalidResult = await apiCall(
    `/events/${TEST_DATA.practiceEventId}/training-log`,
    'POST',
    {
      player_id: TEST_DATA.playerId,
      attendance_status: 'invalid_status'
    }
  );
  console.log(`   Status: ${invalidResult.status} (should be 400)`);
  console.log(`   Error:`, invalidResult.data.error);
  
  // Test 4: Invalid performance rating
  console.log('\n4. Testing invalid performance rating...');
  const ratingResult = await apiCall(
    `/events/${TEST_DATA.practiceEventId}/training-log`,
    'POST',
    {
      player_id: TEST_DATA.playerId,
      attendance_status: 'present',
      performance_rating: 15  // Should be 1-10
    }
  );
  console.log(`   Status: ${ratingResult.status} (should be 400)`);
  console.log(`   Error:`, ratingResult.data.error);
}

async function testMatchResult() {
  console.log('\n\n🎾 Testing Match Result API...\n');
  
  // Test 1: Create match result
  console.log('1. Creating match result...');
  const createResult = await apiCall(
    `/events/${TEST_DATA.matchEventId}/match-result`,
    'POST',
    {
      winner_id: TEST_DATA.playerId,
      score_text: '6-4 6-2',
      notes: 'Good match, strong serve from winner'
    }
  );
  console.log(`   Status: ${createResult.status}`);
  console.log(`   Response:`, createResult.data);
  
  // Test 2: Try to create duplicate (should fail)
  console.log('\n2. Testing duplicate match result...');
  const duplicateResult = await apiCall(
    `/events/${TEST_DATA.matchEventId}/match-result`,
    'POST',
    {
      winner_id: TEST_DATA.player2Id,
      score_text: '6-3 6-4'
    }
  );
  console.log(`   Status: ${duplicateResult.status} (should be 400)`);
  console.log(`   Error:`, duplicateResult.data.error);
  
  // Test 3: Invalid score format
  console.log('\n3. Testing invalid score format...');
  const invalidScore = await apiCall(
    `/events/${TEST_DATA.matchEventId}/match-result`,
    'POST',
    {
      score_text: 'Winner: Player 1'  // Invalid format
    }
  );
  console.log(`   Status: ${invalidScore.status} (should be 400)`);
  console.log(`   Error:`, invalidScore.data.error);
  
  // Test 4: Valid multi-set score
  console.log('\n4. Testing valid 3-set score format...');
  const threeSetScore = await apiCall(
    `/events/${TEST_DATA.matchEventId}/match-result`,
    'POST',
    {
      score_text: '6-4 3-6 7-5',
      notes: 'Epic 3-setter!'
    }
  );
  console.log(`   Status: ${threeSetScore.status}`);
  console.log(`   Valid:`, threeSetScore.data.error || 'Score format accepted');
}

async function runTests() {
  console.log('================================');
  console.log('Phase 2 API Testing');
  console.log('================================');
  console.log('\n⚠️  IMPORTANT: Update TEST_DATA with real IDs from your database!');
  console.log('Current test data:', TEST_DATA);
  console.log('\nStarting tests in 3 seconds...\n');
  
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  try {
    await testTrainingLog();
    await testMatchResult();
    
    console.log('\n================================');
    console.log('✅ All API tests completed!');
    console.log('================================');
    console.log('\nNext steps:');
    console.log('1. Check Railway database to verify data was written');
    console.log('2. Verify training_sessions and match_results tables have new records');
    console.log('3. If all looks good, proceed to Phase 3 (UI forms)');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    console.error('\nMake sure:');
    console.error('1. Your dev server is running (npm run dev)');
    console.error('2. You have updated TEST_DATA with real IDs');
    console.error('3. The specified events and players exist in your database');
  }
}

// Run tests
runTests();