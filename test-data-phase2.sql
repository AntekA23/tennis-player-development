-- Phase 2 API Testing: Add Minimal Participant Data
-- Run this in TablePlus on your Railway database
-- Adjust user IDs based on your actual users table

-- First, let's check what users exist
SELECT id, email, role FROM users;

-- Check what events we have
SELECT id, title, activity_type FROM calendar_events 
WHERE activity_type IN ('practice', 'gym', 'education', 'match', 'sparring_request');

-- Add participants to enable API testing
-- IMPORTANT: Update these IDs based on the results above!

-- Example for practice event (ID 1) - add player
INSERT INTO event_participants (event_id, user_id, role, status, created_at, updated_at) 
VALUES (1, 2, 'player', 'confirmed', NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Example for sparring event (ID 5) - need exactly 2 players
INSERT INTO event_participants (event_id, user_id, role, status, created_at, updated_at) 
VALUES 
  (5, 2, 'player', 'confirmed', NOW(), NOW()),  -- First player (e.g., Sonia)
  (5, 1, 'player', 'confirmed', NOW(), NOW())   -- Second player (e.g., Coach as player)
ON CONFLICT DO NOTHING;

-- Verify participants were added
SELECT 
  ep.*, 
  u.email,
  ce.title as event_title,
  ce.activity_type
FROM event_participants ep
JOIN users u ON u.id = ep.user_id
JOIN calendar_events ce ON ce.id = ep.event_id
WHERE ep.role = 'player'
ORDER BY ep.event_id;