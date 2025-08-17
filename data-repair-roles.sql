-- One-off SQL data repair for team_members.role values
-- Run this in Railway Console Database tab

-- 1) Snapshot what's wrong (save a screenshot):
-- How many legacy roles exist?
SELECT tm.role AS tm_role, u.role AS users_role, COUNT(*) AS cnt
FROM team_members tm
JOIN users u ON u.id = tm.user_id
GROUP BY tm.role, u.role
ORDER BY 1,2;

-- 2) Update team member roles from users.role:
BEGIN;

-- Normalize legacy values by copying the real role from users.role
UPDATE team_members tm
SET role = u.role
FROM users u
WHERE tm.user_id = u.id
  AND tm.role IN ('member','creator')
  AND u.role IN ('player','coach','parent');

COMMIT;

-- 3) Assert no legacy values remain (expect 0 rows):
SELECT *
FROM team_members
WHERE role NOT IN ('player','coach','parent');

-- 4) Re-run the role-rule rehearsal (expect 0 rows or only real violations):
WITH e AS (
  SELECT id, activity_type::text AS etype
  FROM calendar_events
),
ep AS (
  SELECT ep.event_id, ep.user_id, tm.role
  FROM event_participants ep
  JOIN team_members tm ON tm.user_id = ep.user_id
)
SELECT e.id, e.etype, ep.user_id, ep.role
FROM e JOIN ep ON ep.event_id=e.id
WHERE NOT (
  (e.etype='education'                 AND ep.role IN ('parent','player')) OR
  (e.etype IN ('practice','gym')       AND ep.role IN ('player','coach'))  OR
  (e.etype IN ('match','sparring_request') AND ep.role='player')           OR
  (e.etype='tournament'                AND ep.role IN ('parent','player','coach'))
);