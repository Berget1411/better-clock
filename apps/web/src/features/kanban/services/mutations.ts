import type { inferRouterOutputs } from "@trpc/server";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { trpc } from "@/utils/trpc";
import type { AppRouter } from "@open-learn/api/trpc/routers/app";

// Derive the wire/cache type from the tRPC router
type RouterOutputs = inferRouterOutputs<AppRouter>;
type BoardFull = RouterOutputs["kanban"]["getBoard"];

function boardQueryOptions(boardId: number) {
  return trpc.kanban.getBoard.queryOptions({ id: boardId });
}

function useInvalidateBoards() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries(trpc.kanban.listBoards.queryOptions());
}

function useInvalidateBoard(boardId: number) {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries(boardQueryOptions(boardId));
}

// ─── Board mutations ─────────────────────────────────────────────────────────

export function useCreateBoard() {
  const invalidate = useInvalidateBoards();
  return useMutation(
    trpc.kanban.createBoard.mutationOptions({
      onSuccess: () => {
        toast.success("Board created");
        invalidate();
      },
      onError: (err) => toast.error(err.message || "Failed to create board"),
    }),
  );
}

export function useUpdateBoard() {
  const invalidate = useInvalidateBoards();
  return useMutation(
    trpc.kanban.updateBoard.mutationOptions({
      onSuccess: () => {
        toast.success("Board updated");
        invalidate();
      },
      onError: (err) => toast.error(err.message || "Failed to update board"),
    }),
  );
}

export function useDeleteBoard() {
  const invalidate = useInvalidateBoards();
  return useMutation(
    trpc.kanban.deleteBoard.mutationOptions({
      onSuccess: () => {
        toast.success("Board deleted");
        invalidate();
      },
      onError: (err) => toast.error(err.message || "Failed to delete board"),
    }),
  );
}

// ─── Column mutations ─────────────────────────────────────────────────────────

export function useCreateColumn(boardId: number) {
  const invalidate = useInvalidateBoard(boardId);
  return useMutation(
    trpc.kanban.createColumn.mutationOptions({
      onSuccess: () => invalidate(),
      onError: (err) => toast.error(err.message || "Failed to create column"),
    }),
  );
}

export function useUpdateColumn(boardId: number) {
  const invalidate = useInvalidateBoard(boardId);
  return useMutation(
    trpc.kanban.updateColumn.mutationOptions({
      onSuccess: () => invalidate(),
      onError: (err) => toast.error(err.message || "Failed to update column"),
    }),
  );
}

export function useDeleteColumn(boardId: number) {
  const invalidate = useInvalidateBoard(boardId);
  return useMutation(
    trpc.kanban.deleteColumn.mutationOptions({
      onSuccess: () => {
        toast.success("Column deleted");
        invalidate();
      },
      onError: (err) => toast.error(err.message || "Failed to delete column"),
    }),
  );
}

export function useReorderColumns(boardId: number) {
  const queryClient = useQueryClient();
  const invalidate = useInvalidateBoard(boardId);

  return useMutation(
    trpc.kanban.reorderColumns.mutationOptions({
      onMutate: async (input) => {
        await queryClient.cancelQueries(boardQueryOptions(boardId));
        const previous = queryClient.getQueryData<BoardFull>(boardQueryOptions(boardId).queryKey);
        if (previous) {
          const posMap = new Map(input.updates.map((u) => [u.id, u.position]));
          queryClient.setQueryData<BoardFull>(boardQueryOptions(boardId).queryKey, {
            ...previous,
            columns: [...previous.columns]
              .map((col) => ({ ...col, position: posMap.get(col.id) ?? col.position }))
              .sort((a, b) => a.position - b.position),
          });
        }
        return { previous };
      },
      onError: (_err, _input, ctx) => {
        if (ctx?.previous) {
          queryClient.setQueryData(boardQueryOptions(boardId).queryKey, ctx.previous);
        }
        toast.error("Failed to reorder columns");
      },
      onSettled: () => invalidate(),
    }),
  );
}

// ─── Card mutations ───────────────────────────────────────────────────────────

export function useCreateCard(boardId: number) {
  const invalidate = useInvalidateBoard(boardId);
  return useMutation(
    trpc.kanban.createCard.mutationOptions({
      onSuccess: () => invalidate(),
      onError: (err) => toast.error(err.message || "Failed to create card"),
    }),
  );
}

export function useUpdateCard(boardId: number) {
  const queryClient = useQueryClient();
  const invalidate = useInvalidateBoard(boardId);

  return useMutation(
    trpc.kanban.updateCard.mutationOptions({
      onMutate: async (input) => {
        await queryClient.cancelQueries(boardQueryOptions(boardId));
        const previous = queryClient.getQueryData<BoardFull>(boardQueryOptions(boardId).queryKey);
        if (previous) {
          // Build a safe partial patch — skip dueDate (Date vs string mismatch between input and cache).
          const patch: Partial<BoardFull["columns"][0]["cards"][0]> = {
            ...(input.title !== undefined && { title: input.title }),
            ...(input.description !== undefined && { description: input.description ?? null }),
            ...(input.priority !== undefined && { priority: input.priority }),
            ...(input.storyPoints !== undefined && { storyPoints: input.storyPoints ?? null }),
            ...(input.assigneeId !== undefined && { assigneeId: input.assigneeId ?? null }),
            ...(input.isArchived !== undefined && { isArchived: input.isArchived }),
          };
          queryClient.setQueryData<BoardFull>(boardQueryOptions(boardId).queryKey, {
            ...previous,
            columns: previous.columns.map((col) => ({
              ...col,
              cards: col.cards.map((card) => (card.id === input.id ? { ...card, ...patch } : card)),
            })),
          });
        }
        return { previous };
      },
      onError: (_err, _input, ctx) => {
        if (ctx?.previous) {
          queryClient.setQueryData(boardQueryOptions(boardId).queryKey, ctx.previous);
        }
        toast.error("Failed to update card");
      },
      onSettled: () => invalidate(),
    }),
  );
}

export function useDeleteCard(boardId: number) {
  const queryClient = useQueryClient();
  const invalidate = useInvalidateBoard(boardId);

  return useMutation(
    trpc.kanban.deleteCard.mutationOptions({
      onMutate: async (input) => {
        await queryClient.cancelQueries(boardQueryOptions(boardId));
        const previous = queryClient.getQueryData<BoardFull>(boardQueryOptions(boardId).queryKey);
        if (previous) {
          queryClient.setQueryData<BoardFull>(boardQueryOptions(boardId).queryKey, {
            ...previous,
            columns: previous.columns.map((col) => ({
              ...col,
              cards: col.cards.filter((card) => card.id !== input.id),
            })),
          });
        }
        return { previous };
      },
      onError: (_err, _input, ctx) => {
        if (ctx?.previous) {
          queryClient.setQueryData(boardQueryOptions(boardId).queryKey, ctx.previous);
        }
        toast.error("Failed to delete card");
      },
      onSettled: () => invalidate(),
    }),
  );
}

export function useMoveCard(boardId: number) {
  const queryClient = useQueryClient();
  const invalidate = useInvalidateBoard(boardId);

  return useMutation(
    trpc.kanban.moveCard.mutationOptions({
      onMutate: async (input) => {
        await queryClient.cancelQueries(boardQueryOptions(boardId));
        const previous = queryClient.getQueryData<BoardFull>(boardQueryOptions(boardId).queryKey);
        if (previous) {
          // Find card being moved
          let movingCard: BoardFull["columns"][0]["cards"][0] | undefined;
          for (const col of previous.columns) {
            const found = col.cards.find((c) => c.id === input.cardId);
            if (found) {
              movingCard = found;
              break;
            }
          }
          if (movingCard) {
            const mc = movingCard;
            const orderedIds = input.orderedCardIds;
            queryClient.setQueryData<BoardFull>(boardQueryOptions(boardId).queryKey, {
              ...previous,
              columns: previous.columns.map((col) => {
                if (col.id === input.targetColumnId) {
                  const targetCards = orderedIds.flatMap((id, position) => {
                    if (id === input.cardId) {
                      return [{ ...mc, columnId: input.targetColumnId, position }];
                    }
                    const existing = col.cards.find((c) => c.id === id);
                    return existing ? [{ ...existing, position }] : [];
                  });
                  return { ...col, cards: targetCards };
                }
                return {
                  ...col,
                  cards: col.cards
                    .filter((c) => c.id !== input.cardId)
                    .map((c, i) => ({ ...c, position: i })),
                };
              }),
            });
          }
        }
        return { previous };
      },
      onError: (_err, _input, ctx) => {
        if (ctx?.previous) {
          queryClient.setQueryData(boardQueryOptions(boardId).queryKey, ctx.previous);
        }
        toast.error("Failed to move card");
      },
      onSettled: () => invalidate(),
    }),
  );
}
