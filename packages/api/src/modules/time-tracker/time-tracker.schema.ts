import z from "zod";

export const trackerProjectSchema = z.object({
  id: z.number().int().positive(),
  name: z.string(),
});

export const trackerTagSchema = z.object({
  id: z.number().int().positive(),
  name: z.string(),
});

export const trackerEntrySchema = z.object({
  id: z.number().int().positive(),
  description: z.string(),
  isBillable: z.boolean(),
  startAt: z.string(),
  endAt: z.string().nullable(),
  project: trackerProjectSchema.nullable(),
  tags: z.array(trackerTagSchema),
});

export const overviewInputSchema = z.object({
  from: z.string().min(1),
  to: z.string().min(1),
});

const trackerMetadataInputSchema = z.object({
  description: z.string().trim().max(500),
  projectId: z.number().int().positive().nullable(),
  tagIds: z.array(z.number().int().positive()),
  isBillable: z.boolean(),
});

export const startTimerInputSchema = trackerMetadataInputSchema;

export const updateActiveTimerInputSchema = trackerMetadataInputSchema.extend({
  entryId: z.number().int().positive(),
});

export const stopTimerInputSchema = z.object({
  entryId: z.number().int().positive(),
});

export const discardTimerInputSchema = z.object({
  entryId: z.number().int().positive(),
});

export const createManualEntryInputSchema = trackerMetadataInputSchema.extend({
  startAt: z.string().min(1),
  endAt: z.string().min(1),
});

export const updateEntryInputSchema = trackerMetadataInputSchema.extend({
  entryId: z.number().int().positive(),
  startAt: z.string().min(1),
  endAt: z.string().min(1),
});

export const deleteEntryInputSchema = z.object({
  entryId: z.number().int().positive(),
});

export const createProjectInputSchema = z.object({
  name: z.string().trim().min(1).max(80),
  clientId: z.number().int().positive().nullable().optional(),
  color: z.string().trim().max(20).nullable().optional(),
  hourlyRate: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/)
    .nullable()
    .optional(),
  access: z.enum(["public", "private", "team"]).optional().default("public"),
});

export const listProjectsInputSchema = z.object({
  showArchived: z.boolean().optional().default(false),
  clientId: z.number().int().positive().nullable().optional(),
  access: z.enum(["public", "private", "team"]).nullable().optional(),
  hasBilling: z.boolean().nullable().optional(),
});

export const updateProjectInputSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().trim().min(1).max(80).optional(),
  clientId: z.number().int().positive().nullable().optional(),
  color: z.string().trim().max(20).nullable().optional(),
  hourlyRate: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/)
    .nullable()
    .optional(),
  isArchived: z.boolean().optional(),
  access: z.enum(["public", "private", "team"]).optional(),
});

export const deleteProjectInputSchema = z.object({
  id: z.number().int().positive(),
});

export const trackerProjectFullSchema = z.object({
  id: z.number().int().positive(),
  name: z.string(),
  clientId: z.number().int().positive().nullable(),
  clientName: z.string().nullable(),
  clientCurrency: z.string().nullable(),
  color: z.string().nullable(),
  hourlyRate: z.string().nullable(),
  isArchived: z.boolean(),
  access: z.string(),
  trackedSeconds: z.number(),
  amount: z.number(),
});

export const createTagInputSchema = z.object({
  name: z.string().trim().min(1).max(80),
});

export const listTagsInputSchema = z.object({});

export const updateTagInputSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().trim().min(1).max(80),
});

export const deleteTagInputSchema = z.object({
  id: z.number().int().positive(),
});

export const trackerOverviewSchema = z.object({
  activeEntry: trackerEntrySchema.nullable(),
  entries: z.array(trackerEntrySchema),
  projects: z.array(trackerProjectSchema),
  tags: z.array(trackerTagSchema),
});

export type TrackerProject = z.infer<typeof trackerProjectSchema>;
export type TrackerProjectFull = z.infer<typeof trackerProjectFullSchema>;
export type TrackerTag = z.infer<typeof trackerTagSchema>;
export type TrackerEntry = z.infer<typeof trackerEntrySchema>;
export type TrackerOverview = z.infer<typeof trackerOverviewSchema>;

export type OverviewInput = z.infer<typeof overviewInputSchema>;
export type StartTimerInput = z.infer<typeof startTimerInputSchema>;
export type UpdateActiveTimerInput = z.infer<typeof updateActiveTimerInputSchema>;
export type StopTimerInput = z.infer<typeof stopTimerInputSchema>;
export type DiscardTimerInput = z.infer<typeof discardTimerInputSchema>;
export type CreateManualEntryInput = z.infer<typeof createManualEntryInputSchema>;
export type UpdateEntryInput = z.infer<typeof updateEntryInputSchema>;
export type DeleteEntryInput = z.infer<typeof deleteEntryInputSchema>;
export type CreateProjectInput = z.infer<typeof createProjectInputSchema>;
export type ListProjectsInput = z.infer<typeof listProjectsInputSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectInputSchema>;
export type DeleteProjectInput = z.infer<typeof deleteProjectInputSchema>;
export type CreateTagInput = z.infer<typeof createTagInputSchema>;
export type ListTagsInput = z.infer<typeof listTagsInputSchema>;
export type UpdateTagInput = z.infer<typeof updateTagInputSchema>;
export type DeleteTagInput = z.infer<typeof deleteTagInputSchema>;
