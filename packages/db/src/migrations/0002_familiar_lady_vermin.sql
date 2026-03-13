CREATE TABLE "task" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"project_id" integer,
	"created_by_user_id" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"type" text DEFAULT 'feature' NOT NULL,
	"status" text DEFAULT 'backlog' NOT NULL,
	"priority" text DEFAULT 'medium' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "task" ADD CONSTRAINT "task_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task" ADD CONSTRAINT "task_project_id_tracker_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."tracker_project"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task" ADD CONSTRAINT "task_created_by_user_id_user_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "task_org_id_idx" ON "task" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "task_project_id_idx" ON "task" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "task_org_status_idx" ON "task" USING btree ("organization_id","status");--> statement-breakpoint
CREATE INDEX "task_org_priority_idx" ON "task" USING btree ("organization_id","priority");