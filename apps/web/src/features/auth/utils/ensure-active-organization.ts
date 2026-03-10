import { authClient } from "@/lib/auth-client";
import { queryClient } from "@/utils/trpc";

/**
 * Called after the user is confirmed to be authenticated.
 *
 * Responsibilities:
 * 1. Always ensure the user has a personal org (slug: "personal-<userId>").
 *    This must exist even when the user is also a member of other organisations.
 * 2. If no org is currently active, set the personal org as the active one.
 * 3. After any mutation, invalidate the session + org list caches so the sidebar
 *    immediately shows the correct active organisation without requiring a reload.
 *
 * This is intentionally a best-effort helper; it should not block the app from loading
 * if the network is temporarily unavailable.
 */
export async function ensureActiveOrganization(): Promise<void> {
  try {
    const session = await authClient.getSession();
    const user = session.data?.user;
    if (!user?.id) return;

    const activeOrgId = (session.data?.session as Record<string, unknown> | null)
      ?.activeOrganizationId as string | null | undefined;

    const orgsResult = await authClient.organization.list();
    const orgs = (orgsResult.data ?? []) as Array<{ id: string; slug?: string | null }>;

    const personalSlug = `personal-${user.id}`;
    const hasPersonalOrg = orgs.some((o) => o.slug === personalSlug);

    let personalOrgId: string | null = orgs.find((o) => o.slug === personalSlug)?.id ?? null;
    let didMutate = false;

    if (!hasPersonalOrg) {
      // Create the personal org. This runs on first login AND whenever the user
      // joins an external org before their personal one was created.
      const personalName = user.name ? `${user.name}'s Workspace` : "My Workspace";

      const created = await authClient.organization.create({
        name: personalName,
        slug: personalSlug,
      });

      if (created.data?.id) {
        personalOrgId = created.data.id;
      } else if (created.error) {
        // Slug collision means it already exists — re-fetch to get the id.
        const retry = await authClient.organization.list();
        const found = (retry.data ?? []) as Array<{ id: string; slug?: string | null }>;
        personalOrgId = found.find((o) => o.slug === personalSlug)?.id ?? null;
      }
      didMutate = true;
    }

    if (!activeOrgId && personalOrgId) {
      // No active org — default to the personal one.
      await authClient.organization.setActive({ organizationId: personalOrgId });
      didMutate = true;
    }

    if (didMutate) {
      await invalidateOrgCaches();
    }
  } catch {
    // Non-fatal: the app will still load, just without an active org context.
  }
}

async function invalidateOrgCaches() {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: ["session"] }),
    queryClient.invalidateQueries({ queryKey: [["organization", "list"]] }),
    queryClient.invalidateQueries({ queryKey: [["organization", "getActive"]] }),
  ]);
}
