import type { TaskType } from "@open-learn/api/modules/task/task.schema";

import { Badge } from "@open-learn/ui/components/badge";

import { TASK_TYPE_LABELS } from "../constants";

export function TaskTypeBadge({ type }: { type: TaskType }) {
  return (
    <Badge
      variant="outline"
      className="h-5 rounded-none border-border/70 bg-background px-2 text-[11px] font-medium text-muted-foreground"
    >
      {TASK_TYPE_LABELS[type]}
    </Badge>
  );
}
