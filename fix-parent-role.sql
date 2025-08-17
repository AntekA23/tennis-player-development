-- Fix specific case: user who is parent but was incorrectly set to coach
-- This user appears as "bantczak@gmail.com" in screenshot with role "parent" in UI
-- but "coach" in team_members table

-- Check current state
SELECT 
  tm.user_id,
  u.email,
  u.role as user_role,
  tm.role as team_role
FROM team_members tm
JOIN users u ON tm.user_id = u.id
WHERE u.email = 'bantczak@gmail.com';

-- Fix: Set team_members.role to match users.role for this specific parent
UPDATE team_members 
SET role = 'parent'
WHERE user_id = (
  SELECT id FROM users WHERE email = 'bantczak@gmail.com' AND role = 'parent'
);

-- Verify fix
SELECT 
  tm.user_id,
  u.email,
  u.role as user_role,
  tm.role as team_role
FROM team_members tm
JOIN users u ON tm.user_id = u.id
WHERE u.email = 'bantczak@gmail.com';