-- Run these queries ONE AT A TIME in TablePlus

-- 1. First, fix the role for row id=9
UPDATE event_participants 
SET role = 'player'
WHERE id = 9;

-- 2. Check if user 4 is already in event 7
SELECT * FROM event_participants WHERE event_id = 7 AND user_id = 4;

-- 3. If user 4 is NOT in event 7, add them:
INSERT INTO event_participants (event_id, user_id, role, status) 
VALUES (7, 4, 'player', 'confirmed');

-- 4. Verify final state - should have 2 different players
SELECT * FROM event_participants WHERE event_id = 7 AND role = 'player';