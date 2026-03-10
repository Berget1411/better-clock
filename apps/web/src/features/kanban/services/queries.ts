import { useQuery } from "@tanstack/react-query";

import { trpc } from "@/utils/trpc";

export function useBoardsQuery() {
  return useQuery(trpc.kanban.listBoards.queryOptions());
}

export function useBoardQuery(boardId: number) {
  return useQuery(trpc.kanban.getBoard.queryOptions({ id: boardId }));
}
