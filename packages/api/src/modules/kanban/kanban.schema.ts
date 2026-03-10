import z from "zod";

// ─── Board ────────────────────────────────────────────────────────────────────

export const createBoardInputSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).nullable().optional(),
  color: z.string().max(20).nullable().optional(),
  config: z.record(z.string(), z.unknown()).nullable().optional(),
});

export const updateBoardInputSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).nullable().optional(),
  color: z.string().max(20).nullable().optional(),
  isArchived: z.boolean().optional(),
  config: z.record(z.string(), z.unknown()).nullable().optional(),
});

export const deleteBoardInputSchema = z.object({
  id: z.number().int().positive(),
});

export const getBoardInputSchema = z.object({
  id: z.number().int().positive(),
});

// ─── Column ───────────────────────────────────────────────────────────────────

export const createColumnInputSchema = z.object({
  boardId: z.number().int().positive(),
  name: z.string().min(1).max(100),
  color: z.string().max(20).nullable().optional(),
  wipLimit: z.number().int().positive().nullable().optional(),
});

export const updateColumnInputSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1).max(100).optional(),
  color: z.string().max(20).nullable().optional(),
  wipLimit: z.number().int().positive().nullable().optional(),
});

export const deleteColumnInputSchema = z.object({
  id: z.number().int().positive(),
});

export const reorderColumnsInputSchema = z.object({
  boardId: z.number().int().positive(),
  updates: z.array(
    z.object({
      id: z.number().int().positive(),
      position: z.number().int().min(0),
    }),
  ),
});

// ─── Card ─────────────────────────────────────────────────────────────────────

export const CARD_PRIORITIES = ["none", "low", "medium", "high", "urgent"] as const;
export type CardPriority = (typeof CARD_PRIORITIES)[number];

export const createCardInputSchema = z.object({
  boardId: z.number().int().positive(),
  columnId: z.number().int().positive(),
  title: z.string().min(1).max(500),
  description: z.string().max(5000).nullable().optional(),
  priority: z.enum(CARD_PRIORITIES).optional(),
  storyPoints: z.number().int().min(0).max(999).nullable().optional(),
  dueDate: z.coerce.date().nullable().optional(),
  assigneeId: z.string().nullable().optional(),
  metadata: z.record(z.string(), z.unknown()).nullable().optional(),
});

export const updateCardInputSchema = z.object({
  id: z.number().int().positive(),
  title: z.string().min(1).max(500).optional(),
  description: z.string().max(5000).nullable().optional(),
  priority: z.enum(CARD_PRIORITIES).optional(),
  storyPoints: z.number().int().min(0).max(999).nullable().optional(),
  dueDate: z.coerce.date().nullable().optional(),
  assigneeId: z.string().nullable().optional(),
  isArchived: z.boolean().optional(),
  metadata: z.record(z.string(), z.unknown()).nullable().optional(),
});

export const deleteCardInputSchema = z.object({
  id: z.number().int().positive(),
});

export const moveCardInputSchema = z.object({
  cardId: z.number().int().positive(),
  targetColumnId: z.number().int().positive(),
  /** Full ordered list of card ids in the target column after the move */
  orderedCardIds: z.array(z.number().int().positive()),
});

export const reorderCardsInputSchema = z.object({
  /** Full ordered list of card ids for each affected column */
  columns: z.array(
    z.object({
      columnId: z.number().int().positive(),
      orderedCardIds: z.array(z.number().int().positive()),
    }),
  ),
});

export const listCardsInputSchema = z.object({
  boardId: z.number().int().positive(),
});

export const listColumnsInputSchema = z.object({
  boardId: z.number().int().positive(),
});

// ─── Board full snapshot (columns + cards) ────────────────────────────────────

export type KanbanBoardFull = {
  id: number;
  organizationId: string;
  createdBy: string;
  name: string;
  description: string | null;
  color: string | null;
  isArchived: boolean;
  config: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
  columns: Array<{
    id: number;
    boardId: number;
    organizationId: string;
    name: string;
    color: string | null;
    position: number;
    wipLimit: number | null;
    createdAt: Date;
    updatedAt: Date;
    cards: Array<{
      id: number;
      columnId: number;
      boardId: number;
      organizationId: string;
      createdBy: string;
      assigneeId: string | null;
      title: string;
      description: string | null;
      priority: string;
      storyPoints: number | null;
      dueDate: Date | null;
      position: number;
      isArchived: boolean;
      metadata: Record<string, unknown> | null;
      createdAt: Date;
      updatedAt: Date;
    }>;
  }>;
};

export type CreateBoardInput = z.infer<typeof createBoardInputSchema>;
export type UpdateBoardInput = z.infer<typeof updateBoardInputSchema>;
export type DeleteBoardInput = z.infer<typeof deleteBoardInputSchema>;
export type GetBoardInput = z.infer<typeof getBoardInputSchema>;
export type CreateColumnInput = z.infer<typeof createColumnInputSchema>;
export type UpdateColumnInput = z.infer<typeof updateColumnInputSchema>;
export type DeleteColumnInput = z.infer<typeof deleteColumnInputSchema>;
export type ReorderColumnsInput = z.infer<typeof reorderColumnsInputSchema>;
export type CreateCardInput = z.infer<typeof createCardInputSchema>;
export type UpdateCardInput = z.infer<typeof updateCardInputSchema>;
export type DeleteCardInput = z.infer<typeof deleteCardInputSchema>;
export type MoveCardInput = z.infer<typeof moveCardInputSchema>;
export type ReorderCardsInput = z.infer<typeof reorderCardsInputSchema>;
export type ListCardsInput = z.infer<typeof listCardsInputSchema>;
export type ListColumnsInput = z.infer<typeof listColumnsInputSchema>;
