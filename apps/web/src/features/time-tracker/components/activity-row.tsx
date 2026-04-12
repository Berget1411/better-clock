import type { TaskListItem } from "@open-learn/api/modules/task/task.schema";
import type {
  TrackerEntry,
  TrackerProject,
  TrackerTag,
} from "@open-learn/api/modules/time-tracker/time-tracker.schema";
import type { TrackerOverviewRange } from "../utils/date-time";

import { Badge } from "@open-learn/ui/components/badge";
import { Button } from "@open-learn/ui/components/button";
import { cn } from "@open-learn/ui/lib/utils";
import { ChevronDownIcon, ChevronRightIcon, PencilLineIcon } from "lucide-react";

import {
  formatDuration,
  formatTime,
  getEntryDescriptionLabel,
  getEntryDurationSeconds,
  isNextDay,
} from "../utils/date-time";
import { ActivityInlineEditor } from "./activity-inline-editor";

interface ActivityRowProps {
  entry: TrackerEntry;
  isExpanded: boolean;
  onToggle: () => void;
  projects: TrackerProject[];
  tasks: TaskListItem[];
  tags: TrackerTag[];
  range: TrackerOverviewRange;
  onClose: () => void;
}

export function ActivityRow({
  entry,
  isExpanded,
  onToggle,
  projects,
  tasks,
  tags,
  range,
  onClose,
}: ActivityRowProps) {
  const duration = formatDuration(getEntryDurationSeconds(entry));
  const descriptionLabel = getEntryDescriptionLabel(entry.description);
  const hasDescription = entry.description.trim().length > 0;
  const primaryLabel = hasDescription ? descriptionLabel : (entry.task?.title ?? descriptionLabel);

  return (
    <div className="overflow-hidden border bg-card">
      {isExpanded ? (
        <ActivityInlineEditor
          entry={entry}
          projects={projects}
          tasks={tasks}
          tags={tags}
          range={range}
          onCancel={onClose}
        />
      ) : (
        <div
          role="button"
          tabIndex={0}
          onClick={onToggle}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              onToggle();
            }
          }}
          className={cn(
            "group flex cursor-pointer flex-col gap-3 p-4 outline-none transition-colors hover:bg-muted/50 focus-visible:ring-1 focus-visible:ring-ring/50 md:flex-row md:items-center md:gap-2",
          )}
        >
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "truncate font-medium",
                  !hasDescription && !entry.task && "italic text-muted-foreground",
                )}
              >
                {primaryLabel}
              </div>
              <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                <PencilLineIcon className="size-3" />
                Edit
              </span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 md:flex-nowrap">
            {entry.task ? <Badge variant="outline">{entry.task.displayKey}</Badge> : null}
            {entry.project ? <Badge variant="outline">{entry.project.name}</Badge> : null}
            {entry.tags.map((tag) => (
              <Badge key={tag.id} variant="ghost">
                {tag.name}
              </Badge>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground md:flex-nowrap">
            <span className="tabular-nums">{formatTime(entry.startAt)}</span>
            <span>–</span>
            <span className="tabular-nums">
              {entry.endAt ? formatTime(entry.endAt) : "Running"}
            </span>
            {entry.endAt && isNextDay(entry.startAt, entry.endAt) ? <span>+1</span> : null}
          </div>
          <div className="min-w-28 text-right font-medium text-foreground tabular-nums">
            {duration}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="ml-auto shrink-0 text-muted-foreground hover:text-foreground"
            onClick={(event) => {
              event.stopPropagation();
              onToggle();
            }}
            aria-label={isExpanded ? "Collapse entry details" : "Edit entry details"}
          >
            {isExpanded ? <ChevronDownIcon /> : <ChevronRightIcon />}
          </Button>
        </div>
      )}
    </div>
  );
}
