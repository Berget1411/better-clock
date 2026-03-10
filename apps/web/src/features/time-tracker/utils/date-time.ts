import type { TrackerEntry } from "@open-learn/api/modules/time-tracker/time-tracker.schema";

export interface TrackerOverviewRange {
  from: string;
  to: string;
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}

export function startOfWeek(date: Date) {
  const result = new Date(date);
  const day = result.getDay();
  const diff = day === 0 ? -6 : 1 - day;

  result.setHours(0, 0, 0, 0);
  result.setDate(result.getDate() + diff);

  return result;
}

export function getTrackerOverviewRange(now = new Date()): TrackerOverviewRange {
  const end = new Date(startOfWeek(now));
  end.setDate(end.getDate() + 7);

  const start = new Date(startOfWeek(now));
  start.setDate(start.getDate() - 21);

  return {
    from: start.toISOString(),
    to: end.toISOString(),
  };
}

export function toLocalDateInputValue(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function toLocalTimeInputValue(date: Date) {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function combineDateAndTime(dateValue: string, timeValue: string) {
  if (!dateValue || !timeValue) {
    return null;
  }

  const [year, month, day] = dateValue.split("-").map(Number);
  const [hours, minutes] = timeValue.split(":").map(Number);

  const date = new Date(year, month - 1, day, hours, minutes, 0, 0);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

export function getDefaultManualValues() {
  const now = new Date();
  const end = new Date(now);
  const start = new Date(now);
  start.setMinutes(0, 0, 0);
  end.setHours(start.getHours() + 1);

  return {
    description: "",
    date: toLocalDateInputValue(start),
    startTime: toLocalTimeInputValue(start),
    endTime: toLocalTimeInputValue(end),
    projectId: null as number | null,
    tagIds: [] as number[],
    isBillable: false,
  };
}

export function getTimerFormValues(entry?: TrackerEntry | null) {
  return {
    description: entry?.description ?? "",
    projectId: entry?.project?.id ?? null,
    tagIds: entry?.tags.map((tag) => tag.id) ?? [],
    isBillable: entry?.isBillable ?? false,
  };
}

export function getEditableEntryValues(entry: TrackerEntry) {
  const start = new Date(entry.startAt);
  const end = new Date(entry.endAt ?? entry.startAt);

  return {
    description: entry.description,
    date: toLocalDateInputValue(start),
    startTime: toLocalTimeInputValue(start),
    endTime: toLocalTimeInputValue(end),
    projectId: entry.project?.id ?? null,
    tagIds: entry.tags.map((tag) => tag.id),
    isBillable: entry.isBillable,
  };
}

export function getEntryDurationSeconds(entry: TrackerEntry) {
  if (!entry.endAt) {
    return 0;
  }

  return Math.max(
    0,
    Math.floor((new Date(entry.endAt).getTime() - new Date(entry.startAt).getTime()) / 1000),
  );
}

export function getElapsedSeconds(startAt: string, now: Date) {
  return Math.max(0, Math.floor((now.getTime() - new Date(startAt).getTime()) / 1000));
}

export function formatDuration(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

export function formatTime(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(value));
}

export function getEntryDescriptionLabel(description: string) {
  const trimmedDescription = description.trim();

  return trimmedDescription || "No description";
}

export function isSameLocalDate(left: Date, right: Date) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

export function formatDayLabel(dateValue: Date, today = new Date()) {
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (isSameLocalDate(dateValue, today)) {
    return "Today";
  }

  if (isSameLocalDate(dateValue, yesterday)) {
    return "Yesterday";
  }

  return new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  }).format(dateValue);
}

export function formatWeekLabel(weekStart: Date, today = new Date()) {
  const currentWeekStart = startOfWeek(today);

  if (isSameLocalDate(weekStart, currentWeekStart)) {
    return "This week";
  }

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);

  const startLabel = new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
  }).format(weekStart);
  const endLabel = new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
  }).format(weekEnd);

  return `${startLabel} – ${endLabel}`;
}

export function formatRelativeDateLabel(dateValue: string, today = new Date()) {
  const date = new Date(`${dateValue}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return "Pick date";
  }

  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (isSameLocalDate(date, today)) {
    return "Today";
  }

  if (isSameLocalDate(date, yesterday)) {
    return "Yesterday";
  }

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
  }).format(date);
}

export function isNextDay(startAt: string, endAt: string) {
  const start = new Date(startAt);
  const end = new Date(endAt);

  return !isSameLocalDate(start, end);
}
