import { auth } from "@open-learn/auth";

import type {
  CancelInvitationInput,
  CreateOrganizationInput,
  InviteMemberInput,
  RemoveMemberInput,
  UpdateMemberRoleInput,
} from "./organization.schema";

// Helper to build fake request headers for Better Auth server-side calls
function buildHeaders(sessionToken: string) {
  return new Headers({
    cookie: `better-auth.session_token=${sessionToken}`,
  });
}

export const organizationService = {
  async listOrganizations(sessionToken: string) {
    const result = await auth.api.listOrganizations({
      headers: buildHeaders(sessionToken),
    });
    return result ?? [];
  },

  async getFullOrganization(sessionToken: string, organizationId?: string) {
    const result = await auth.api.getFullOrganization({
      headers: buildHeaders(sessionToken),
      query: organizationId ? { organizationId } : undefined,
    });
    return result;
  },

  async createOrganization(sessionToken: string, input: CreateOrganizationInput) {
    const slug = input.slug ?? input.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const result = await auth.api.createOrganization({
      headers: buildHeaders(sessionToken),
      body: {
        name: input.name,
        slug,
      },
    });
    return result;
  },

  async setActiveOrganization(sessionToken: string, organizationId: string) {
    const result = await auth.api.setActiveOrganization({
      headers: buildHeaders(sessionToken),
      body: {
        organizationId,
      },
    });
    return result;
  },

  async listMembers(sessionToken: string, organizationId: string) {
    const result = await auth.api.getFullOrganization({
      headers: buildHeaders(sessionToken),
      query: { organizationId },
    });
    return result?.members ?? [];
  },

  async listInvitations(sessionToken: string, organizationId: string) {
    const result = await auth.api.getFullOrganization({
      headers: buildHeaders(sessionToken),
      query: { organizationId },
    });
    return (result?.invitations ?? []).filter(
      (inv: { status: string }) => inv.status === "pending",
    );
  },

  async inviteMember(sessionToken: string, input: InviteMemberInput) {
    const result = await auth.api.createInvitation({
      headers: buildHeaders(sessionToken),
      body: {
        email: input.email,
        role: input.role,
        organizationId: input.organizationId,
      },
    });
    return result;
  },

  async updateMemberRole(sessionToken: string, input: UpdateMemberRoleInput) {
    const result = await auth.api.updateMemberRole({
      headers: buildHeaders(sessionToken),
      body: {
        memberId: input.memberId,
        role: input.role,
      },
    });
    return result;
  },

  async removeMember(sessionToken: string, input: RemoveMemberInput) {
    const result = await auth.api.removeMember({
      headers: buildHeaders(sessionToken),
      body: {
        memberIdOrEmail: input.memberId,
      },
    });
    return result;
  },

  async cancelInvitation(sessionToken: string, input: CancelInvitationInput) {
    const result = await auth.api.cancelInvitation({
      headers: buildHeaders(sessionToken),
      body: {
        invitationId: input.invitationId,
      },
    });
    return result;
  },
};
