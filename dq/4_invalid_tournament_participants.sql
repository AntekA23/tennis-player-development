-- DQ-4: Find tournaments without any player participants
-- Should highlight tournaments that may violate player guarantee

SELECT 
  e.id AS event_id,
  e.title,
  e.activity_type,
  e.tournament_scope,
  COUNT(ep.user_id) as total_participants,
  COUNT(CASE WHEN tm.role = 'player' THEN 1 END) as player_count,
  CASE 
    WHEN COUNT(CASE WHEN tm.role = 'player' THEN 1 END) = 0 THEN 'NO_PLAYERS'
    ELSE 'OK'
  END as status
FROM calendar_events e
LEFT JOIN event_participants ep ON ep.event_id = e.id
LEFT JOIN team_members tm ON tm.team_id = e.team_id AND tm.user_id = ep.user_id
WHERE e.activity_type = 'tournament'
GROUP BY e.id, e.title, e.activity_type, e.tournament_scope
HAVING COUNT(CASE WHEN tm.role = 'player' THEN 1 END) = 0
ORDER BY e.id;