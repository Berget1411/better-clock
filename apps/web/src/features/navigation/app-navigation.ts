import type { LucideIcon } from "lucide-react";

import {
  BarChartIcon,
  BotIcon,
  Building2Icon,
  CalendarIcon,
  Clock3Icon,
  FolderIcon,
  HomeIcon,
  ListTodoIcon,
  TagIcon,
  UsersIcon,
} from "lucide-react";

export type AppNavSectionId = "track" | "review" | "manage";

export interface AppRouteMeta {
  title: string;
  description?: string;
  section: AppNavSectionId;
  legacyPaths?: string[];
}

export interface AppNavItem extends AppRouteMeta {
  id: string;
  to: string;
  icon: LucideIcon;
  matchPaths: string[];
  showInSidebar: boolean;
}

export interface AppNavSection {
  id: AppNavSectionId;
  label: string;
  items: readonly AppNavItem[];
}

const APP_NAV_SECTION_LABELS: Record<AppNavSectionId, string> = {
  track: "Track",
  review: "Review",
  manage: "Manage",
};

const APP_NAV_ITEMS: readonly AppNavItem[] = [
  {
    id: "time-tracker",
    title: "Time Tracker",
    description: "Capture work as it happens with a timer or quick manual entry.",
    to: "/app",
    icon: Clock3Icon,
    section: "track",
    legacyPaths: ["/app/tracker"],
    matchPaths: ["/app", "/app/tracker"],
    showInSidebar: true,
  },
  {
    id: "calendar",
    title: "Calendar",
    description: "Review entries on a schedule and adjust sessions in context.",
    to: "/app/calendar",
    icon: CalendarIcon,
    section: "track",
    matchPaths: ["/app/calendar"],
    showInSidebar: true,
  },
  {
    id: "tasks",
    title: "Tasks",
    description: "Keep delivery work organized across table and kanban views.",
    to: "/app/tasks",
    icon: ListTodoIcon,
    section: "track",
    matchPaths: ["/app/tasks"],
    showInSidebar: true,
  },
  {
    id: "overview",
    title: "Overview",
    description: "See recent trends, leading projects, and the shape of your work.",
    to: "/app/overview",
    icon: HomeIcon,
    section: "review",
    legacyPaths: ["/app/dashboard"],
    matchPaths: ["/app/overview", "/app/dashboard"],
    showInSidebar: true,
  },
  {
    id: "reports",
    title: "Reports",
    description: "Filter, export, and audit tracked time with confidence.",
    to: "/app/reports",
    icon: BarChartIcon,
    section: "review",
    matchPaths: ["/app/reports"],
    showInSidebar: true,
  },
  {
    id: "projects",
    title: "Projects",
    description: "Define the work you track, its access, and billing setup.",
    to: "/app/manage/projects",
    icon: FolderIcon,
    section: "manage",
    legacyPaths: ["/app/projects"],
    matchPaths: ["/app/manage/projects", "/app/projects"],
    showInSidebar: true,
  },
  {
    id: "clients",
    title: "Clients",
    description: "Maintain the people and organisations that work is billed to.",
    to: "/app/manage/clients",
    icon: Building2Icon,
    section: "manage",
    legacyPaths: ["/app/clients"],
    matchPaths: ["/app/manage/clients", "/app/clients"],
    showInSidebar: true,
  },
  {
    id: "teams",
    title: "Teams",
    description: "Manage organisation membership, roles, and invitations.",
    to: "/app/manage/teams",
    icon: UsersIcon,
    section: "manage",
    legacyPaths: ["/app/teams"],
    matchPaths: ["/app/manage/teams", "/app/teams"],
    showInSidebar: true,
  },
  {
    id: "tags",
    title: "Tags",
    description: "Keep your tracking taxonomy tidy and easy to scan.",
    to: "/app/manage/tags",
    icon: TagIcon,
    section: "manage",
    legacyPaths: ["/app/tags"],
    matchPaths: ["/app/manage/tags", "/app/tags"],
    showInSidebar: true,
  },
  {
    id: "ai",
    title: "AI Chat",
    description: "Experimental assistant tools for the workspace.",
    to: "/app/ai",
    icon: BotIcon,
    section: "review",
    matchPaths: ["/app/ai"],
    showInSidebar: false,
  },
] as const;

function matchesPathPattern(pathname: string, pattern: string) {
  if (pattern.endsWith("/*")) {
    const prefix = pattern.slice(0, -2);
    return pathname === prefix || pathname.startsWith(`${prefix}/`);
  }

  return pathname === pattern;
}

export function getAppNavigation() {
  return APP_NAV_ITEMS;
}

export function getAppNavSectionLabel(sectionId: AppNavSectionId) {
  return APP_NAV_SECTION_LABELS[sectionId];
}

export function isAppNavItemActive(item: AppNavItem, pathname: string) {
  return item.matchPaths.some((pattern) => matchesPathPattern(pathname, pattern));
}

export function getAppRouteMeta(pathname: string): AppRouteMeta | null {
  const item = APP_NAV_ITEMS.find((entry) => isAppNavItemActive(entry, pathname));

  if (!item) {
    return null;
  }

  return {
    title: item.title,
    description: item.description,
    section: item.section,
    legacyPaths: item.legacyPaths,
  };
}

export function getSidebarSections(): AppNavSection[] {
  return (Object.keys(APP_NAV_SECTION_LABELS) as AppNavSectionId[]).map((sectionId) => ({
    id: sectionId,
    label: APP_NAV_SECTION_LABELS[sectionId],
    items: APP_NAV_ITEMS.filter((item) => item.showInSidebar && item.section === sectionId),
  }));
}
