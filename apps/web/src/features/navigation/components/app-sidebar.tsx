import {
  BotIcon,
  BookOpenIcon,
  CommandIcon,
  FolderIcon,
  HomeIcon,
  LifeBuoyIcon,
  ListTodoIcon,
  Clock,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@open-learn/ui/components/sidebar";

import NavMain from "./nav-main";
import NavSecondary from "./nav-secondary";
import NavUser from "./nav-user";
import NavWorkspaces from "./nav-workspaces";

const navMainItems = [
  {
    title: "Dashboard",
    to: "/",
    icon: HomeIcon,
  },
  {
    title: "Todos",
    to: "/todos",
    icon: ListTodoIcon,
  },
  {
    title: "AI Chat",
    to: "/ai",
    icon: BotIcon,
  },
] as const;

const workspaceItems = [
  {
    name: "Core",
    subtitle: "Main workspace",
    to: "/",
    icon: CommandIcon,
  },
  {
    name: "Tasks",
    subtitle: "Shipping list",
    to: "/todos",
    icon: FolderIcon,
  },
  {
    name: "Lab",
    subtitle: "AI experiments",
    to: "/ai",
    icon: BotIcon,
  },
] as const;

const secondaryItems = [
  {
    title: "Sidebar Docs",
    href: "https://ui.shadcn.com/docs/components/sidebar",
    icon: BookOpenIcon,
  },
  {
    title: "Router Docs",
    href: "https://tanstack.com/router/latest",
    icon: LifeBuoyIcon,
  },
] as const;

export default function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild size="lg" tooltip="open-learn">
              <Link to="/">
                <div className="flex aspect-square size-8 shrink-0 items-center justify-center rounded-none bg-sidebar-primary text-sidebar-primary-foreground">
                  <Clock />
                </div>
                <div className="grid min-w-0 flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Open Clock</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMainItems} />
        <SidebarSeparator />
        <NavWorkspaces items={workspaceItems} />
        <SidebarSeparator />
        <NavSecondary items={secondaryItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
