ALTER TABLE "tracker_project" ADD COLUMN "client_id" integer;--> statement-breakpoint
ALTER TABLE "tracker_project" ADD COLUMN "color" text;--> statement-breakpoint
ALTER TABLE "tracker_project" ADD COLUMN "hourly_rate" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "tracker_project" ADD COLUMN "is_archived" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "tracker_project" ADD COLUMN "access" text DEFAULT 'public' NOT NULL;--> statement-breakpoint
ALTER TABLE "tracker_project" ADD CONSTRAINT "tracker_project_client_id_client_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."client"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "tracker_project_client_id_idx" ON "tracker_project" USING btree ("client_id");