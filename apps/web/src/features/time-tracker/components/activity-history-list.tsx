import type { TaskListItem } from "@open-learn/api/modules/task/task.schema";
import type {
  TrackerEntry,
  TrackerProject,
  TrackerTag,
} from "@open-learn/api/modules/time-tracker/time-tracker.schema";
import type { TrackerOverviewRange } from "../utils/date-time";

import { useMemo } from "react";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@open-learn/ui/components/empty";
import { Skeleton } from "@open-learn/ui/components/skeleton";
import { Clock3Icon } from "lucide-react";

import { TRACKER_COPY } from "../constants";
import { formatDuration } from "../utils/date-time";
import { groupEntriesByWeek } from "../utils/group-entries";
import { ActivityRow } from "./activity-row";

interface ActivityHistoryListProps {
  entries: TrackerEntry[];
  projects: TrackerProject[];
  tasks: TaskListItem[];
  tags: TrackerTag[];
  range: TrackerOverviewRange;
  expandedEntryId: number | null;
  onExpandedEntryChange: (entryId: number | null) => void;
  isLoading: boolean;
}

export function ActivityHistoryList({
  entries,
  projects,
  tasks,
  tags,
  range,
  expandedEntryId,
  onExpandedEntryChange,
  isLoading,
}: ActivityHistoryListProps) {
  const groupedEntries = useMemo(() => groupEntriesByWeek(entries), [entries]);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-28 w-full" />
        ))}
      </div>
    );
  }

  if (!entries.length) {
    return (
      <Empty className="border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Clock3Icon />
          </EmptyMedia>
          <EmptyTitle>{TRACKER_COPY.emptyTitle}</EmptyTitle>
          <EmptyDescription>{TRACKER_COPY.emptyDescription}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {groupedEntries.map((week) => (
        <section key={week.key} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-sm font-semibold">{week.label}</h2>
            <p className="text-sm text-muted-foreground">
              Week total{" "}
              <span className="font-medium text-foreground tabular-nums">
                {formatDuration(week.totalSeconds)}
              </span>
            </p>
          </div>

          <div className="flex flex-col gap-4">
            {week.days.map((day) => (
              <section key={day.key} className="flex flex-col gap-2">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <h3 className="text-sm text-muted-foreground">{day.label}</h3>
                  <p className="text-sm text-muted-foreground">
                    Day total{" "}
                    <span className="font-medium text-foreground tabular-nums">
                      {formatDuration(day.totalSeconds)}
                    </span>
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  {day.entries.map((entry) => (
                    <ActivityRow
                      key={entry.id}
                      entry={entry}
                      isExpanded={expandedEntryId === entry.id}
                      onToggle={() =>
                        onExpandedEntryChange(expandedEntryId === entry.id ? null : entry.id)
                      }
                      projects={projects}
                      tasks={tasks}
                      tags={tags}
                      range={range}
                      onClose={() => onExpandedEntryChange(null)}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
