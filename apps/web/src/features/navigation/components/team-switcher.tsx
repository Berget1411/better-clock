import * as React from "react";
import { ChevronsUpDown, Plus } from "lucide-react";
import logoSvg from "@/public/logo.svg";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@open-learn/ui/components/dialog";
import { Button } from "@open-learn/ui/components/button";
import { Input } from "@open-learn/ui/components/input";
import { Label } from "@open-learn/ui/components/label";
import { authClient } from "@/lib/auth-client";
import { trpc } from "@/utils/trpc";
import { queryClient } from "@/utils/trpc";

export function TeamSwitcher() {
  const { isMobile } = useSidebar();
  const [createOpen, setCreateOpen] = React.useState(false);
  const [newOrgName, setNewOrgName] = React.useState("");
  const [creating, setCreating] = React.useState(false);

  // List all orgs for this user
  const orgsQuery = useQuery(trpc.organization.list.queryOptions());
  const orgs: Array<{ id: string; name: string; slug: string }> =
    (orgsQuery.data as Array<{ id: string; name: string; slug: string }> | undefined) ?? [];

  // Active org comes from Better Auth session
  const sessionQuery = useQuery({
    queryKey: ["session"],
    queryFn: () => authClient.getSession(),
    staleTime: 15_000,
  });
  const activeOrgId = (sessionQuery.data?.data?.session as Record<string, unknown> | null)
    ?.activeOrganizationId as string | null | undefined;

  const activeOrg = orgs.find((o) => o.id === activeOrgId) ?? orgs[0];

  async function switchOrg(orgId: string) {
    try {
      await authClient.organization.setActive({ organizationId: orgId });
      // All tRPC queries are org-scoped. Clear the entire cache so every
      // page refetches its data for the newly active organisation.
      await queryClient.invalidateQueries();
    } catch {
      toast.error("Failed to switch organisation");
    }
  }

  async function handleCreateOrg() {
    if (!newOrgName.trim()) return;
    setCreating(true);
    try {
      const slug = newOrgName
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

      const result = await authClient.organization.create({
        name: newOrgName.trim(),
        slug: `${slug}-${Date.now()}`,
      });

      if (result.data?.id) {
        await authClient.organization.setActive({ organizationId: result.data.id });
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ["session"] }),
          queryClient.invalidateQueries({ queryKey: [["organization", "list"]] }),
        ]);
      }

      setCreateOpen(false);
      setNewOrgName("");
      toast.success("Organisation created");
    } catch {
      toast.error("Failed to create organisation");
    } finally {
      setCreating(false);
    }
  }

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <div className="flex aspect-square size-8 items-center justify-center border border-white/10 bg-white/5">
                  <img src={logoSvg} alt="" className="size-6 dark:invert" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">
                    {activeOrg ? activeOrg.name : "Loading…"}
                  </span>
                </div>
                <ChevronsUpDown className="ml-auto" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-none"
              align="start"
              side={isMobile ? "bottom" : "right"}
              sideOffset={4}
            >
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                Organisations
              </DropdownMenuLabel>
              {orgs.map((org, index) => (
                <DropdownMenuItem
                  key={org.id}
                  onClick={() => switchOrg(org.id)}
                  className="gap-2 p-2"
                  data-active={org.id === activeOrg?.id}
                >
                  <span className="flex-1 truncate">{org.name}</span>
                  {org.id === activeOrg?.id && (
                    <span className="text-xs text-muted-foreground">active</span>
                  )}
                  {index < 9 && (
                    <span className="ml-auto text-xs text-muted-foreground">⌘{index + 1}</span>
                  )}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="gap-2 p-2" onClick={() => setCreateOpen(true)}>
                <div className="flex size-6 items-center justify-center border bg-transparent">
                  <Plus className="size-4" />
                </div>
                <div className="font-medium text-muted-foreground">New organisation</div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create organisation</DialogTitle>
          </DialogHeader>
          <div className="grid gap-2 py-2">
            <Label htmlFor="org-name">Name</Label>
            <Input
              id="org-name"
              placeholder="Acme Inc."
              value={newOrgName}
              onChange={(e) => setNewOrgName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && void handleCreateOrg()}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateOrg} disabled={!newOrgName.trim() || creating}>
              {creating ? "Creating…" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
