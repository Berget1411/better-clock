import { useQuery } from "@tanstack/react-query";

import { AppPage, AppPageHeader, AppSurface } from "@/components/app-page-shell";
import { authClient } from "@/lib/auth-client";
import { Skeleton } from "@open-learn/ui/components/skeleton";

import { TagsTable } from "../components/tags-table";
import { TAGS_COPY } from "../constants";

export default function TagsPage() {
  const sessionQuery = useQuery({
    queryKey: ["session"],
    queryFn: () => authClient.getSession(),
    staleTime: 15_000,
  });

  if (sessionQuery.isPending) {
    return (
      <div className="space-y-4 p-6">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const activeOrgId = (sessionQuery.data?.data?.session as Record<string, unknown> | null)
    ?.activeOrganizationId as string | null | undefined;

  if (!activeOrgId) {
    return <div className="p-6 text-muted-foreground">{TAGS_COPY.noOrg}</div>;
  }

  return (
    <AppPage>
      <AppPageHeader
        title={TAGS_COPY.pageTitle}
        description="Maintain a clear tagging system so filters, reports, and time entry stay predictable."
      />
      <AppSurface>
        <TagsTable />
      </AppSurface>
    </AppPage>
  );
}
