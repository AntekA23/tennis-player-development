-- Fix event_participants roles to match team_members roles
-- Run this in Railway console as a single transaction

BEGIN;

-- 1) Preview mismatches (what you already ran)
SELECT e.id AS event_id, ep.user_id, ep.role AS ep_role, tm.role AS tm_role
FROM event_participants ep
JOIN calendar_events e ON e.id = ep.event_id
JOIN team_members tm ON tm.team_id = e.team_id AND tm.user_id = ep.user_id
WHERE ep.role <> tm.role
ORDER BY e.id, ep.user_id;

-- 2) Correct roles in event_participants to match team_members
UPDATE event_participants ep
SET role = tm.role
FROM calendar_events e
JOIN team_members tm ON tm.team_id = e.team_id   -- no ep.* inside ON
WHERE ep.event_id = e.id
  AND tm.user_id = ep.user_id
  AND ep.role <> tm.role;

-- 3) Verify (should return 0 rows)
SELECT e.id AS event_id, ep.user_id, ep.role AS ep_role, tm.role AS tm_role
FROM event_participants ep
JOIN calendar_events e ON e.id = ep.event_id
JOIN team_members tm ON tm.team_id = e.team_id AND tm.user_id = ep.user_id
WHERE ep.role <> tm.role;

COMMIT;