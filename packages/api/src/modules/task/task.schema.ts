import z from "zod";

export const taskTypeSchema = z.enum(["feature", "bug", "documentation"]);
export const taskStatusSchema = z.enum(["backlog", "todo", "in_progress", "done", "canceled"]);
export const taskPrioritySchema = z.enum(["low", "medium", "high"]);

export const taskSchema = z.object({
  id: z.number().int().positive(),
  organizationId: z.string(),
  projectId: z.number().int().positive().nullable(),
  createdByUserId: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  type: taskTypeSchema,
  status: taskStatusSchema,
  priority: taskPrioritySchema,
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const taskListItemSchema = taskSchema.extend({
  displayKey: z.string(),
  projectName: z.string().nullable(),
  projectColor: z.string().nullable(),
});

export const listTasksInputSchema = z.object({});

export const createTaskInputSchema = z.object({
  title: z.string().trim().min(1).max(160),
  description: z.string().trim().max(2000).nullable().optional(),
  type: taskTypeSchema.optional().default("feature"),
  status: taskStatusSchema.optional().default("backlog"),
  priority: taskPrioritySchema.optional().default("medium"),
  projectId: z.number().int().positive().nullable().optional(),
});

export const updateTaskInputSchema = z.object({
  id: z.number().int().positive(),
  title: z.string().trim().min(1).max(160).optional(),
  description: z.string().trim().max(2000).nullable().optional(),
  type: taskTypeSchema.optional(),
  status: taskStatusSchema.optional(),
  priority: taskPrioritySchema.optional(),
  projectId: z.number().int().positive().nullable().optional(),
});

export const deleteTaskInputSchema = z.object({
  id: z.number().int().positive(),
});

export type TaskType = z.infer<typeof taskTypeSchema>;
export type TaskStatus = z.infer<typeof taskStatusSchema>;
export type TaskPriority = z.infer<typeof taskPrioritySchema>;
export type Task = z.infer<typeof taskSchema>;
export type TaskListItem = z.infer<typeof taskListItemSchema>;
export type ListTasksInput = z.infer<typeof listTasksInputSchema>;
export type CreateTaskInput = z.infer<typeof createTaskInputSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskInputSchema>;
export type DeleteTaskInput = z.infer<typeof deleteTaskInputSchema>;
