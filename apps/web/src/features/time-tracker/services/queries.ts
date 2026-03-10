import type { TrackerOverviewRange } from "../utils/date-time";

import { useQuery } from "@tanstack/react-query";

import { trpc } from "@/utils/trpc";

export function useTrackerOverviewQuery(range: TrackerOverviewRange) {
  return useQuery(trpc.timeTracker.overview.queryOptions(range));
}
