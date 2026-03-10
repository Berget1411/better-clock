import type { LucideIcon } from "lucide-react";
import { Link, useRouterState } from "@tanstack/react-router";
import type { RegisteredRouter, ToPathOption } from "@tanstack/react-router";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@open-learn/ui/components/sidebar";

interface NavManageItem {
  title: string;
  to: ToPathOption<RegisteredRouter>;
  icon: LucideIcon;
}

interface NavManageProps {
  items: readonly NavManageItem[];
}

export default function NavManage({ items }: NavManageProps) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Manage</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild isActive={pathname === item.to} tooltip={item.title}>
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
