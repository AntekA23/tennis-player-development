CREATE TABLE "match_results" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_id" integer NOT NULL,
	"player1_id" integer NOT NULL,
	"player2_id" integer NOT NULL,
	"winner_id" integer,
	"score_text" varchar(255) NOT NULL,
	"notes" text,
	"logged_by" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "training_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_id" integer NOT NULL,
	"player_id" integer NOT NULL,
	"attendance_status" varchar(32) NOT NULL,
	"performance_rating" integer,
	"notes" text,
	"logged_by" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "event_participants" ADD COLUMN "role" varchar(32) DEFAULT 'player' NOT NULL;--> statement-breakpoint
ALTER TABLE "event_participants" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "match_results" ADD CONSTRAINT "match_results_event_id_calendar_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."calendar_events"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "match_results" ADD CONSTRAINT "match_results_player1_id_users_id_fk" FOREIGN KEY ("player1_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "match_results" ADD CONSTRAINT "match_results_player2_id_users_id_fk" FOREIGN KEY ("player2_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "match_results" ADD CONSTRAINT "match_results_winner_id_users_id_fk" FOREIGN KEY ("winner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "match_results" ADD CONSTRAINT "match_results_logged_by_users_id_fk" FOREIGN KEY ("logged_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "training_sessions" ADD CONSTRAINT "training_sessions_event_id_calendar_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."calendar_events"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "training_sessions" ADD CONSTRAINT "training_sessions_player_id_users_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "training_sessions" ADD CONSTRAINT "training_sessions_logged_by_users_id_fk" FOREIGN KEY ("logged_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE VIEW "public"."player_basic_stats" AS (
  SELECT 
    player_id,
    COUNT(*) as total_matches,
    COUNT(CASE WHEN winner_id = player_id THEN 1 END) as wins,
    ROUND(
      COUNT(CASE WHEN winner_id = player_id THEN 1 END)::numeric / 
      NULLIF(COUNT(*), 0) * 100
    )::integer as win_rate,
    MAX(start_time) as last_match_date
  FROM (
    SELECT player1_id as player_id, winner_id, start_time FROM match_results mr 
    JOIN calendar_events ce ON mr.event_id = ce.id
    UNION ALL
    SELECT player2_id as player_id, winner_id, start_time FROM match_results mr 
    JOIN calendar_events ce ON mr.event_id = ce.id
  ) player_matches
  GROUP BY player_id
);