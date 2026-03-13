import type { TrackerOverviewRange } from "./date-time";

import { formatDuration, getEntryDescriptionLabel, getEntryDurationSeconds } from "./date-time";

export type DashboardRangeKey = "7d" | "30d" | "90d";

export interface DashboardProject {
  id: number;
  name: string;
}

export interface DashboardTag {
  id: number;
  name: string;
}

export interface DashboardTask {
  id: number;
  displayKey: string;
  title: string;
  status: "backlog" | "todo" | "in_progress" | "done" | "canceled";
}

export interface DashboardEntry {
  id: number;
  description: string;
  isBillable: boolean;
  startAt: string;
  endAt: string | null;
  project: DashboardProject | null;
  task: DashboardTask | null;
  tags: DashboardTag[];
}

export const DASHBOARD_RANGE_OPTIONS: Array<{
  key: DashboardRangeKey;
  label: string;
  days: number;
}> = [
  { key: "7d", label: "Last 7 days", days: 7 },
  { key: "30d", label: "Last 30 days", days: 30 },
  { key: "90d", label: "Last 90 days", days: 90 },
];

const PROJECT_COLORS = [
  "hsl(174 84% 32%)",
  "hsl(203 82% 45%)",
  "hsl(38 92% 50%)",
  "hsl(12 76% 55%)",
  "hsl(221 35% 38%)",
];

export interface DashboardDailyDatum {
  dateKey: string;
  label: string;
  totalHours: number;
  billableHours: number;
}

export interface DashboardProjectDatum {
  name: string;
  seconds: number;
  hours: number;
  percentage: number;
  fill: string;
}

export interface DashboardActivityDatum {
  name: string;
  projectName: string;
  totalSeconds: number;
  sessions: number;
  percentage: number;
}

export interface TrackerDashboardMetrics {
  totalSeconds: number;
  billableSeconds: number;
  nonBillableSeconds: number;
  billableShare: number;
  nonBillableShare: number;
  averageDaySeconds: number;
  trackedDays: number;
  topProjectName: string;
  topProjectSeconds: number;
  topTagName: string;
  topTagSeconds: number;
  totalSessions: number;
  daily: DashboardDailyDatum[];
  projects: DashboardProjectDatum[];
  activities: DashboardActivityDatum[];
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function startOfLocalDay(date: Date) {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function toDateKey(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function formatAxisLabel(date: Date) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
  }).format(date);
}

function formatHours(seconds: number) {
  return Math.round((seconds / 3600) * 10) / 10;
}

function getRangeDays(key: DashboardRangeKey) {
  return DASHBOARD_RANGE_OPTIONS.find((option) => option.key === key)?.days ?? 30;
}

export function getDashboardRange(
  rangeKey: DashboardRangeKey,
  now = new Date(),
): TrackerOverviewRange {
  const days = getRangeDays(rangeKey);
  const today = startOfLocalDay(now);
  const from = addDays(today, -(days - 1));
  const to = addDays(today, 1);

  return {
    from: from.toISOString(),
    to: to.toISOString(),
  };
}

export function formatCompactDuration(totalSeconds: number) {
  if (totalSeconds <= 0) {
    return "0h";
  }

  const totalHours = totalSeconds / 3600;

  if (totalHours < 1) {
    const minutes = Math.round(totalSeconds / 60);
    return `${minutes}m`;
  }

  return `${totalHours.toFixed(totalHours >= 10 ? 0 : 1)}h`;
}

export function formatMetricDuration(totalSeconds: number) {
  if (totalSeconds <= 0) {
    return "00:00:00";
  }

  return formatDuration(totalSeconds);
}

export function formatProjectShare(percentage: number) {
  return `${percentage.toFixed(1)}%`;
}

export function buildTrackerDashboardMetrics({
  entries,
  tags,
  rangeKey,
}: {
  entries: DashboardEntry[];
  tags: DashboardTag[];
  rangeKey: DashboardRangeKey;
}): TrackerDashboardMetrics {
  const tagMap = new Map<number, DashboardTag>(tags.map((tag) => [tag.id, tag]));
  const totalDays = getRangeDays(rangeKey);
  const today = startOfLocalDay(new Date());
  const firstDay = addDays(today, -(totalDays - 1));

  const dailyMap = new Map<string, DashboardDailyDatum>();
  for (let index = 0; index < totalDays; index += 1) {
    const day = addDays(firstDay, index);
    const dateKey = toDateKey(day);
    dailyMap.set(dateKey, {
      dateKey,
      label: formatAxisLabel(day),
      totalHours: 0,
      billableHours: 0,
    });
  }

  const projectTotals = new Map<string, number>();
  const tagTotals = new Map<string, number>();
  const activityTotals = new Map<
    string,
    { name: string; projectName: string; totalSeconds: number; sessions: number }
  >();

  let totalSeconds = 0;
  let billableSeconds = 0;
  let totalSessions = 0;

  for (const entry of entries) {
    const durationSeconds = getEntryDurationSeconds(entry);

    if (durationSeconds <= 0) {
      continue;
    }

    totalSessions += 1;
    totalSeconds += durationSeconds;

    if (entry.isBillable) {
      billableSeconds += durationSeconds;
    }

    const startDate = new Date(entry.startAt);
    const dateKey = toDateKey(startDate);
    const day = dailyMap.get(dateKey);
    const durationHours = formatHours(durationSeconds);

    if (day) {
      day.totalHours += durationHours;

      if (entry.isBillable) {
        day.billableHours += durationHours;
      }
    }

    const projectName = entry.project?.name ?? "Without project";
    projectTotals.set(projectName, (projectTotals.get(projectName) ?? 0) + durationSeconds);

    for (const tag of entry.tags) {
      const resolvedTag = tagMap.get(tag.id)?.name ?? tag.name;
      tagTotals.set(resolvedTag, (tagTotals.get(resolvedTag) ?? 0) + durationSeconds);
    }

    const activityName = getEntryDescriptionLabel(entry.description || entry.task?.title || "");
    const activityKey = `${activityName}::${projectName}`;
    const activity = activityTotals.get(activityKey) ?? {
      name: activityName,
      projectName,
      totalSeconds: 0,
      sessions: 0,
    };

    activity.totalSeconds += durationSeconds;
    activity.sessions += 1;
    activityTotals.set(activityKey, activity);
  }

  const trackedDays = [...dailyMap.values()].filter((day) => day.totalHours > 0).length;
  const averageDaySeconds = totalSeconds > 0 ? Math.round(totalSeconds / totalDays) : 0;

  const projectBreakdown = [...projectTotals.entries()]
    .sort((left, right) => right[1] - left[1])
    .map(([name, seconds], index) => ({
      name,
      seconds,
      hours: formatHours(seconds),
      percentage: totalSeconds > 0 ? (seconds / totalSeconds) * 100 : 0,
      fill: PROJECT_COLORS[index % PROJECT_COLORS.length] ?? PROJECT_COLORS[0],
    }));

  const projectsForChart = projectBreakdown.slice(0, 4);
  if (projectBreakdown.length > 4) {
    const remaining = projectBreakdown.slice(4).reduce((sum, item) => sum + item.seconds, 0);

    if (remaining > 0) {
      projectsForChart.push({
        name: "Other",
        seconds: remaining,
        hours: formatHours(remaining),
        percentage: totalSeconds > 0 ? (remaining / totalSeconds) * 100 : 0,
        fill: "hsl(210 16% 82%)",
      });
    }
  }

  const [topProjectName = "No projects yet", topProjectSeconds = 0] = projectBreakdown[0]
    ? [projectBreakdown[0].name, projectBreakdown[0].seconds]
    : ["No projects yet", 0];

  const [topTagName = "No tags yet", topTagSeconds = 0] = [...tagTotals.entries()].sort(
    (left, right) => right[1] - left[1],
  )[0] ?? ["No tags yet", 0];

  const activities = [...activityTotals.values()]
    .sort((left, right) => right.totalSeconds - left.totalSeconds)
    .slice(0, 8)
    .map((activity) => ({
      ...activity,
      percentage: totalSeconds > 0 ? (activity.totalSeconds / totalSeconds) * 100 : 0,
    }));

  return {
    totalSeconds,
    billableSeconds,
    nonBillableSeconds: totalSeconds - billableSeconds,
    billableShare: totalSeconds > 0 ? (billableSeconds / totalSeconds) * 100 : 0,
    nonBillableShare:
      totalSeconds > 0 ? ((totalSeconds - billableSeconds) / totalSeconds) * 100 : 0,
    averageDaySeconds,
    trackedDays,
    topProjectName,
    topProjectSeconds,
    topTagName,
    topTagSeconds,
    totalSessions,
    daily: [...dailyMap.values()],
    projects: projectsForChart,
    activities,
  };
}
