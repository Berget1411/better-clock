import { and, desc, eq } from "drizzle-orm";

import { db } from "../client";
import { task } from "../schema/task";
import { trackerProject } from "../schema/time-tracker";

export type TaskRow = {
  id: number;
  organizationId: string;
  projectId: number | null;
  createdByUserId: string;
  title: string;
  description: string | null;
  type: string;
  status: string;
  priority: string;
  createdAt: Date;
  updatedAt: Date;
  projectName: string | null;
  projectColor: string | null;
};

function taskSelection() {
  return {
    id: task.id,
    organizationId: task.organizationId,
    projectId: task.projectId,
    createdByUserId: task.createdByUserId,
    title: task.title,
    description: task.description,
    type: task.type,
    status: task.status,
    priority: task.priority,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
    projectName: trackerProject.name,
    projectColor: trackerProject.color,
  };
}

export const taskRepository = {
  async listTasksByOrganization(organizationId: string): Promise<TaskRow[]> {
    return db
      .select(taskSelection())
      .from(task)
      .leftJoin(trackerProject, eq(task.projectId, trackerProject.id))
      .where(eq(task.organizationId, organizationId))
      .orderBy(desc(task.updatedAt), desc(task.id));
  },

  async getTaskById(organizationId: string, taskId: number): Promise<TaskRow | null> {
    const [row] = await db
      .select(taskSelection())
      .from(task)
      .leftJoin(trackerProject, eq(task.projectId, trackerProject.id))
      .where(and(eq(task.organizationId, organizationId), eq(task.id, taskId)))
      .limit(1);

    return row ?? null;
  },

  async createTask(
    organizationId: string,
    userId: string,
    input: {
      title: string;
      description?: string | null;
      type?: string;
      status?: string;
      priority?: string;
      projectId?: number | null;
    },
  ) {
    const [created] = await db
      .insert(task)
      .values({
        organizationId,
        createdByUserId: userId,
        title: input.title,
        description: input.description ?? null,
        type: input.type ?? "feature",
        status: input.status ?? "backlog",
        priority: input.priority ?? "medium",
        projectId: input.projectId ?? null,
      })
      .returning({ id: task.id });

    if (!created) {
      throw new Error("Failed to create task");
    }

    return this.getTaskById(organizationId, created.id);
  },

  async updateTask(
    organizationId: string,
    taskId: number,
    patch: {
      title?: string;
      description?: string | null;
      type?: string;
      status?: string;
      priority?: string;
      projectId?: number | null;
    },
  ) {
    const updateValues: Partial<typeof task.$inferInsert> = {};

    if (patch.title !== undefined) {
      updateValues.title = patch.title;
    }
    if (patch.description !== undefined) {
      updateValues.description = patch.description;
    }
    if (patch.type !== undefined) {
      updateValues.type = patch.type;
    }
    if (patch.status !== undefined) {
      updateValues.status = patch.status;
    }
    if (patch.priority !== undefined) {
      updateValues.priority = patch.priority;
    }
    if (patch.projectId !== undefined) {
      updateValues.projectId = patch.projectId;
    }

    const [updated] = await db
      .update(task)
      .set(updateValues)
      .where(and(eq(task.organizationId, organizationId), eq(task.id, taskId)))
      .returning({ id: task.id });

    if (!updated) {
      return null;
    }

    return this.getTaskById(organizationId, updated.id);
  },

  async deleteTask(organizationId: string, taskId: number) {
    const [deleted] = await db
      .delete(task)
      .where(and(eq(task.organizationId, organizationId), eq(task.id, taskId)))
      .returning({ id: task.id });

    return deleted ?? null;
  },
};
