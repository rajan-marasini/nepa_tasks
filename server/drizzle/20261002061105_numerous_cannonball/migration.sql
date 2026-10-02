CREATE TABLE "events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" varchar(255) NOT NULL,
	"event_type" varchar(100) NOT NULL,
	"payload" text NOT NULL,
	"timestamp" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "events_event_type_idx" ON "events" ("event_type");--> statement-breakpoint
CREATE INDEX "events_timestamp_idx" ON "events" ("timestamp");--> statement-breakpoint
CREATE INDEX "events_user_id_idx" ON "events" ("user_id");