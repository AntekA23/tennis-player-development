// Test Phase 2 APIs directly in browser console
// Run this in DevTools console while on your Railway app

// Test Training Log API
async function testTrainingLog() {
  console.log('Testing Training Log API...');
  
  const response = await fetch('/api/events/3/training-log', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      player_id: 4,
      attendance_status: 'present',
      performance_rating: 8,
      notes: 'Testing from console'
    })
  });
  
  const data = await response.json();
  console.log('Status:', response.status);
  console.log('Response:', data);
  return data;
}

// Test Match Result API
async function testMatchResult() {
  console.log('Testing Match Result API...');
  
  const response = await fetch('/api/events/7/match-result', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      winner_id: 1,
      score_text: '6-4 6-2',
      notes: 'Test match from console'
    })
  });
  
  const data = await response.json();
  console.log('Status:', response.status);
  console.log('Response:', data);
  return data;
}

// Run tests
console.log('=== PHASE 2 API TESTS ===');
console.log('Make sure you are logged in!');
console.log('Run: testTrainingLog() to test training logs');
console.log('Run: testMatchResult() to test match results');