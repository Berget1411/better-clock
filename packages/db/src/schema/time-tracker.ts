import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

import { organization, user } from "./auth";

export const trackerProject = pgTable(
  "tracker_project",
  {
    id: serial("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("tracker_project_org_id_idx").on(table.organizationId),
    index("tracker_project_user_id_idx").on(table.userId),
  ],
);

export const trackerTag = pgTable(
  "tracker_tag",
  {
    id: serial("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("tracker_tag_org_id_idx").on(table.organizationId),
    index("tracker_tag_user_id_idx").on(table.userId),
  ],
);

export const timeEntry = pgTable(
  "time_entry",
  {
    id: serial("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    description: text("description").notNull(),
    projectId: integer("project_id").references(() => trackerProject.id, { onDelete: "set null" }),
    isBillable: boolean("is_billable").default(false).notNull(),
    startAt: timestamp("start_at").notNull(),
    endAt: timestamp("end_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("time_entry_org_id_idx").on(table.organizationId),
    index("time_entry_user_id_idx").on(table.userId),
    index("time_entry_project_id_idx").on(table.projectId),
    index("time_entry_start_at_idx").on(table.startAt),
    uniqueIndex("time_entry_active_org_user_idx")
      .on(table.organizationId, table.userId)
      .where(sql`${table.endAt} is null`),
  ],
);

export const timeEntryTag = pgTable(
  "time_entry_tag",
  {
    timeEntryId: integer("time_entry_id")
      .notNull()
      .references(() => timeEntry.id, { onDelete: "cascade" }),
    tagId: integer("tag_id")
      .notNull()
      .references(() => trackerTag.id, { onDelete: "cascade" }),
  },
  (table) => [
    primaryKey({ columns: [table.timeEntryId, table.tagId] }),
    index("time_entry_tag_entry_idx").on(table.timeEntryId),
    index("time_entry_tag_tag_idx").on(table.tagId),
  ],
);
