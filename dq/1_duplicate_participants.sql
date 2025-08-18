-- DQ-1: Find duplicate event participants
-- Should return 0 rows after PR-DB1 constraint is applied

SELECT 
  event_id,
  user_id,
  COUNT(*) as duplicate_count,
  string_agg(role, ', ') as roles
FROM event_participants
GROUP BY event_id, user_id
HAVING COUNT(*) > 1
ORDER BY event_id, user_id;