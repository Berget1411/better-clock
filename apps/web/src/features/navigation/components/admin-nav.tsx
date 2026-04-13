import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@open-learn/ui/components/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@open-learn/ui/components/sidebar";
import { Link } from "@tanstack/react-router";
import { ShieldIcon, UsersIcon } from "lucide-react";

import { authClient } from "@/lib/auth-client";

export function AdminNav() {
  const { isMobile } = useSidebar();
  const { data: session } = authClient.useSession();

  const role = (session?.user as { role?: string } | undefined)?.role;
  if (role !== "admin") return null;

  return (
    <SidebarMenu className="px-2 pb-2">
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton tooltip="Admin">
              <ShieldIcon />
              <span>Admin</span>
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side={isMobile ? "bottom" : "right"}
            align="start"
            sideOffset={4}
            className="min-w-48 rounded-none"
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Administration
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/app/admin/users">
                <UsersIcon className="mr-2 size-4" />
                User Management
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
