// Test script for calendar API endpoints
// Run with: npx tsx scripts/test-calendar-api.ts

async function testCalendarAPI() {
  const baseUrl = 'http://localhost:3000'; // Change to your Railway URL if testing production
  
  // You'll need valid cookies from a logged-in session
  // Get these from your browser's DevTools after logging in
  const cookies = {
    userId: 'YOUR_USER_ID',
    teamId: 'YOUR_TEAM_ID'
  };

  console.log('🧪 Testing Calendar API Endpoints\n');

  // Test 1: GET events (should be empty initially)
  console.log('1. Testing GET /api/calendar/events');
  try {
    const getResponse = await fetch(`${baseUrl}/api/calendar/events`, {
      headers: {
        'Cookie': `userId=${cookies.userId}; teamId=${cookies.teamId}`
      }
    });
    const getData = await getResponse.json();
    console.log('   ✅ GET Response:', getData);
  } catch (error) {
    console.log('   ❌ GET Error:', error);
  }

  // Test 2: POST new event
  console.log('\n2. Testing POST /api/calendar/events');
  const newEvent = {
    title: 'Team Practice',
    description: 'Regular weekly practice session',
    activity_type: 'practice',
    start_time: new Date('2025-01-10T10:00:00Z').toISOString(),
    end_time: new Date('2025-01-10T12:00:00Z').toISOString(),
    location: 'Main Tennis Court'
  };

  try {
    const postResponse = await fetch(`${baseUrl}/api/calendar/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `userId=${cookies.userId}; teamId=${cookies.teamId}`
      },
      body: JSON.stringify(newEvent)
    });
    const postData = await postResponse.json();
    console.log('   ✅ POST Response:', postData);
    
    if (postData.event?.id) {
      // Test 3: PUT update event
      console.log('\n3. Testing PUT /api/calendar/events/' + postData.event.id);
      const updateData = {
        title: 'Updated Team Practice',
        location: 'Court 2'
      };
      
      try {
        const putResponse = await fetch(`${baseUrl}/api/calendar/events/${postData.event.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Cookie': `userId=${cookies.userId}; teamId=${cookies.teamId}`
          },
          body: JSON.stringify(updateData)
        });
        const putData = await putResponse.json();
        console.log('   ✅ PUT Response:', putData);
      } catch (error) {
        console.log('   ❌ PUT Error:', error);
      }

      // Test 4: DELETE event
      console.log('\n4. Testing DELETE /api/calendar/events/' + postData.event.id);
      try {
        const deleteResponse = await fetch(`${baseUrl}/api/calendar/events/${postData.event.id}`, {
          method: 'DELETE',
          headers: {
            'Cookie': `userId=${cookies.userId}; teamId=${cookies.teamId}`
          }
        });
        const deleteData = await deleteResponse.json();
        console.log('   ✅ DELETE Response:', deleteData);
      } catch (error) {
        console.log('   ❌ DELETE Error:', error);
      }
    }
  } catch (error) {
    console.log('   ❌ POST Error:', error);
  }

  console.log('\n✅ API Testing Complete!');
  console.log('\nTo test on production:');
  console.log('1. Log into your Railway app');
  console.log('2. Get userId and teamId cookies from browser DevTools');
  console.log('3. Update the cookies object in this script');
  console.log('4. Change baseUrl to your Railway URL');
  console.log('5. Run: npx tsx scripts/test-calendar-api.ts');
}

testCalendarAPI().catch(console.error);