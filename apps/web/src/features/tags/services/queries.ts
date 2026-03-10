import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";

export function useTagsQuery() {
  return useQuery(trpc.timeTracker.listTags.queryOptions({}));
}
