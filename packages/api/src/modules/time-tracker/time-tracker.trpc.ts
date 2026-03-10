import { protectedProcedure } from "../../trpc/procedures";
import { router } from "../../trpc/init";
import {
  createManualEntryInputSchema,
  createProjectInputSchema,
  createTagInputSchema,
  deleteEntryInputSchema,
  discardTimerInputSchema,
  overviewInputSchema,
  startTimerInputSchema,
  stopTimerInputSchema,
  updateActiveTimerInputSchema,
  updateEntryInputSchema,
} from "./time-tracker.schema";
import { timeTrackerService } from "./time-tracker.service";

export const timeTrackerRouter = router({
  overview: protectedProcedure.input(overviewInputSchema).query(({ ctx, input }) => {
    return timeTrackerService.overview(ctx.session.user.id, input);
  }),

  startTimer: protectedProcedure.input(startTimerInputSchema).mutation(({ ctx, input }) => {
    return timeTrackerService.startTimer(ctx.session.user.id, input);
  }),

  updateActiveTimer: protectedProcedure
    .input(updateActiveTimerInputSchema)
    .mutation(({ ctx, input }) => {
      return timeTrackerService.updateActiveTimer(ctx.session.user.id, input);
    }),

  stopTimer: protectedProcedure.input(stopTimerInputSchema).mutation(({ ctx, input }) => {
    return timeTrackerService.stopTimer(ctx.session.user.id, input);
  }),

  discardTimer: protectedProcedure.input(discardTimerInputSchema).mutation(({ ctx, input }) => {
    return timeTrackerService.discardTimer(ctx.session.user.id, input);
  }),

  createManualEntry: protectedProcedure
    .input(createManualEntryInputSchema)
    .mutation(({ ctx, input }) => {
      return timeTrackerService.createManualEntry(ctx.session.user.id, input);
    }),

  updateEntry: protectedProcedure.input(updateEntryInputSchema).mutation(({ ctx, input }) => {
    return timeTrackerService.updateEntry(ctx.session.user.id, input);
  }),

  deleteEntry: protectedProcedure.input(deleteEntryInputSchema).mutation(({ ctx, input }) => {
    return timeTrackerService.deleteEntry(ctx.session.user.id, input);
  }),

  createProject: protectedProcedure.input(createProjectInputSchema).mutation(({ ctx, input }) => {
    return timeTrackerService.createProject(ctx.session.user.id, input);
  }),

  createTag: protectedProcedure.input(createTagInputSchema).mutation(({ ctx, input }) => {
    return timeTrackerService.createTag(ctx.session.user.id, input);
  }),
});
