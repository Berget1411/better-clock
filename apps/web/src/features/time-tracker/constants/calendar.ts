import type { CalendarViewKey } from "../utils/calendar";

export type CalendarBillableFilter = "all" | "billable" | "non-billable";

export const CALENDAR_COPY = {
  pageTitle: "Calendar",
  pageDescription: "Browse and manage tracked time in a calendar view.",
  myEntries: "My entries",
  emptyTitle: "No tracked time in this range",
  emptyDescription:
    "Switch the date range, clear filters, or create a manual entry to start filling your calendar.",
  createEntry: "Create entry",
} as const;

export const CALENDAR_VIEW_OPTIONS: Array<{ label: string; value: CalendarViewKey }> = [
  { label: "Week", value: "week" },
  { label: "Day", value: "day" },
  { label: "Month", value: "month" },
];

export const CALENDAR_BILLABLE_FILTER_OPTIONS: Array<{
  label: string;
  value: CalendarBillableFilter;
}> = [
  { label: "All time", value: "all" },
  { label: "Billable", value: "billable" },
  { label: "Non-billable", value: "non-billable" },
];
