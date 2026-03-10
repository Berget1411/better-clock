import { z } from "zod";

export const orgRoleSchema = z.enum(["owner", "admin", "member"]);
export type OrgRole = z.infer<typeof orgRoleSchema>;

export const createOrganizationInputSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers and hyphens")
    .optional(),
});

export const inviteMemberInputSchema = z.object({
  email: z.string().email(),
  role: orgRoleSchema.default("member"),
  organizationId: z.string().optional(),
});

export const updateMemberRoleInputSchema = z.object({
  memberId: z.string(),
  role: orgRoleSchema,
});

export const removeMemberInputSchema = z.object({
  memberId: z.string(),
});

export const cancelInvitationInputSchema = z.object({
  invitationId: z.string(),
});

export type CreateOrganizationInput = z.infer<typeof createOrganizationInputSchema>;
export type InviteMemberInput = z.infer<typeof inviteMemberInputSchema>;
export type UpdateMemberRoleInput = z.infer<typeof updateMemberRoleInputSchema>;
export type RemoveMemberInput = z.infer<typeof removeMemberInputSchema>;
export type CancelInvitationInput = z.infer<typeof cancelInvitationInputSchema>;
