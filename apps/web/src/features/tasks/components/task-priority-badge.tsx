import type { TaskPriority } from "@open-learn/api/modules/task/task.schema";

import { ArrowDownIcon, ArrowRightIcon, ArrowUpIcon } from "lucide-react";

import { TASK_PRIORITY_LABELS } from "../constants";

const priorityIcons = {
  low: ArrowDownIcon,
  medium: ArrowRightIcon,
  high: ArrowUpIcon,
} as const;

export function TaskPriorityBadge({ priority }: { priority: TaskPriority }) {
  const Icon = priorityIcons[priority];

  return (
    <span className="inline-flex items-center gap-2 text-sm text-foreground">
      <Icon className="size-3.5 text-muted-foreground" />
      <span>{TASK_PRIORITY_LABELS[priority]}</span>
    </span>
  );
}
