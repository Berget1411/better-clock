import {
  BotIcon,
  CommandIcon,
  FolderIcon,
  HomeIcon,
  ListTodoIcon,
  Clock,
  TagIcon,
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
} from "@open-learn/ui/components/sidebar";

import NavMain from "./nav-main";
import NavUser from "./nav-user";
import NavManage from "./nav-manage";

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

const navManageItems = [
  {
    title: "Organization",
    to: "/",
    icon: CommandIcon,
  },
  {
    title: "Projects",
    subtitle: "Shipping list",
    to: "/todos",
    icon: FolderIcon,
  },
  {
    title: "Clients",
    subtitle: "AI experiments",
    to: "/ai",
    icon: BotIcon,
  },
  {
    title: "Tags",
    subtitle: "Manage your tags",
    to: "/ai",
    icon: TagIcon,
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
        <NavManage items={navManageItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
