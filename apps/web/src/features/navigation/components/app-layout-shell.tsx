import type { CSSProperties, ReactNode } from "react";

import AppSidebar from "@/features/navigation/components/app-sidebar";
import { Separator } from "@open-learn/ui/components/separator";
import {
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarProvider,
  SidebarTrigger,
} from "@open-learn/ui/components/sidebar";
import { Skeleton } from "@open-learn/ui/components/skeleton";
import { useRouterState } from "@tanstack/react-router";

const titles: Record<string, string> = {
  "/": "Dashboard",
  "/ai": "AI Chat",
  "/reports": "Reports",
  "/tags": "Tags",
  "/tasks": "Tasks",
  "/todos": "Todos",
  "/tracker": "Time Tracker",
};

const pendingListItems = ["one", "two", "three", "four", "five"] as const;

export function AppLayoutShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  return (
    <SidebarProvider style={{ "--sidebar-width": "12rem" } as CSSProperties}>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-4" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">{titles[pathname] ?? "open-learn"}</p>
          </div>
        </header>
        <div className="flex min-h-0 flex-1 flex-col p-4 md:p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export function AppLayoutPending() {
  return (
    <AppLayoutShell>
      <div className="grid gap-6">
        <section className="grid gap-4 lg:grid-cols-[minmax(0,1.8fr)_minmax(260px,1fr)]">
          <Skeleton className="h-48 rounded-none border border-border/60 bg-muted/40" />
          <div className="grid gap-4">
            <Skeleton className="h-24 rounded-none border border-border/60 bg-muted/40" />
            <Skeleton className="h-24 rounded-none border border-border/60 bg-muted/40" />
          </div>
        </section>

        <section className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,1fr)]">
          <div className="border border-border/60 bg-card/40 p-4">
            <Skeleton className="mb-4 h-5 w-40 rounded-none" />
            <Skeleton className="mb-6 h-4 w-64 rounded-none" />
            <Skeleton className="h-[280px] rounded-none border border-border/50 bg-muted/30" />
          </div>

          <div className="border border-border/60 bg-card/40 p-4">
            <Skeleton className="mb-4 h-5 w-32 rounded-none" />
            <SidebarMenu>
              {pendingListItems.map((item) => (
                <SidebarMenuItem key={item}>
                  <SidebarMenuSkeleton showIcon />
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </div>
        </section>
      </div>
    </AppLayoutShell>
  );
}
