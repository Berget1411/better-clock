import { TRPCError } from "@trpc/server";

import { protectedProcedure } from "../../trpc/procedures";
import { router } from "../../trpc/init";
import {
  createClientInputSchema,
  deleteClientInputSchema,
  listClientsInputSchema,
  updateClientInputSchema,
} from "./client.schema";
import { clientService } from "./client.service";

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

export const clientRouter = router({
  list: protectedProcedure.input(listClientsInputSchema).query(({ ctx, input }) => {
    const orgId = requireActiveOrg(ctx);
    return clientService.list(orgId, input);
  }),

  create: protectedProcedure.input(createClientInputSchema).mutation(({ ctx, input }) => {
    const orgId = requireActiveOrg(ctx);
    return clientService.create(orgId, input);
  }),

  update: protectedProcedure.input(updateClientInputSchema).mutation(({ ctx, input }) => {
    const orgId = requireActiveOrg(ctx);
    return clientService.update(orgId, input);
  }),

  delete: protectedProcedure.input(deleteClientInputSchema).mutation(({ ctx, input }) => {
    const orgId = requireActiveOrg(ctx);
    return clientService.delete(orgId, input);
  }),
});
