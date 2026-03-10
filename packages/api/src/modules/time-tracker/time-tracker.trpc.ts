import { TRPCError } from "@trpc/server";

import { protectedProcedure } from "../../trpc/procedures";
import { router } from "../../trpc/init";
import {
  createManualEntryInputSchema,
  createProjectInputSchema,
  createTagInputSchema,
  deleteEntryInputSchema,
  deleteProjectInputSchema,
  deleteTagInputSchema,
  discardTimerInputSchema,
  listProjectsInputSchema,
  listTagsInputSchema,
  overviewInputSchema,
  startTimerInputSchema,
  stopTimerInputSchema,
  updateActiveTimerInputSchema,
  updateEntryInputSchema,
  updateProjectInputSchema,
  updateTagInputSchema,
} from "./time-tracker.schema";
import { timeTrackerService } from "./time-tracker.service";

function requireActiveOrg(ctx: {
  session: NonNullable<{
    session: { activeOrganizationId?: string | null } & Record<string, unknown>;
    user: { id: string } & Record<string, unknown>;
  }>;
}) {
  const orgId = ctx.session.session.activeOrganizationId;
  if (!orgId) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "No active organization. Please select or create an organization.",
    });
  }
  return orgId;
}

export const timeTrackerRouter = router({
  overview: protectedProcedure.input(overviewInputSchema).query(({ ctx, input }) => {
    const orgId = requireActiveOrg(ctx);
    return timeTrackerService.overview(orgId, ctx.session.user.id, input);
  }),

  startTimer: protectedProcedure.input(startTimerInputSchema).mutation(({ ctx, input }) => {
    const orgId = requireActiveOrg(ctx);
    return timeTrackerService.startTimer(orgId, ctx.session.user.id, input);
  }),

  updateActiveTimer: protectedProcedure
    .input(updateActiveTimerInputSchema)
    .mutation(({ ctx, input }) => {
      const orgId = requireActiveOrg(ctx);
      return timeTrackerService.updateActiveTimer(orgId, ctx.session.user.id, input);
    }),

  stopTimer: protectedProcedure.input(stopTimerInputSchema).mutation(({ ctx, input }) => {
    const orgId = requireActiveOrg(ctx);
    return timeTrackerService.stopTimer(orgId, ctx.session.user.id, input);
  }),

  discardTimer: protectedProcedure.input(discardTimerInputSchema).mutation(({ ctx, input }) => {
    const orgId = requireActiveOrg(ctx);
    return timeTrackerService.discardTimer(orgId, ctx.session.user.id, input);
  }),

  createManualEntry: protectedProcedure
    .input(createManualEntryInputSchema)
    .mutation(({ ctx, input }) => {
      const orgId = requireActiveOrg(ctx);
      return timeTrackerService.createManualEntry(orgId, ctx.session.user.id, input);
    }),

  updateEntry: protectedProcedure.input(updateEntryInputSchema).mutation(({ ctx, input }) => {
    const orgId = requireActiveOrg(ctx);
    return timeTrackerService.updateEntry(orgId, ctx.session.user.id, input);
  }),

  deleteEntry: protectedProcedure.input(deleteEntryInputSchema).mutation(({ ctx, input }) => {
    const orgId = requireActiveOrg(ctx);
    return timeTrackerService.deleteEntry(orgId, ctx.session.user.id, input);
  }),

  createProject: protectedProcedure.input(createProjectInputSchema).mutation(({ ctx, input }) => {
    const orgId = requireActiveOrg(ctx);
    return timeTrackerService.createProject(orgId, ctx.session.user.id, input);
  }),

  listProjects: protectedProcedure.input(listProjectsInputSchema).query(({ ctx, input }) => {
    const orgId = requireActiveOrg(ctx);
    return timeTrackerService.listProjects(orgId, input);
  }),

  updateProject: protectedProcedure.input(updateProjectInputSchema).mutation(({ ctx, input }) => {
    const orgId = requireActiveOrg(ctx);
    return timeTrackerService.updateProject(orgId, input);
  }),

  deleteProject: protectedProcedure.input(deleteProjectInputSchema).mutation(({ ctx, input }) => {
    const orgId = requireActiveOrg(ctx);
    return timeTrackerService.deleteProject(orgId, input);
  }),

  createTag: protectedProcedure.input(createTagInputSchema).mutation(({ ctx, input }) => {
    const orgId = requireActiveOrg(ctx);
    return timeTrackerService.createTag(orgId, ctx.session.user.id, input);
  }),

  listTags: protectedProcedure.input(listTagsInputSchema).query(({ ctx }) => {
    const orgId = requireActiveOrg(ctx);
    return timeTrackerService.listTags(orgId);
  }),

  updateTag: protectedProcedure.input(updateTagInputSchema).mutation(({ ctx, input }) => {
    const orgId = requireActiveOrg(ctx);
    return timeTrackerService.updateTag(orgId, input);
  }),

  deleteTag: protectedProcedure.input(deleteTagInputSchema).mutation(({ ctx, input }) => {
    const orgId = requireActiveOrg(ctx);
    return timeTrackerService.deleteTag(orgId, input);
  }),
});
