import { and, asc, eq } from "drizzle-orm";

import { db } from "../client";
import { kanbanBoard, kanbanCard, kanbanColumn } from "../schema/kanban";

export const kanbanRepository = {
  // ─── Boards ──────────────────────────────────────────────────────────────

  async listBoards(organizationId: string) {
    return db
      .select()
      .from(kanbanBoard)
      .where(and(eq(kanbanBoard.organizationId, organizationId), eq(kanbanBoard.isArchived, false)))
      .orderBy(asc(kanbanBoard.createdAt));
  },

  async getBoardById(organizationId: string, boardId: number) {
    const rows = await db
      .select()
      .from(kanbanBoard)
      .where(and(eq(kanbanBoard.organizationId, organizationId), eq(kanbanBoard.id, boardId)))
      .limit(1);
    return rows[0] ?? null;
  },

  async createBoard(
    organizationId: string,
    createdBy: string,
    input: {
      name: string;
      description?: string | null;
      color?: string | null;
      config?: Record<string, unknown> | null;
    },
  ) {
    const rows = await db
      .insert(kanbanBoard)
      .values({
        organizationId,
        createdBy,
        name: input.name.trim(),
        description: input.description ?? null,
        color: input.color ?? null,
        config: input.config ?? null,
      })
      .returning();
    return rows[0]!;
  },

  async updateBoard(
    organizationId: string,
    boardId: number,
    input: {
      name?: string;
      description?: string | null;
      color?: string | null;
      isArchived?: boolean;
      config?: Record<string, unknown> | null;
    },
  ) {
    const patch: Partial<typeof kanbanBoard.$inferInsert> = {};
    if (input.name !== undefined) patch.name = input.name.trim();
    if (input.description !== undefined) patch.description = input.description;
    if (input.color !== undefined) patch.color = input.color;
    if (input.isArchived !== undefined) patch.isArchived = input.isArchived;
    if (input.config !== undefined) patch.config = input.config;

    const rows = await db
      .update(kanbanBoard)
      .set(patch)
      .where(and(eq(kanbanBoard.organizationId, organizationId), eq(kanbanBoard.id, boardId)))
      .returning();
    return rows[0] ?? null;
  },

  async deleteBoard(organizationId: string, boardId: number) {
    const rows = await db
      .delete(kanbanBoard)
      .where(and(eq(kanbanBoard.organizationId, organizationId), eq(kanbanBoard.id, boardId)))
      .returning({ id: kanbanBoard.id });
    return rows[0] ?? null;
  },

  // ─── Columns ─────────────────────────────────────────────────────────────

  async listColumns(organizationId: string, boardId: number) {
    return db
      .select()
      .from(kanbanColumn)
      .where(
        and(eq(kanbanColumn.organizationId, organizationId), eq(kanbanColumn.boardId, boardId)),
      )
      .orderBy(asc(kanbanColumn.position), asc(kanbanColumn.createdAt));
  },

  async getColumnById(organizationId: string, columnId: number) {
    const rows = await db
      .select()
      .from(kanbanColumn)
      .where(and(eq(kanbanColumn.organizationId, organizationId), eq(kanbanColumn.id, columnId)))
      .limit(1);
    return rows[0] ?? null;
  },

  async createColumn(
    organizationId: string,
    input: {
      boardId: number;
      name: string;
      color?: string | null;
      position: number;
      wipLimit?: number | null;
    },
  ) {
    const rows = await db
      .insert(kanbanColumn)
      .values({
        organizationId,
        boardId: input.boardId,
        name: input.name.trim(),
        color: input.color ?? null,
        position: input.position,
        wipLimit: input.wipLimit ?? null,
      })
      .returning();
    return rows[0]!;
  },

  async updateColumn(
    organizationId: string,
    columnId: number,
    input: {
      name?: string;
      color?: string | null;
      position?: number;
      wipLimit?: number | null;
    },
  ) {
    const patch: Partial<typeof kanbanColumn.$inferInsert> = {};
    if (input.name !== undefined) patch.name = input.name.trim();
    if (input.color !== undefined) patch.color = input.color;
    if (input.position !== undefined) patch.position = input.position;
    if (input.wipLimit !== undefined) patch.wipLimit = input.wipLimit;

    const rows = await db
      .update(kanbanColumn)
      .set(patch)
      .where(and(eq(kanbanColumn.organizationId, organizationId), eq(kanbanColumn.id, columnId)))
      .returning();
    return rows[0] ?? null;
  },

  async deleteColumn(organizationId: string, columnId: number) {
    const rows = await db
      .delete(kanbanColumn)
      .where(and(eq(kanbanColumn.organizationId, organizationId), eq(kanbanColumn.id, columnId)))
      .returning({ id: kanbanColumn.id });
    return rows[0] ?? null;
  },

  async reorderColumns(organizationId: string, updates: Array<{ id: number; position: number }>) {
    await Promise.all(
      updates.map(({ id, position }) =>
        db
          .update(kanbanColumn)
          .set({ position })
          .where(and(eq(kanbanColumn.organizationId, organizationId), eq(kanbanColumn.id, id))),
      ),
    );
  },

  // ─── Cards ────────────────────────────────────────────────────────────────

  async listCards(organizationId: string, boardId: number) {
    return db
      .select()
      .from(kanbanCard)
      .where(
        and(
          eq(kanbanCard.organizationId, organizationId),
          eq(kanbanCard.boardId, boardId),
          eq(kanbanCard.isArchived, false),
        ),
      )
      .orderBy(asc(kanbanCard.columnId), asc(kanbanCard.position));
  },

  async getCardById(organizationId: string, cardId: number) {
    const rows = await db
      .select()
      .from(kanbanCard)
      .where(and(eq(kanbanCard.organizationId, organizationId), eq(kanbanCard.id, cardId)))
      .limit(1);
    return rows[0] ?? null;
  },

  async createCard(
    organizationId: string,
    createdBy: string,
    input: {
      boardId: number;
      columnId: number;
      title: string;
      description?: string | null;
      priority?: string | null;
      storyPoints?: number | null;
      dueDate?: Date | null;
      assigneeId?: string | null;
      position: number;
      metadata?: Record<string, unknown> | null;
    },
  ) {
    const rows = await db
      .insert(kanbanCard)
      .values({
        organizationId,
        boardId: input.boardId,
        columnId: input.columnId,
        createdBy,
        title: input.title.trim(),
        description: input.description ?? null,
        priority: input.priority ?? "none",
        storyPoints: input.storyPoints ?? null,
        dueDate: input.dueDate ?? null,
        assigneeId: input.assigneeId ?? null,
        position: input.position,
        metadata: input.metadata ?? null,
      })
      .returning();
    return rows[0]!;
  },

  async updateCard(
    organizationId: string,
    cardId: number,
    input: {
      title?: string;
      description?: string | null;
      priority?: string;
      storyPoints?: number | null;
      dueDate?: Date | null;
      assigneeId?: string | null;
      isArchived?: boolean;
      metadata?: Record<string, unknown> | null;
    },
  ) {
    const patch: Partial<typeof kanbanCard.$inferInsert> = {};
    if (input.title !== undefined) patch.title = input.title.trim();
    if (input.description !== undefined) patch.description = input.description;
    if (input.priority !== undefined) patch.priority = input.priority;
    if (input.storyPoints !== undefined) patch.storyPoints = input.storyPoints;
    if (input.dueDate !== undefined) patch.dueDate = input.dueDate;
    if (input.assigneeId !== undefined) patch.assigneeId = input.assigneeId;
    if (input.isArchived !== undefined) patch.isArchived = input.isArchived;
    if (input.metadata !== undefined) patch.metadata = input.metadata;

    const rows = await db
      .update(kanbanCard)
      .set(patch)
      .where(and(eq(kanbanCard.organizationId, organizationId), eq(kanbanCard.id, cardId)))
      .returning();
    return rows[0] ?? null;
  },

  async moveCard(
    organizationId: string,
    cardId: number,
    targetColumnId: number,
    newPosition: number,
  ) {
    const rows = await db
      .update(kanbanCard)
      .set({ columnId: targetColumnId, position: newPosition })
      .where(and(eq(kanbanCard.organizationId, organizationId), eq(kanbanCard.id, cardId)))
      .returning();
    return rows[0] ?? null;
  },

  async reorderCards(
    organizationId: string,
    updates: Array<{ id: number; columnId: number; position: number }>,
  ) {
    await Promise.all(
      updates.map(({ id, columnId, position }) =>
        db
          .update(kanbanCard)
          .set({ columnId, position })
          .where(and(eq(kanbanCard.organizationId, organizationId), eq(kanbanCard.id, id))),
      ),
    );
  },

  async deleteCard(organizationId: string, cardId: number) {
    const rows = await db
      .delete(kanbanCard)
      .where(and(eq(kanbanCard.organizationId, organizationId), eq(kanbanCard.id, cardId)))
      .returning({ id: kanbanCard.id });
    return rows[0] ?? null;
  },

  async countCardsInColumn(organizationId: string, columnId: number) {
    const rows = await db
      .select({ id: kanbanCard.id })
      .from(kanbanCard)
      .where(
        and(
          eq(kanbanCard.organizationId, organizationId),
          eq(kanbanCard.columnId, columnId),
          eq(kanbanCard.isArchived, false),
        ),
      );
    return rows.length;
  },
};
