import { TRPCError } from "@trpc/server";
import { taskRepository, timeTrackerRepository } from "@open-learn/db";
import type { TaskRow } from "@open-learn/db/repositories/task";

import type {
  CreateTaskInput,
  DeleteTaskInput,
  TaskListItem,
  UpdateTaskInput,
} from "./task.schema";

function toIsoString(date: Date) {
  return date.toISOString();
}

function toTaskListItem(row: TaskRow): TaskListItem {
  return {
    id: row.id,
    organizationId: row.organizationId,
    projectId: row.projectId,
    createdByUserId: row.createdByUserId,
    title: row.title,
    description: row.description,
    type: row.type as TaskListItem["type"],
    status: row.status as TaskListItem["status"],
    priority: row.priority as TaskListItem["priority"],
    createdAt: toIsoString(row.createdAt),
    updatedAt: toIsoString(row.updatedAt),
    displayKey: `TASK-${row.id}`,
    projectName: row.projectName,
    projectColor: row.projectColor,
  };
}

async function validateProjectId(organizationId: string, projectId: number | null | undefined) {
  if (projectId === undefined || projectId === null) {
    return projectId ?? null;
  }

  const project = await timeTrackerRepository.getProjectById(organizationId, projectId);

  if (!project) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Invalid project",
    });
  }

  return projectId;
}

function normalizeNullableText(value: string | null | undefined) {
  if (value === undefined) {
    return undefined;
  }

  const trimmed = value?.trim() ?? "";
  return trimmed.length ? trimmed : null;
}

export const taskService = {
  async list(organizationId: string): Promise<TaskListItem[]> {
    const rows = await taskRepository.listTasksByOrganization(organizationId);
    return rows.map((row) => toTaskListItem(row));
  },

  async create(
    organizationId: string,
    userId: string,
    input: CreateTaskInput,
  ): Promise<TaskListItem> {
    const created = await taskRepository.createTask(organizationId, userId, {
      title: input.title.trim(),
      description: normalizeNullableText(input.description),
      type: input.type,
      status: input.status,
      priority: input.priority,
      projectId: await validateProjectId(organizationId, input.projectId),
    });

    if (!created) {
      throw new Error("Task creation returned no row");
    }

    return toTaskListItem(created);
  },

  async update(organizationId: string, input: UpdateTaskInput): Promise<TaskListItem> {
    const existing = await taskRepository.getTaskById(organizationId, input.id);

    if (!existing) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Task not found" });
    }

    const updated = await taskRepository.updateTask(organizationId, input.id, {
      title: input.title?.trim(),
      description: normalizeNullableText(input.description),
      type: input.type,
      status: input.status,
      priority: input.priority,
      projectId:
        input.projectId === undefined
          ? undefined
          : await validateProjectId(organizationId, input.projectId),
    });

    if (!updated) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Task not found" });
    }

    return toTaskListItem(updated);
  },

  async delete(organizationId: string, input: DeleteTaskInput) {
    const deleted = await taskRepository.deleteTask(organizationId, input.id);

    if (!deleted) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Task not found" });
    }

    return deleted;
  },
};
