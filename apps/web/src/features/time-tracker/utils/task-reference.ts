import type { TaskListItem } from "@open-learn/api/modules/task/task.schema";

export function filterTasksByProject(tasks: TaskListItem[], projectId: number | null) {
  if (projectId === null) {
    return tasks;
  }

  return tasks.filter((task) => task.projectId === projectId);
}

export function getCompatibleTaskId(
  tasks: TaskListItem[],
  taskId: number | null,
  projectId: number | null,
) {
  if (taskId === null) {
    return null;
  }

  const selectedTask = tasks.find((task) => task.id === taskId);

  if (!selectedTask) {
    return null;
  }

  if (projectId === null || selectedTask.projectId === projectId) {
    return taskId;
  }

  return null;
}
