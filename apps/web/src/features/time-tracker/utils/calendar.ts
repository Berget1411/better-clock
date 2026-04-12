import type { TrackerEntry } from "@open-learn/api/modules/time-tracker/time-tracker.schema";
import type { Formats } from "react-big-calendar";
import type { TrackerOverviewRange } from "./date-time";

import {
  addDays,
  addMonths,
  addWeeks,
  endOfMonth,
  endOfWeek,
  format,
  getDay,
  parse,
  startOfDay,
  startOfMonth,
  startOfWeek as startOfWeekDateFns,
} from "date-fns";
import { enUS } from "date-fns/locale";
import { dateFnsLocalizer } from "react-big-calendar";

import { getElapsedSeconds, getEntryDurationSeconds, startOfWeek } from "./date-time";

export type CalendarViewKey = "week" | "day" | "month";
export type CalendarSheetMode = "create" | "edit";

export interface CalendarEntryEventResource {
  entryId: number;
  description: string;
  projectName: string;
  projectId: number | null;
  taskTitle: string | null;
  taskDisplayKey: string | null;
  tagNames: string[];
  isBillable: boolean;
  isActive: boolean;
  durationSeconds: number;
  canEdit: boolean;
}

export interface CalendarEntryEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  resource: CalendarEntryEventResource;
}

const locales = {
  en: enUS,
};

export const calendarLocalizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: (date: Date) => startOfWeekDateFns(date, { weekStartsOn: 1 }),
  getDay,
  locales,
});

export const CALENDAR_FORMATS: Partial<Formats> = {
  monthHeaderFormat: "MMMM yyyy",
  dayHeaderFormat: "EEEE, MMM d",
  dayRangeHeaderFormat: ({ start, end }) => `${format(start, "MMM d")} – ${format(end, "MMM d")}`,
  weekdayFormat: "EEE",
  dayFormat: "EEE d",
  agendaDateFormat: "EEE, MMM d",
  agendaTimeFormat: "HH:mm",
  timeGutterFormat: "HH:mm",
};

function getEventTitle(entry: TrackerEntry) {
  const trimmedDescription = entry.description.trim();

  if (trimmedDescription) {
    return trimmedDescription;
  }

  if (entry.task?.title) {
    return entry.task.title;
  }

  return "No description";
}

function toCalendarEvent(entry: TrackerEntry, options?: { isActive?: boolean; now?: Date }) {
  const isActive = options?.isActive ?? false;
  const now = options?.now ?? new Date();
  const start = new Date(entry.startAt);
  const end = new Date(entry.endAt ?? now.toISOString());

  return {
    id: `${isActive ? "active" : "entry"}-${entry.id}`,
    title: getEventTitle(entry),
    start,
    end,
    resource: {
      entryId: entry.id,
      description: entry.description,
      projectName: entry.project?.name ?? "Without project",
      projectId: entry.project?.id ?? null,
      taskTitle: entry.task?.title ?? null,
      taskDisplayKey: entry.task?.displayKey ?? null,
      tagNames: entry.tags.map((tag) => tag.name),
      isBillable: entry.isBillable,
      isActive,
      durationSeconds: isActive
        ? getElapsedSeconds(entry.startAt, now)
        : getEntryDurationSeconds(entry),
      canEdit: !isActive && entry.endAt !== null,
    },
  } satisfies CalendarEntryEvent;
}

export function mapTrackerEntriesToCalendarEvents({
  entries,
  activeEntry,
  now = new Date(),
}: {
  entries: TrackerEntry[];
  activeEntry?: TrackerEntry | null;
  now?: Date;
}) {
  const mappedEntries = entries.map((entry) => toCalendarEvent(entry, { now }));

  if (!activeEntry) {
    return mappedEntries;
  }

  return [...mappedEntries, toCalendarEvent(activeEntry, { isActive: true, now })];
}

export function getCalendarRange(view: CalendarViewKey, focusedDate: Date): TrackerOverviewRange {
  if (view === "day") {
    const from = startOfDay(focusedDate);
    const to = addDays(from, 1);

    return {
      from: from.toISOString(),
      to: to.toISOString(),
    };
  }

  if (view === "week") {
    const from = startOfWeek(focusedDate);
    const to = addDays(from, 7);

    return {
      from: from.toISOString(),
      to: to.toISOString(),
    };
  }

  const firstVisibleDay = startOfWeekDateFns(startOfMonth(focusedDate), { weekStartsOn: 1 });
  const lastVisibleDay = endOfWeek(endOfMonth(focusedDate), { weekStartsOn: 1 });

  return {
    from: firstVisibleDay.toISOString(),
    to: addDays(startOfDay(lastVisibleDay), 1).toISOString(),
  };
}

export function getCalendarViewTitle(view: CalendarViewKey, focusedDate: Date) {
  if (view === "day") {
    return format(focusedDate, "EEEE, MMMM d");
  }

  if (view === "week") {
    const start = startOfWeek(focusedDate);
    const end = addDays(start, 6);

    return `${format(start, "MMM d")} – ${format(end, "MMM d")}`;
  }

  return format(focusedDate, "MMMM yyyy");
}

export function getDefaultSlotEnd(start: Date) {
  const end = new Date(start);
  end.setHours(end.getHours() + 1, start.getMinutes(), 0, 0);
  return end;
}

export function shiftCalendarDate(view: CalendarViewKey, focusedDate: Date, direction: -1 | 1) {
  if (view === "day") {
    return addDays(focusedDate, direction);
  }

  if (view === "week") {
    return addWeeks(focusedDate, direction);
  }

  return addMonths(focusedDate, direction);
}

export function getCalendarEventClassName(event: CalendarEntryEvent) {
  if (event.resource.isActive) {
    return "calendar-entry-event calendar-entry-event--active";
  }

  return event.resource.isBillable
    ? "calendar-entry-event calendar-entry-event--billable"
    : "calendar-entry-event calendar-entry-event--tracked";
}

export function formatCalendarEventDuration(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  if (hours === 0) {
    return `${String(minutes).padStart(2, "0")}m`;
  }

  return `${hours}h ${String(minutes).padStart(2, "0")}m`;
}
