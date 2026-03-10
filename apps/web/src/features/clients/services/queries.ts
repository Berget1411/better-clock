import { useQuery } from "@tanstack/react-query";

import { trpc } from "@/utils/trpc";

export function useClientsQuery(showArchived = false) {
  return useQuery(trpc.client.list.queryOptions({ showArchived }));
}
