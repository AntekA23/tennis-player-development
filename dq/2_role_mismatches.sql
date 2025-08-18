-- DQ-2: Find role mismatches between event_participants and team_members
-- Should return 0 rows after role repair is complete

SELECT 
  e.id AS event_id,
  e.title,
  ep.user_id,
  ep.role AS participant_role,
  tm.role AS team_role,
  'MISMATCH' as status
FROM event_participants ep
JOIN calendar_events e ON e.id = ep.event_id
JOIN team_members tm ON tm.team_id = e.team_id AND tm.user_id = ep.user_id
WHERE ep.role <> tm.role
ORDER BY e.id, ep.user_id;