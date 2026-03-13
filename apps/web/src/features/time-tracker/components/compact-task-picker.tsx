import type { TaskListItem } from "@open-learn/api/modules/task/task.schema";

import { useMemo, useState } from "react";
import { ClipboardListIcon, SearchIcon } from "lucide-react";

import { Button } from "@open-learn/ui/components/button";
import { Input } from "@open-learn/ui/components/input";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@open-learn/ui/components/popover";
import { cn } from "@open-learn/ui/lib/utils";

import { filterTasksByProject } from "../utils/task-reference";

interface CompactTaskPickerProps {
  value: number | null;
  onChange: (value: number | null) => void;
  tasks: TaskListItem[];
  projectId: number | null;
}

export function CompactTaskPicker({ value, onChange, tasks, projectId }: CompactTaskPickerProps) {
  const [search, setSearch] = useState("");
  const selectedTask = tasks.find((task) => task.id === value) ?? null;
  const projectScopedTasks = useMemo(
    () => filterTasksByProject(tasks, projectId),
    [projectId, tasks],
  );

  const filteredTasks = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) {
      return projectScopedTasks;
    }

    return projectScopedTasks.filter((task) =>
      [task.displayKey, task.title, task.projectName]
        .filter(Boolean)
        .some((entry) => String(entry).toLowerCase().includes(normalizedSearch)),
    );
  }, [projectScopedTasks, search]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="h-10 w-full justify-start px-3 text-left"
        >
          <ClipboardListIcon data-icon="inline-start" />
          <span className="truncate">
            {selectedTask ? `${selectedTask.displayKey} · ${selectedTask.title}` : "Reference task"}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-96">
        <PopoverHeader>
          <PopoverTitle>Task reference</PopoverTitle>
          <PopoverDescription>
            {projectId === null
              ? "Link this activity to an existing task."
              : "Link this activity to a task from the selected project."}
          </PopoverDescription>
        </PopoverHeader>
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search tasks"
            className="pl-8"
          />
        </div>
        <div className="flex max-h-64 flex-col overflow-y-auto border border-border/60">
          <Button
            type="button"
            variant={value === null ? "secondary" : "ghost"}
            className="h-auto justify-start rounded-none border-0 px-3 py-2"
            onClick={() => onChange(null)}
          >
            No task
          </Button>
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task) => (
              <Button
                key={task.id}
                type="button"
                variant={value === task.id ? "secondary" : "ghost"}
                className={cn(
                  "h-auto justify-start rounded-none border-0 px-3 py-2 text-left",
                  value === task.id && "shadow-none",
                )}
                onClick={() => onChange(task.id)}
              >
                <div className="flex min-w-0 flex-col items-start gap-0.5">
                  <span className="tabular-nums text-[11px] text-muted-foreground">
                    {task.displayKey}
                  </span>
                  <span className="truncate text-sm text-foreground">{task.title}</span>
                  {task.projectName ? (
                    <span className="truncate text-[11px] text-muted-foreground">
                      {task.projectName}
                    </span>
                  ) : null}
                </div>
              </Button>
            ))
          ) : (
            <div className="px-3 py-6 text-center text-xs text-muted-foreground">
              {projectId === null ? "No matching tasks." : "No matching tasks in this project."}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
