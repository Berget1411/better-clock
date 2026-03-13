import { TRPCError } from "@trpc/server";

import { router } from "../../trpc/init";
import { protectedProcedure } from "../../trpc/procedures";
import {
  createTaskInputSchema,
  deleteTaskInputSchema,
  listTasksInputSchema,
  updateTaskInputSchema,
} from "./task.schema";
import { taskService } from "./task.service";

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

export const taskRouter = router({
  list: protectedProcedure.input(listTasksInputSchema).query(({ ctx }) => {
    const orgId = requireActiveOrg(ctx);
    return taskService.list(orgId);
  }),

  create: protectedProcedure.input(createTaskInputSchema).mutation(({ ctx, input }) => {
    const orgId = requireActiveOrg(ctx);
    return taskService.create(orgId, ctx.session.user.id, input);
  }),

  update: protectedProcedure.input(updateTaskInputSchema).mutation(({ ctx, input }) => {
    const orgId = requireActiveOrg(ctx);
    return taskService.update(orgId, input);
  }),

  delete: protectedProcedure.input(deleteTaskInputSchema).mutation(({ ctx, input }) => {
    const orgId = requireActiveOrg(ctx);
    return taskService.delete(orgId, input);
  }),
});
