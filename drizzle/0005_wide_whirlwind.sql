ALTER TABLE "calendar_events" ADD COLUMN "is_recurring" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "calendar_events" ADD COLUMN "recurrence_pattern" varchar(32);--> statement-breakpoint
ALTER TABLE "calendar_events" ADD COLUMN "original_event_id" integer;