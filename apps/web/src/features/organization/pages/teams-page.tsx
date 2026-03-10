import { useQuery } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";
import { MembersTable } from "@/features/organization/components/members-table";
import { Skeleton } from "@open-learn/ui/components/skeleton";

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
      <div className="p-6 space-y-4">
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
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Teams</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage the members of your organisation.
        </p>
      </div>
      <MembersTable orgId={activeOrgId} />
    </div>
  );
}
