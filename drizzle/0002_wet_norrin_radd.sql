ALTER TABLE "teams" ADD COLUMN "invite_code" varchar(32) NOT NULL;--> statement-breakpoint
ALTER TABLE "teams" ADD CONSTRAINT "teams_invite_code_unique" UNIQUE("invite_code");