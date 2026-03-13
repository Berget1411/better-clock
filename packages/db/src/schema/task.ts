import { index, integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

import { organization, user } from "./auth";
import { trackerProject } from "./time-tracker";

export const task = pgTable(
  "task",
  {
    id: serial("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    projectId: integer("project_id").references(() => trackerProject.id, {
      onDelete: "set null",
    }),
    createdByUserId: text("created_by_user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description"),
    type: text("type").notNull().default("feature"),
    status: text("status").notNull().default("backlog"),
    priority: text("priority").notNull().default("medium"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("task_org_id_idx").on(table.organizationId),
    index("task_project_id_idx").on(table.projectId),
    index("task_org_status_idx").on(table.organizationId, table.status),
    index("task_org_priority_idx").on(table.organizationId, table.priority),
  ],
);
