import {
  BotIcon,
  FolderIcon,
  HomeIcon,
  Clock3Icon,
  ListTodoIcon,
  TagIcon,
  BarChartIcon,
  CalendarIcon,
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

const teams = [
  {
    name: "Acme Inc.",
    plan: "Pro",
  },
  {
    name: "Globex Corp.",
    plan: "Free",
  },
  {
    name: "Wonka Industries",
    plan: "Free",
  },
];

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
          <TeamSwitcher teams={teams} />
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
