-- Migration: Add UNIQUE constraint on event_participants (event_id, user_id)
-- Generated: 2025-01-18
-- Purpose: Prevent duplicate event participants

BEGIN;

-- Add unique constraint to prevent duplicate participants
ALTER TABLE event_participants 
ADD CONSTRAINT event_participants_event_user_unique 
UNIQUE (event_id, user_id);

COMMIT;