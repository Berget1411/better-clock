import {
  BotIcon,
  FolderIcon,
  HomeIcon,
  Clock3Icon,
  ListTodoIcon,
  TagIcon,
  BarChartIcon,
  CalendarIcon,
  UsersIcon,
  Building2Icon,
  KanbanIcon,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarRail,
} from "@open-learn/ui/components/sidebar";
import { TeamSwitcher } from "./team-switcher";
import NavMain from "./nav-main";
import NavUser from "./nav-user";
import NavManage from "./nav-manage";
import { env } from "@open-learn/env/web";

const baseNavMainItems = [
  {
    title: "Dashboard",
    to: "/app",
    icon: HomeIcon,
  },
  {
    title: "Reports",
    to: "/app/reports",
    icon: BarChartIcon,
  },
  {
    title: "Time Tracker",
    to: "/app/tracker",
    icon: Clock3Icon,
  },
  {
    title: "Tasks",
    to: "/app/tasks",
    icon: ListTodoIcon,
  },
  {
    title: "Calendar",
    to: "/app/calendar",
    icon: CalendarIcon,
  },
] as const;

const aiNavItem = {
  title: "AI Chat",
  to: "/app/ai",
  icon: BotIcon,
} as const;

const navMainItems = env.VITE_AI_ENABLED
  ? ([...baseNavMainItems, aiNavItem] as const)
  : baseNavMainItems;

const navManageItems = [
  {
    title: "Projects",
    subtitle: "Manage your projects",
    to: "/app/projects",
    icon: FolderIcon,
  },
  {
    title: "Teams",
    subtitle: "Manage your teams",
    to: "/app/teams",
    icon: UsersIcon,
  },
  {
    title: "Clients",
    subtitle: "Manage your clients",
    to: "/app/clients",
    icon: Building2Icon,
  },
  {
    title: "Tags",
    subtitle: "Manage your tags",
    to: "/app/tags",
    icon: TagIcon,
  },
] as const;

export default function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <TeamSwitcher />
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
