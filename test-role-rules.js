// Test role-rule rehearsal against Railway database
// Run: node test-role-rules.js

const fs = require('fs');

const sqlQuery = fs.readFileSync('./role-rule-rehearsal.sql', 'utf8');

console.log('=== Role-Rule Rehearsal Query ===');
console.log(sqlQuery);
console.log('\n=== Instructions ===');
console.log('1. Copy the SQL query above');
console.log('2. Go to Railway Console for tennis-player-development-production');
console.log('3. Navigate to Database tab');
console.log('4. Run the query in the SQL console');
console.log('5. Screenshot the results');
console.log('6. Expected: 0 rows (no violations)');
console.log('7. If violations found, document them before proceeding');

// For local testing, you could also run:
console.log('\n=== Alternative: Test via API ===');
console.log('Or run this in browser console on Railway app:');
console.log(`
fetch('/api/debug/role-violations', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({query: 'role-rule-rehearsal'})
}).then(r => r.json()).then(console.log);
`);