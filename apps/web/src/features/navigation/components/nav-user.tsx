import * as React from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@open-learn/ui/components/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@open-learn/ui/components/dropdown-menu";
import { Skeleton } from "@open-learn/ui/components/skeleton";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@open-learn/ui/components/sidebar";
import { Link, useNavigate } from "@tanstack/react-router";
import { ChevronsUpDownIcon, LogOutIcon, Settings2Icon, SunMoonIcon } from "lucide-react";

import { useTheme } from "@/components/theme-provider";
import { AUTH_REDIRECT } from "@/features/auth/constants";
import { invalidateSessionCache } from "@/features/auth/utils/require-auth";
import { authClient } from "@/lib/auth-client";

import SettingsDialog from "../../auth/components/settings-dialog";

function getInitials(name?: string | null) {
  if (!name) {
    return "OL";
  }

  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export default function NavUser() {
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);
  const navigate = useNavigate();
  const { isMobile } = useSidebar();
  const { setTheme, theme } = useTheme();
  const { data: session, isPending, refetch } = authClient.useSession();

  const currentTheme = theme ?? "system";

  if (isPending) {
    return <Skeleton className="h-12 w-full rounded-none" />;
  }

  if (!session) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton asChild size="lg">
            <Link to="/login">
              <span>Sign In</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton size="lg" tooltip={session.user.name ?? "Account"}>
                <Avatar className="shrink-0 rounded-none">
                  <AvatarImage src={session.user.image ?? undefined} alt={session.user.name} />
                  <AvatarFallback className="rounded-none">
                    {getInitials(session.user.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="grid min-w-0 flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{session.user.name}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {session.user.email}
                  </span>
                </div>
                <ChevronsUpDownIcon className="ml-auto size-4 shrink-0" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="min-w-56 rounded-none"
              side={isMobile ? "bottom" : "right"}
              align="end"
            >
              <DropdownMenuLabel>{session.user.name}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem>{session.user.email}</DropdownMenuItem>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <SunMoonIcon />
                    Theme
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <DropdownMenuRadioGroup value={currentTheme} onValueChange={setTheme}>
                      <DropdownMenuRadioItem value="light">Light</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="dark">Dark</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="system">System</DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                <DropdownMenuItem onSelect={() => setIsSettingsOpen(true)}>
                  <Settings2Icon />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => {
                    authClient.signOut({
                      fetchOptions: {
                        onSuccess: () => {
                          invalidateSessionCache();
                          navigate({ to: AUTH_REDIRECT.afterSignOut });
                        },
                      },
                    });
                  }}
                >
                  <LogOutIcon />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>

      <SettingsDialog
        key={`${session.user.name ?? ""}-${session.user.image ?? ""}`}
        open={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
        user={session.user}
        refetchSession={refetch}
      />
    </>
  );
}
