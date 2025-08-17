-- Fix the role field for event 7 participant
-- Row 9 has "Pawel Lewit" in the role field, should be "player"

-- Update the incorrect role
UPDATE event_participants 
SET role = 'player'
WHERE id = 9 AND event_id = 7;

-- Now add user 4 as the second player for sparring
INSERT INTO event_participants (event_id, user_id, role, status, created_at, updated_at)
VALUES (7, 4, 'player', 'confirmed', NOW(), NOW());

-- Verify we now have 2 players with correct roles
SELECT 
  ep.id,
  ep.event_id,
  ep.user_id,
  ep.role,
  u.email,
  ce.title as event_title
FROM event_participants ep
JOIN users u ON u.id = ep.user_id
JOIN calendar_events ce ON ce.id = ep.event_id
WHERE ep.event_id = 7;