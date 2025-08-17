-- Fix sparring event to have 2 different players
-- Event 7 needs exactly 2 different players for match result API

-- First, check what we have
SELECT * FROM event_participants WHERE event_id = 7;

-- Remove duplicates, keeping only the first one
DELETE FROM event_participants 
WHERE event_id = 7 
AND user_id = 2 
AND id > (
  SELECT MIN(id) 
  FROM (SELECT id FROM event_participants WHERE event_id = 7 AND user_id = 2) AS subquery
);

-- Add a second different player (user 4)
INSERT INTO event_participants (event_id, user_id, role, status, created_at, updated_at)
VALUES (7, 4, 'player', 'confirmed', NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Verify we now have exactly 2 different players
SELECT 
  ep.*, 
  u.email,
  ce.title as event_title
FROM event_participants ep
JOIN users u ON u.id = ep.user_id
JOIN calendar_events ce ON ce.id = ep.event_id
WHERE ep.event_id = 7
AND ep.role = 'player';