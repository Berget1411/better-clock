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

interface NavMainItem {
  title: string;
  to: ToPathOption<RegisteredRouter>;
  icon: LucideIcon;
}

interface NavMainProps {
  items: readonly NavMainItem[];
}

export default function NavMain({ items }: NavMainProps) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Main</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild isActive={pathname === item.to} tooltip={item.title}>
                <Link to={item.to as never}>
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
