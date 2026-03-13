ALTER TABLE "time_entry" ADD COLUMN "task_id" integer;--> statement-breakpoint
ALTER TABLE "time_entry" ADD CONSTRAINT "time_entry_task_id_task_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."task"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "time_entry_task_id_idx" ON "time_entry" USING btree ("task_id");