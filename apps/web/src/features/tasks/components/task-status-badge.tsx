import type { TaskStatus } from "@open-learn/api/modules/task/task.schema";

import {
  CheckCheckIcon,
  CircleDashedIcon,
  CircleIcon,
  Clock3Icon,
  CircleOffIcon,
} from "lucide-react";

import { TASK_STATUS_LABELS } from "../constants";

const statusIcons = {
  backlog: CircleDashedIcon,
  todo: CircleIcon,
  in_progress: Clock3Icon,
  done: CheckCheckIcon,
  canceled: CircleOffIcon,
} as const;

export function TaskStatusBadge({ status }: { status: TaskStatus }) {
  const Icon = statusIcons[status];

  return (
    <span className="inline-flex items-center gap-2 text-sm text-foreground">
      <Icon className="size-3.5 text-muted-foreground" />
      <span>{TASK_STATUS_LABELS[status]}</span>
    </span>
  );
}
