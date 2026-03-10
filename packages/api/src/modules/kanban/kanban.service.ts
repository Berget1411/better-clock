import { TRPCError } from "@trpc/server";

import { kanbanRepository } from "@open-learn/db";
import type {
  CreateBoardInput,
  CreateCardInput,
  CreateColumnInput,
  DeleteBoardInput,
  DeleteCardInput,
  DeleteColumnInput,
  GetBoardInput,
  KanbanBoardFull,
  MoveCardInput,
  ReorderCardsInput,
  ReorderColumnsInput,
  UpdateBoardInput,
  UpdateCardInput,
  UpdateColumnInput,
} from "./kanban.schema";

export const kanbanService = {
  // ─── Boards ──────────────────────────────────────────────────────────────

  async listBoards(organizationId: string) {
    return kanbanRepository.listBoards(organizationId);
  },

  async getBoardFull(organizationId: string, input: GetBoardInput): Promise<KanbanBoardFull> {
    const board = await kanbanRepository.getBoardById(organizationId, input.id);
    if (!board) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Board not found." });
    }

    const [columns, cards] = await Promise.all([
      kanbanRepository.listColumns(organizationId, board.id),
      kanbanRepository.listCards(organizationId, board.id),
    ]);

    const cardsByColumn = new Map<number, typeof cards>();
    for (const card of cards) {
      const list = cardsByColumn.get(card.columnId) ?? [];
      list.push(card);
      cardsByColumn.set(card.columnId, list);
    }

    return {
      ...board,
      config: (board.config as Record<string, unknown>) ?? null,
      columns: columns.map((col) => ({
        ...col,
        cards: (cardsByColumn.get(col.id) ?? []).map((c) => ({
          ...c,
          metadata: (c.metadata as Record<string, unknown>) ?? null,
        })),
      })),
    };
  },

  async createBoard(organizationId: string, userId: string, input: CreateBoardInput) {
    return kanbanRepository.createBoard(organizationId, userId, {
      name: input.name,
      description: input.description ?? null,
      color: input.color ?? null,
      config: (input.config as Record<string, unknown>) ?? null,
    });
  },

  async updateBoard(organizationId: string, input: UpdateBoardInput) {
    const board = await kanbanRepository.getBoardById(organizationId, input.id);
    if (!board) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Board not found." });
    }
    return kanbanRepository.updateBoard(organizationId, input.id, {
      name: input.name,
      description: input.description,
      color: input.color,
      isArchived: input.isArchived,
      config: input.config as Record<string, unknown> | undefined,
    });
  },

  async deleteBoard(organizationId: string, input: DeleteBoardInput) {
    const board = await kanbanRepository.getBoardById(organizationId, input.id);
    if (!board) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Board not found." });
    }
    return kanbanRepository.deleteBoard(organizationId, input.id);
  },

  // ─── Columns ─────────────────────────────────────────────────────────────

  async createColumn(organizationId: string, input: CreateColumnInput) {
    const board = await kanbanRepository.getBoardById(organizationId, input.boardId);
    if (!board) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Board not found." });
    }
    const existingColumns = await kanbanRepository.listColumns(organizationId, input.boardId);
    const position = existingColumns.length;

    return kanbanRepository.createColumn(organizationId, {
      boardId: input.boardId,
      name: input.name,
      color: input.color ?? null,
      position,
      wipLimit: input.wipLimit ?? null,
    });
  },

  async updateColumn(organizationId: string, input: UpdateColumnInput) {
    const column = await kanbanRepository.getColumnById(organizationId, input.id);
    if (!column) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Column not found." });
    }
    return kanbanRepository.updateColumn(organizationId, input.id, {
      name: input.name,
      color: input.color,
      wipLimit: input.wipLimit,
    });
  },

  async deleteColumn(organizationId: string, input: DeleteColumnInput) {
    const column = await kanbanRepository.getColumnById(organizationId, input.id);
    if (!column) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Column not found." });
    }
    return kanbanRepository.deleteColumn(organizationId, input.id);
  },

  async reorderColumns(organizationId: string, input: ReorderColumnsInput) {
    const board = await kanbanRepository.getBoardById(organizationId, input.boardId);
    if (!board) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Board not found." });
    }
    await kanbanRepository.reorderColumns(organizationId, input.updates);
    return { ok: true };
  },

  // ─── Cards ────────────────────────────────────────────────────────────────

  async createCard(organizationId: string, userId: string, input: CreateCardInput) {
    const column = await kanbanRepository.getColumnById(organizationId, input.columnId);
    if (!column) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Column not found." });
    }
    const cardsInColumn = await kanbanRepository.countCardsInColumn(organizationId, input.columnId);

    return kanbanRepository.createCard(organizationId, userId, {
      boardId: input.boardId,
      columnId: input.columnId,
      title: input.title,
      description: input.description ?? null,
      priority: input.priority ?? "none",
      storyPoints: input.storyPoints ?? null,
      dueDate: input.dueDate ?? null,
      assigneeId: input.assigneeId ?? null,
      position: cardsInColumn,
      metadata: (input.metadata as Record<string, unknown>) ?? null,
    });
  },

  async updateCard(organizationId: string, input: UpdateCardInput) {
    const card = await kanbanRepository.getCardById(organizationId, input.id);
    if (!card) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Card not found." });
    }
    return kanbanRepository.updateCard(organizationId, input.id, {
      title: input.title,
      description: input.description,
      priority: input.priority,
      storyPoints: input.storyPoints,
      dueDate: input.dueDate,
      assigneeId: input.assigneeId,
      isArchived: input.isArchived,
      metadata: input.metadata as Record<string, unknown> | undefined,
    });
  },

  async moveCard(organizationId: string, input: MoveCardInput) {
    const card = await kanbanRepository.getCardById(organizationId, input.cardId);
    if (!card) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Card not found." });
    }
    // Build position updates for the target column
    const updates = input.orderedCardIds.map((id, index) => ({
      id,
      columnId: input.targetColumnId,
      position: index,
    }));
    await kanbanRepository.reorderCards(organizationId, updates);
    return { ok: true };
  },

  async reorderCards(organizationId: string, input: ReorderCardsInput) {
    const updates = input.columns.flatMap(({ columnId, orderedCardIds }) =>
      orderedCardIds.map((id, index) => ({ id, columnId, position: index })),
    );
    await kanbanRepository.reorderCards(organizationId, updates);
    return { ok: true };
  },

  async deleteCard(organizationId: string, input: DeleteCardInput) {
    const card = await kanbanRepository.getCardById(organizationId, input.id);
    if (!card) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Card not found." });
    }
    return kanbanRepository.deleteCard(organizationId, input.id);
  },
};
