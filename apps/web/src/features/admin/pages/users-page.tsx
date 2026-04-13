import { useQuery } from "@tanstack/react-query";

import { AppPage, AppPageHeader, AppSurface } from "@/components/app-page-shell";
import { authClient } from "@/lib/auth-client";
import { Skeleton } from "@open-learn/ui/components/skeleton";

import { type AdminUser, USERS_QUERY_KEY, usersColumns } from "../components/users-columns";
import { UsersDataTable } from "../components/users-data-table";

export default function UsersPage() {
  const usersQuery = useQuery({
    queryKey: USERS_QUERY_KEY,
    queryFn: async () => {
      const result = await authClient.admin.listUsers({
        query: { limit: 100 },
      });
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
  });

  if (usersQuery.isPending) {
    return (
      <div className="space-y-4 p-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (usersQuery.isError) {
    return (
      <div className="p-6 text-destructive">Failed to load users: {usersQuery.error.message}</div>
    );
  }

  const users: AdminUser[] = (usersQuery.data?.users ?? []) as AdminUser[];

  return (
    <AppPage>
      <AppPageHeader
        title="User Management"
        description="View and manage all users registered in the application."
      />
      <AppSurface>
        <UsersDataTable columns={usersColumns} data={users} />
      </AppSurface>
    </AppPage>
  );
}
