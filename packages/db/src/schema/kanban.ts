import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

import { organization, user } from "./auth";

export const kanbanBoard = pgTable(
  "kanban_board",
  {
    id: serial("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    createdBy: text("created_by")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    color: text("color"),
    isArchived: boolean("is_archived").notNull().default(false),
    config: jsonb("config"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("kanban_board_org_id_idx").on(table.organizationId),
    index("kanban_board_created_by_idx").on(table.createdBy),
  ],
);

export const kanbanColumn = pgTable(
  "kanban_column",
  {
    id: serial("id").primaryKey(),
    boardId: integer("board_id")
      .notNull()
      .references(() => kanbanBoard.id, { onDelete: "cascade" }),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    color: text("color"),
    position: integer("position").notNull().default(0),
    wipLimit: integer("wip_limit"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("kanban_column_board_id_idx").on(table.boardId),
    index("kanban_column_org_id_idx").on(table.organizationId),
  ],
);

export const kanbanCard = pgTable(
  "kanban_card",
  {
    id: serial("id").primaryKey(),
    columnId: integer("column_id")
      .notNull()
      .references(() => kanbanColumn.id, { onDelete: "cascade" }),
    boardId: integer("board_id")
      .notNull()
      .references(() => kanbanBoard.id, { onDelete: "cascade" }),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    createdBy: text("created_by")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    assigneeId: text("assignee_id").references(() => user.id, { onDelete: "set null" }),
    title: text("title").notNull(),
    description: text("description"),
    priority: text("priority").notNull().default("none"),
    storyPoints: integer("story_points"),
    dueDate: timestamp("due_date"),
    position: integer("position").notNull().default(0),
    isArchived: boolean("is_archived").notNull().default(false),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("kanban_card_column_id_idx").on(table.columnId),
    index("kanban_card_board_id_idx").on(table.boardId),
    index("kanban_card_org_id_idx").on(table.organizationId),
    index("kanban_card_assignee_id_idx").on(table.assigneeId),
    index("kanban_card_position_idx").on(table.columnId, table.position),
  ],
);
