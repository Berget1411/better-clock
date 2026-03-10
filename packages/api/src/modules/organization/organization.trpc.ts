import { z } from "zod";

import { protectedProcedure } from "../../trpc/procedures";
import { router } from "../../trpc/init";
import {
  cancelInvitationInputSchema,
  createOrganizationInputSchema,
  inviteMemberInputSchema,
  removeMemberInputSchema,
  updateMemberRoleInputSchema,
} from "./organization.schema";
import { organizationService } from "./organization.service";
import { TRPCError } from "@trpc/server";

function requireToken(ctx: { sessionToken?: string | null }): string {
  if (!ctx.sessionToken) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "No session token found",
    });
  }
  return ctx.sessionToken;
}

const orgIdInputSchema = z.object({ organizationId: z.string() });

export const organizationRouter = router({
  /** List all organizations the current user is a member of */
  list: protectedProcedure.query(({ ctx }) => {
    const token = requireToken(ctx);
    return organizationService.listOrganizations(token);
  }),

  /** Get the active organization with members and pending invitations */
  getActive: protectedProcedure.query(({ ctx }) => {
    const token = requireToken(ctx);
    const orgId = ctx.session.session.activeOrganizationId ?? undefined;
    return organizationService.getFullOrganization(token, orgId);
  }),

  create: protectedProcedure.input(createOrganizationInputSchema).mutation(({ ctx, input }) => {
    const token = requireToken(ctx);
    return organizationService.createOrganization(token, input);
  }),

  setActive: protectedProcedure.input(orgIdInputSchema).mutation(({ ctx, input }) => {
    const token = requireToken(ctx);
    return organizationService.setActiveOrganization(token, input.organizationId);
  }),

  listMembers: protectedProcedure.input(orgIdInputSchema).query(({ ctx, input }) => {
    const token = requireToken(ctx);
    return organizationService.listMembers(token, input.organizationId);
  }),

  listInvitations: protectedProcedure.input(orgIdInputSchema).query(({ ctx, input }) => {
    const token = requireToken(ctx);
    return organizationService.listInvitations(token, input.organizationId);
  }),

  inviteMember: protectedProcedure.input(inviteMemberInputSchema).mutation(({ ctx, input }) => {
    const token = requireToken(ctx);
    return organizationService.inviteMember(token, input);
  }),

  updateMemberRole: protectedProcedure
    .input(updateMemberRoleInputSchema)
    .mutation(({ ctx, input }) => {
      const token = requireToken(ctx);
      return organizationService.updateMemberRole(token, input);
    }),

  removeMember: protectedProcedure.input(removeMemberInputSchema).mutation(({ ctx, input }) => {
    const token = requireToken(ctx);
    return organizationService.removeMember(token, input);
  }),

  cancelInvitation: protectedProcedure
    .input(cancelInvitationInputSchema)
    .mutation(({ ctx, input }) => {
      const token = requireToken(ctx);
      return organizationService.cancelInvitation(token, input);
    }),
});
