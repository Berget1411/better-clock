import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarRail,
} from "@open-learn/ui/components/sidebar";

import { getSidebarSections } from "../app-navigation";
import { AdminNav } from "./admin-nav";
import { AppSidebarSection } from "./app-sidebar-section";
import { TeamSwitcher } from "./team-switcher";
import NavUser from "./nav-user";

export default function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const sections = getSidebarSections();

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <TeamSwitcher />
        </SidebarMenu>
      </SidebarHeader>
      <AdminNav />
      <SidebarContent>
        {sections.map((section) => (
          <AppSidebarSection key={section.id} section={section} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
