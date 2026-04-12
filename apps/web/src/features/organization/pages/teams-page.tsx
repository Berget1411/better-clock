import { useQuery } from "@tanstack/react-query";

import { AppPage, AppPageHeader, AppSurface } from "@/components/app-page-shell";
import { authClient } from "@/lib/auth-client";
import { Skeleton } from "@open-learn/ui/components/skeleton";

import { MembersTable } from "../components/members-table";

export default function TeamsPage() {
  const sessionQuery = useQuery({
    queryKey: ["session"],
    queryFn: () => authClient.getSession(),
    staleTime: 15_000,
  });

  const activeOrgId = (sessionQuery.data?.data?.session as Record<string, unknown> | null)
    ?.activeOrganizationId as string | null | undefined;

  if (sessionQuery.isPending) {
    return (
      <div className="space-y-4 p-6">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!activeOrgId) {
    return (
      <div className="p-6 text-muted-foreground">
        No active organisation. Select one from the sidebar.
      </div>
    );
  }

  return (
    <AppPage>
      <AppPageHeader
        title="Teams"
        description="Manage members, pending invitations, and role changes for the active organisation."
      />
      <AppSurface>
        <MembersTable orgId={activeOrgId} />
      </AppSurface>
    </AppPage>
  );
}
