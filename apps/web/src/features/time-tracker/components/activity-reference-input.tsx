import type { TaskListItem } from "@open-learn/api/modules/task/task.schema";

import { Button } from "@open-learn/ui/components/button";
import { ButtonGroup } from "@open-learn/ui/components/button-group";
import { Input } from "@open-learn/ui/components/input";

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
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-2 md:flex-row md:items-center">
      <ButtonGroup className="shrink-0">
        <Button
          type="button"
          variant={mode === "description" ? "secondary" : "outline"}
          className="h-10 px-3"
          onClick={() => {
            onModeChange("description");
            onTaskChange(null);
          }}
        >
          Write
        </Button>
        <Button
          type="button"
          variant={mode === "task" ? "secondary" : "outline"}
          className="h-10 px-3"
          onClick={() => {
            onModeChange("task");
            description.onChange("");
          }}
        >
          Task
        </Button>
      </ButtonGroup>

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
    </div>
  );
}
