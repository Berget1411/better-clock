import type { TrackerEntry } from "@open-learn/api/modules/time-tracker/time-tracker.schema";

import {
  formatDayLabel,
  formatWeekLabel,
  getEntryDurationSeconds,
  startOfWeek,
  toLocalDateInputValue,
} from "./date-time";

export interface TrackerDayGroup {
  key: string;
  label: string;
  totalSeconds: number;
  entries: TrackerEntry[];
}

export interface TrackerWeekGroup {
  key: string;
  label: string;
  totalSeconds: number;
  days: TrackerDayGroup[];
}

export function groupEntriesByWeek(entries: TrackerEntry[]) {
  const now = new Date();
  const weeks = new Map<string, { start: Date; days: Map<string, TrackerDayGroup> }>();

  for (const entry of entries) {
    const startDate = new Date(entry.startAt);
    const weekStart = startOfWeek(startDate);
    const weekKey = toLocalDateInputValue(weekStart);
    const dayKey = toLocalDateInputValue(startDate);
    const weekGroup = weeks.get(weekKey) ?? {
      start: weekStart,
      days: new Map<string, TrackerDayGroup>(),
    };
    const dayGroup = weekGroup.days.get(dayKey) ?? {
      key: dayKey,
      label: formatDayLabel(startDate, now),
      totalSeconds: 0,
      entries: [],
    };

    dayGroup.entries.push(entry);
    dayGroup.totalSeconds += getEntryDurationSeconds(entry);
    dayGroup.entries.sort(
      (left, right) => new Date(right.startAt).getTime() - new Date(left.startAt).getTime(),
    );
    weekGroup.days.set(dayKey, dayGroup);
    weeks.set(weekKey, weekGroup);
  }

  return [...weeks.entries()]
    .sort((left, right) => right[1].start.getTime() - left[1].start.getTime())
    .map(([weekKey, weekGroup]) => {
      const days = [...weekGroup.days.values()].sort(
        (left, right) =>
          new Date(right.entries[0]?.startAt ?? 0).getTime() -
          new Date(left.entries[0]?.startAt ?? 0).getTime(),
      );

      return {
        key: weekKey,
        label: formatWeekLabel(weekGroup.start, now),
        totalSeconds: days.reduce((sum, day) => sum + day.totalSeconds, 0),
        days,
      } satisfies TrackerWeekGroup;
    });
}
