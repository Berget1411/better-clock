import { useQuery } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";
import { Skeleton } from "@open-learn/ui/components/skeleton";
import { TagsTable } from "@/features/tags/components/tags-table";
import { TAGS_COPY } from "@/features/tags/constants";

export default function TagsPage() {
  const sessionQuery = useQuery({
    queryKey: ["session"],
    queryFn: () => authClient.getSession(),
    staleTime: 15_000,
  });

  if (sessionQuery.isPending) {
    return (
      <div className="p-6 space-y-4">
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
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">{TAGS_COPY.pageTitle}</h1>
      <TagsTable />
    </div>
  );
}
