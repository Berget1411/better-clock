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
});

export const createTagInputSchema = z.object({
  name: z.string().trim().min(1).max(80),
});

export const trackerOverviewSchema = z.object({
  activeEntry: trackerEntrySchema.nullable(),
  entries: z.array(trackerEntrySchema),
  projects: z.array(trackerProjectSchema),
  tags: z.array(trackerTagSchema),
});

export type TrackerProject = z.infer<typeof trackerProjectSchema>;
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
export type CreateTagInput = z.infer<typeof createTagInputSchema>;
