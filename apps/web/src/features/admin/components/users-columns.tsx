"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { MoreHorizontalIcon } from "lucide-react";

import { Badge } from "@open-learn/ui/components/badge";
import { Button } from "@open-learn/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@open-learn/ui/components/dropdown-menu";
import { authClient } from "@/lib/auth-client";
import { queryClient } from "@/utils/trpc";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role?: string | null;
  banned?: boolean | null;
  createdAt: Date | string;
}

const USERS_QUERY_KEY = ["admin-users"];

function ActionsCell({ user }: { user: AdminUser }) {
  const [loading, setLoading] = React.useState(false);

  async function run(fn: () => Promise<unknown>) {
    setLoading(true);
    try {
      await fn();
      await queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Action failed");
    } finally {
      setLoading(false);
    }
  }

  const isBanned = !!user.banned;
  const isAdmin = user.role === "admin";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="size-8" disabled={loading}>
          <MoreHorizontalIcon className="size-4" />
          <span className="sr-only">Actions</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="rounded-none">
        {isAdmin ? (
          <DropdownMenuItem
            onClick={() => run(() => authClient.admin.setRole({ userId: user.id, role: "user" }))}
          >
            Set role: user
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem
            onClick={() => run(() => authClient.admin.setRole({ userId: user.id, role: "admin" }))}
          >
            Set role: admin
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        {isBanned ? (
          <DropdownMenuItem
            onClick={() => run(() => authClient.admin.unbanUser({ userId: user.id }))}
          >
            Unban user
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem
            className="text-amber-600"
            onClick={() => run(() => authClient.admin.banUser({ userId: user.id }))}
          >
            Ban user
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-destructive"
          onClick={() => run(() => authClient.admin.removeUser({ userId: user.id }))}
        >
          Delete user
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export const usersColumns: ColumnDef<AdminUser>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => <span className="font-medium">{row.original.name || "—"}</span>,
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => <span className="text-muted-foreground">{row.original.email}</span>,
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
      const role = row.original.role ?? "user";
      return <Badge variant={role === "admin" ? "default" : "secondary"}>{role}</Badge>;
    },
  },
  {
    accessorKey: "banned",
    header: "Status",
    cell: ({ row }) =>
      row.original.banned ? (
        <Badge variant="destructive">Banned</Badge>
      ) : (
        <Badge variant="outline" className="border-green-200 text-green-600">
          Active
        </Badge>
      ),
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) => {
      const date = row.original.createdAt;
      return (
        <span className="text-muted-foreground text-sm">{new Date(date).toLocaleDateString()}</span>
      );
    },
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => <ActionsCell user={row.original} />,
  },
];

export { USERS_QUERY_KEY };
