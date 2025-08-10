ALTER TYPE "public"."activity_type" ADD VALUE 'sparring_request';--> statement-breakpoint
ALTER TABLE "calendar_events" ADD COLUMN "request_status" varchar(32) DEFAULT 'confirmed';--> statement-breakpoint
ALTER TABLE "calendar_events" ADD COLUMN "approved_by" integer;--> statement-breakpoint
ALTER TABLE "calendar_events" ADD CONSTRAINT "calendar_events_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;