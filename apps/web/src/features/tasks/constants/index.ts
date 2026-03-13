import type { TaskPriority, TaskStatus, TaskType } from "@open-learn/api/modules/task/task.schema";

export const TASK_COPY = {
  pageTitle: "Tasks",
  pageDescription: "Track work items, link them to projects, and follow progress.",
  searchPlaceholder: "Filter tasks...",
  addTask: "Add Task",
  addTaskTitle: "Add task",
  editTaskTitle: "Edit task",
  emptyTitle: "No tasks yet",
  emptyDescription:
    "Create your first task and optionally link it to a project to keep work organized.",
  noResults: "No tasks match your filters.",
  loading: "Loading tasks...",
} as const;

export const TASK_TYPE_LABELS: Record<TaskType, string> = {
  feature: "Feature",
  bug: "Bug",
  documentation: "Documentation",
};

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  backlog: "Backlog",
  todo: "Todo",
  in_progress: "In Progress",
  done: "Done",
  canceled: "Canceled",
};

export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

export const TASK_TYPE_OPTIONS = ["feature", "bug", "documentation"] satisfies TaskType[];
export const TASK_STATUS_OPTIONS = [
  "backlog",
  "todo",
  "in_progress",
  "done",
  "canceled",
] satisfies TaskStatus[];
export const TASK_PRIORITY_OPTIONS = ["low", "medium", "high"] satisfies TaskPriority[];
export const TASK_PAGE_SIZE_OPTIONS = [10, 25, 50] as const;
