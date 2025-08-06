-- Add invite_code column as nullable first
ALTER TABLE teams ADD COLUMN invite_code VARCHAR(32);

-- Add invite code to existing team
UPDATE teams SET invite_code = 'TEAM582941' WHERE id = 1 AND name = 'Sonia Team';

-- Now add unique constraint
ALTER TABLE teams ADD CONSTRAINT teams_invite_code_unique UNIQUE (invite_code);