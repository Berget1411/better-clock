import { TRPCError } from "@trpc/server";

import { protectedProcedure } from "../../trpc/procedures";
import { router } from "../../trpc/init";
import {
  createBoardInputSchema,
  createCardInputSchema,
  createColumnInputSchema,
  deleteBoardInputSchema,
  deleteCardInputSchema,
  deleteColumnInputSchema,
  getBoardInputSchema,
  moveCardInputSchema,
  reorderCardsInputSchema,
  reorderColumnsInputSchema,
  updateBoardInputSchema,
  updateCardInputSchema,
  updateColumnInputSchema,
} from "./kanban.schema";
import { kanbanService } from "./kanban.service";

function requireActiveOrg(ctx: {
  session: NonNullable<{
    session: { activeOrganizationId?: string | null } & Record<string, unknown>;
    user: { id: string } & Record<string, unknown>;
  }>;
}) {
  const orgId = ctx.session.session.activeOrganizationId;
  if (!orgId) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "No active organization. Please select or create an organization.",
    });
  }
  return orgId;
}

export const kanbanRouter = router({
  // ─── Boards ────────────────────────────────────────────────────────────────

  listBoards: protectedProcedure.query(({ ctx }) => {
    const orgId = requireActiveOrg(ctx);
    return kanbanService.listBoards(orgId);
  }),

  getBoard: protectedProcedure.input(getBoardInputSchema).query(({ ctx, input }) => {
    const orgId = requireActiveOrg(ctx);
    return kanbanService.getBoardFull(orgId, input);
  }),

  createBoard: protectedProcedure.input(createBoardInputSchema).mutation(({ ctx, input }) => {
    const orgId = requireActiveOrg(ctx);
    return kanbanService.createBoard(orgId, ctx.session.user.id, input);
  }),

  updateBoard: protectedProcedure.input(updateBoardInputSchema).mutation(({ ctx, input }) => {
    const orgId = requireActiveOrg(ctx);
    return kanbanService.updateBoard(orgId, input);
  }),

  deleteBoard: protectedProcedure.input(deleteBoardInputSchema).mutation(({ ctx, input }) => {
    const orgId = requireActiveOrg(ctx);
    return kanbanService.deleteBoard(orgId, input);
  }),

  // ─── Columns ──────────────────────────────────────────────────────────────

  createColumn: protectedProcedure.input(createColumnInputSchema).mutation(({ ctx, input }) => {
    const orgId = requireActiveOrg(ctx);
    return kanbanService.createColumn(orgId, input);
  }),

  updateColumn: protectedProcedure.input(updateColumnInputSchema).mutation(({ ctx, input }) => {
    const orgId = requireActiveOrg(ctx);
    return kanbanService.updateColumn(orgId, input);
  }),

  deleteColumn: protectedProcedure.input(deleteColumnInputSchema).mutation(({ ctx, input }) => {
    const orgId = requireActiveOrg(ctx);
    return kanbanService.deleteColumn(orgId, input);
  }),

  reorderColumns: protectedProcedure.input(reorderColumnsInputSchema).mutation(({ ctx, input }) => {
    const orgId = requireActiveOrg(ctx);
    return kanbanService.reorderColumns(orgId, input);
  }),

  // ─── Cards ────────────────────────────────────────────────────────────────

  createCard: protectedProcedure.input(createCardInputSchema).mutation(({ ctx, input }) => {
    const orgId = requireActiveOrg(ctx);
    return kanbanService.createCard(orgId, ctx.session.user.id, input);
  }),

  updateCard: protectedProcedure.input(updateCardInputSchema).mutation(({ ctx, input }) => {
    const orgId = requireActiveOrg(ctx);
    return kanbanService.updateCard(orgId, input);
  }),

  moveCard: protectedProcedure.input(moveCardInputSchema).mutation(({ ctx, input }) => {
    const orgId = requireActiveOrg(ctx);
    return kanbanService.moveCard(orgId, input);
  }),

  reorderCards: protectedProcedure.input(reorderCardsInputSchema).mutation(({ ctx, input }) => {
    const orgId = requireActiveOrg(ctx);
    return kanbanService.reorderCards(orgId, input);
  }),

  deleteCard: protectedProcedure.input(deleteCardInputSchema).mutation(({ ctx, input }) => {
    const orgId = requireActiveOrg(ctx);
    return kanbanService.deleteCard(orgId, input);
  }),
});
