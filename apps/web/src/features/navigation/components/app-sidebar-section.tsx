import { Link, useRouterState } from "@tanstack/react-router";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@open-learn/ui/components/sidebar";

import type { AppNavSection } from "../app-navigation";
import { isAppNavItemActive } from "../app-navigation";

interface AppSidebarSectionProps {
  section: AppNavSection;
}

export function AppSidebarSection({ section }: AppSidebarSectionProps) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-[10px] font-medium uppercase tracking-[0.18em] text-sidebar-foreground/55">
        {section.label}
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {section.items.map((item) => (
            <SidebarMenuItem key={item.id}>
              <SidebarMenuButton
                asChild
                isActive={isAppNavItemActive(item, pathname)}
                tooltip={item.title}
              >
                <Link to={item.to}>
                  <item.icon />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
