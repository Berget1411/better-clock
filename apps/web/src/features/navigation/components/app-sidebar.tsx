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

const navMainItems = [
  {
    title: "Dashboard",
    to: "/",
    icon: HomeIcon,
  },
  {
    title: "Reports",
    to: "/reports",
    icon: BarChartIcon,
  },
  {
    title: "Time Tracker",
    to: "/tracker",
    icon: Clock3Icon,
  },
  {
    title: "Calendar",
    to: "/calendar",
    icon: CalendarIcon,
  },
  {
    title: "Kanban",
    to: "/kanban",
    icon: KanbanIcon,
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
    title: "Projects",
    subtitle: "Manage your projects",
    to: "/projects",
    icon: FolderIcon,
  },
  {
    title: "Teams",
    subtitle: "Manage your teams",
    to: "/teams",
    icon: UsersIcon,
  },
  {
    title: "Clients",
    subtitle: "Manage your clients",
    to: "/clients",
    icon: Building2Icon,
  },
  {
    title: "Tags",
    subtitle: "Manage your tags",
    to: "/tags",
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
