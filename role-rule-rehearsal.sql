-- Role-rule rehearsal (expect 0 rows)
-- This query identifies participants that violate activity type role rules
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
  (e.etype='education'                       AND ep.role IN ('parent','player')) OR
  (e.etype IN ('practice','gym')             AND ep.role IN ('player','coach'))  OR
  (e.etype IN ('match','sparring_request')  AND ep.role='player')                OR
  (e.etype='tournament'                      AND ep.role IN ('parent','player','coach'))
);