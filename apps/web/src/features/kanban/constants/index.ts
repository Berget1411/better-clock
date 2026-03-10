export type { KanbanBoardFull, CardPriority } from "@open-learn/api/modules/kanban/kanban.schema";
export { CARD_PRIORITIES } from "@open-learn/api/modules/kanban/kanban.schema";

export const PRIORITY_LABEL: Record<string, string> = {
  none: "None",
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};

export const PRIORITY_COLOR: Record<string, string> = {
  none: "text-muted-foreground",
  low: "text-sky-500",
  medium: "text-yellow-500",
  high: "text-orange-500",
  urgent: "text-destructive",
};

export const BOARD_COLORS = [
  "#6366f1", // violet
  "#0ea5e9", // sky
  "#10b981", // emerald
  "#f59e0b", // amber
  "#ef4444", // red
  "#8b5cf6", // purple
  "#ec4899", // pink
  "#14b8a6", // teal
] as const;

export const COLUMN_COLORS = [
  "#94a3b8", // slate
  "#6366f1", // violet
  "#0ea5e9", // sky
  "#10b981", // emerald
  "#f59e0b", // amber
  "#ef4444", // red
  "#8b5cf6", // purple
] as const;
