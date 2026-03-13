import type {
  CreateTaskInput,
  TaskListItem,
  TaskPriority,
  TaskStatus,
  TaskType,
} from "@open-learn/api/modules/task/task.schema";
import type { TrackerProjectFull } from "@open-learn/api/modules/time-tracker/time-tracker.schema";

import { useEffect, useMemo, useState } from "react";

import { Button } from "@open-learn/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@open-learn/ui/components/dialog";
import { Input } from "@open-learn/ui/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@open-learn/ui/components/select";
import { Textarea } from "@open-learn/ui/components/textarea";

import {
  TASK_COPY,
  TASK_PRIORITY_LABELS,
  TASK_PRIORITY_OPTIONS,
  TASK_STATUS_LABELS,
  TASK_STATUS_OPTIONS,
  TASK_TYPE_LABELS,
  TASK_TYPE_OPTIONS,
} from "../constants";
import { useCreateTask, useUpdateTask } from "../services/mutations";

interface TaskFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: TaskListItem | null;
  projects: TrackerProjectFull[];
}

export function TaskFormDialog({ open, onOpenChange, task, projects }: TaskFormDialogProps) {
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const isEditing = Boolean(task);
  const isPending = createTask.isPending || updateTask.isPending;

  const initialValues = useMemo(
    () => ({
      title: task?.title ?? "",
      description: task?.description ?? "",
      type: (task?.type ?? "feature") as TaskType,
      status: (task?.status ?? "backlog") as TaskStatus,
      priority: (task?.priority ?? "medium") as TaskPriority,
      projectId: task?.projectId ? String(task.projectId) : "none",
    }),
    [task],
  );

  const [title, setTitle] = useState(initialValues.title);
  const [description, setDescription] = useState(initialValues.description);
  const [type, setType] = useState<TaskType>(initialValues.type);
  const [status, setStatus] = useState<TaskStatus>(initialValues.status);
  const [priority, setPriority] = useState<TaskPriority>(initialValues.priority);
  const [projectId, setProjectId] = useState(initialValues.projectId);

  useEffect(() => {
    if (!open) return;
    setTitle(initialValues.title);
    setDescription(initialValues.description);
    setType(initialValues.type);
    setStatus(initialValues.status);
    setPriority(initialValues.priority);
    setProjectId(initialValues.projectId);
  }, [initialValues, open]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const payload: CreateTaskInput = {
      title: title.trim(),
      description: description.trim() ? description.trim() : null,
      type,
      status,
      priority,
      projectId: projectId === "none" ? null : Number(projectId),
    };

    if (!payload.title) {
      return;
    }

    if (isEditing && task) {
      await updateTask.mutateAsync({ id: task.id, ...payload });
    } else {
      await createTask.mutateAsync(payload);
    }

    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl gap-5">
        <DialogHeader>
          <DialogTitle>{isEditing ? TASK_COPY.editTaskTitle : TASK_COPY.addTaskTitle}</DialogTitle>
          <DialogDescription>
            Capture the work clearly and link it to a project when it helps keep reporting tidy.
          </DialogDescription>
        </DialogHeader>

        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-1.5">
            <label htmlFor="task-title" className="text-xs font-medium text-foreground">
              Title
            </label>
            <Input
              id="task-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Ship tasks table"
              maxLength={160}
            />
          </div>

          <div className="grid gap-1.5">
            <label htmlFor="task-description" className="text-xs font-medium text-foreground">
              Description
            </label>
            <Textarea
              id="task-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Optional notes about scope, blockers, or details."
              maxLength={2000}
              className="min-h-24"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <label className="text-xs font-medium text-foreground">Project</label>
              <Select value={projectId} onValueChange={setProjectId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="No project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No project</SelectItem>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={String(project.id)}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-1.5">
              <label className="text-xs font-medium text-foreground">Type</label>
              <Select value={type} onValueChange={(value) => setType(value as TaskType)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TASK_TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {TASK_TYPE_LABELS[option]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-1.5">
              <label className="text-xs font-medium text-foreground">Status</label>
              <Select value={status} onValueChange={(value) => setStatus(value as TaskStatus)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TASK_STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {TASK_STATUS_LABELS[option]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-1.5">
              <label className="text-xs font-medium text-foreground">Priority</label>
              <Select
                value={priority}
                onValueChange={(value) => setPriority(value as TaskPriority)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TASK_PRIORITY_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {TASK_PRIORITY_LABELS[option]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!title.trim() || isPending}>
              {isEditing ? "Save changes" : TASK_COPY.addTask}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
