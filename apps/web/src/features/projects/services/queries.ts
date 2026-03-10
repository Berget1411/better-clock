import { useQuery } from "@tanstack/react-query";

import { trpc } from "@/utils/trpc";

interface ProjectsQueryInput {
  showArchived?: boolean;
  clientId?: number | null;
  access?: "public" | "private" | "team" | null;
  hasBilling?: boolean | null;
}

export function useProjectsQuery(input: ProjectsQueryInput = {}) {
  return useQuery(
    trpc.timeTracker.listProjects.queryOptions({
      showArchived: input.showArchived ?? false,
      clientId: input.clientId ?? undefined,
      access: input.access ?? undefined,
      hasBilling: input.hasBilling ?? undefined,
    }),
  );
}
