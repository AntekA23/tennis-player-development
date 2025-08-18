-- DQ-3: Find orphaned event participants (not in team_members)
-- Should return 0 rows if participant validation is working correctly

SELECT 
  e.id AS event_id,
  e.title,
  e.team_id,
  ep.user_id,
  ep.role AS participant_role,
  'ORPHANED' as status
FROM event_participants ep
JOIN calendar_events e ON e.id = ep.event_id
LEFT JOIN team_members tm ON tm.team_id = e.team_id AND tm.user_id = ep.user_id
WHERE tm.user_id IS NULL
ORDER BY e.id, ep.user_id;