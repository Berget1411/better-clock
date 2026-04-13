import type { TaskListItem } from "@open-learn/api/modules/task/task.schema";

import { PencilLineIcon, CheckSquareIcon } from "lucide-react";
import { Input } from "@open-learn/ui/components/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@open-learn/ui/components/tooltip";

import { CompactTaskPicker } from "./compact-task-picker";

interface ActivityReferenceInputProps {
  mode: "description" | "task";
  onModeChange: (mode: "description" | "task") => void;
  description: {
    value: string;
    onBlur: () => void;
    onChange: (value: string) => void;
    isInvalid: boolean;
    placeholder: string;
    id?: string;
  };
  taskId: number | null;
  projectId: number | null;
  onTaskChange: (value: number | null) => void;
  tasks: TaskListItem[];
}

export function ActivityReferenceInput({
  mode,
  onModeChange,
  description,
  taskId,
  projectId,
  onTaskChange,
  tasks,
}: ActivityReferenceInputProps) {
  const toggle = () => {
    if (mode === "description") {
      onModeChange("task");
      description.onChange("");
    } else {
      onModeChange("description");
      onTaskChange(null);
    }
  };

  return (
    <div className="flex min-w-0 flex-1 items-center gap-1.5">
      <div className="min-w-0 flex-1">
        {mode === "task" ? (
          <CompactTaskPicker
            value={taskId}
            onChange={onTaskChange}
            tasks={tasks}
            projectId={projectId}
          />
        ) : (
          <Input
            id={description.id}
            value={description.value}
            onBlur={description.onBlur}
            onChange={(event) => description.onChange(event.target.value)}
            aria-invalid={description.isInvalid}
            placeholder={description.placeholder}
            className="h-10 text-sm"
          />
        )}
      </div>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={toggle}
              className="shrink-0 rounded p-1.5 text-muted-foreground/50 transition-colors hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              {mode === "description" ? (
                <CheckSquareIcon className="size-4" />
              ) : (
                <PencilLineIcon className="size-4" />
              )}
            </button>
          </TooltipTrigger>
          <TooltipContent>
            {mode === "description" ? "Switch to task" : "Switch to description"}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
