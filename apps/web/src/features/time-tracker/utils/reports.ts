import type { TrackerEntry } from "@open-learn/api/modules/time-tracker/time-tracker.schema";

import type { TrackerOverviewRange } from "./date-time";

import {
  formatDuration,
  formatTime,
  getEntryDescriptionLabel,
  getEntryDurationSeconds,
  startOfWeek,
  toLocalDateInputValue,
} from "./date-time";

export type ReportPresetKey =
  | "this-week"
  | "last-week"
  | "last-30-days"
  | "this-month"
  | "last-month"
  | "custom";

export type ReportExportFormat = "csv" | "excel" | "json";

export interface ReportResolvedRange {
  fromDate: Date;
  toDate: Date;
  fromInput: string;
  toInput: string;
  range: TrackerOverviewRange;
}

export interface ReportDailyDatum {
  dateKey: string;
  label: string;
  totalHours: number;
}

export interface ReportProjectDatum {
  name: string;
  seconds: number;
  percentage: number;
  fill: string;
}

export interface ReportTableRow {
  id: number;
  dateLabel: string;
  startTime: string;
  endTime: string;
  duration: string;
  hours: string;
  projectName: string;
  tagsLabel: string;
  description: string;
}

export interface TrackerReportMetrics {
  totalSeconds: number;
  totalSessions: number;
  activeDays: number;
  projectCount: number;
  daily: ReportDailyDatum[];
  projects: ReportProjectDatum[];
  rows: ReportTableRow[];
}

export const REPORT_PRESET_OPTIONS: Array<{ key: ReportPresetKey; label: string }> = [
  { key: "this-week", label: "This week" },
  { key: "last-week", label: "Last week" },
  { key: "last-30-days", label: "Last 30 days" },
  { key: "this-month", label: "This month" },
  { key: "last-month", label: "Last month" },
  { key: "custom", label: "Custom range" },
];

export const REPORT_EXPORT_LABELS: Record<ReportExportFormat, string> = {
  csv: "CSV",
  excel: "Excel",
  json: "JSON",
};

const PROJECT_COLORS = [
  "hsl(174 84% 32%)",
  "hsl(200 78% 46%)",
  "hsl(39 92% 54%)",
  "hsl(16 80% 58%)",
  "hsl(222 23% 42%)",
];

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function startOfDay(date: Date) {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function isValidDate(date: Date) {
  return !Number.isNaN(date.getTime());
}

function toLocalDate(value: string) {
  return new Date(`${value}T00:00:00`);
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

function formatDateLabel(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function formatHours(seconds: number) {
  return Math.round((seconds / 3600) * 10) / 10;
}

function formatDecimalHours(seconds: number) {
  return (seconds / 3600).toFixed(2);
}

function escapeCsvValue(value: string) {
  if (/[",\n]/.test(value)) {
    return `"${value.replaceAll('"', '""')}"`;
  }

  return value;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function downloadFile(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function buildReportFilename(fromDate: Date, toDate: Date, extension: string) {
  return `time-report-${toLocalDateInputValue(fromDate)}-to-${toLocalDateInputValue(toDate)}.${extension}`;
}

export function getReportPresetRange(
  preset: Exclude<ReportPresetKey, "custom">,
  now = new Date(),
): ReportResolvedRange {
  const today = startOfDay(now);

  switch (preset) {
    case "this-week": {
      return resolveReportRangeFromDates(startOfWeek(today), today);
    }
    case "last-week": {
      const currentWeekStart = startOfWeek(today);
      return resolveReportRangeFromDates(
        addDays(currentWeekStart, -7),
        addDays(currentWeekStart, -1),
      );
    }
    case "last-30-days": {
      return resolveReportRangeFromDates(addDays(today, -29), today);
    }
    case "this-month": {
      return resolveReportRangeFromDates(startOfMonth(today), today);
    }
    case "last-month": {
      const currentMonthStart = startOfMonth(today);
      const previousMonthEnd = addDays(currentMonthStart, -1);
      return resolveReportRangeFromDates(startOfMonth(previousMonthEnd), previousMonthEnd);
    }
  }
}

export function resolveReportRange(fromInput: string, toInput: string): ReportResolvedRange {
  const fallback = startOfDay(new Date());
  const parsedFrom = fromInput ? toLocalDate(fromInput) : fallback;
  const parsedTo = toInput ? toLocalDate(toInput) : parsedFrom;
  const fromDate = isValidDate(parsedFrom) ? parsedFrom : fallback;
  const safeTo = isValidDate(parsedTo) ? parsedTo : fromDate;
  const toDate = safeTo < fromDate ? fromDate : safeTo;

  return resolveReportRangeFromDates(fromDate, toDate);
}

export function resolveReportRangeFromDates(fromDate: Date, toDate: Date): ReportResolvedRange {
  const safeFrom = startOfDay(fromDate);
  const safeTo = startOfDay(toDate);
  const orderedTo = safeTo < safeFrom ? safeFrom : safeTo;

  return {
    fromDate: safeFrom,
    toDate: orderedTo,
    fromInput: toLocalDateInputValue(safeFrom),
    toInput: toLocalDateInputValue(orderedTo),
    range: {
      from: safeFrom.toISOString(),
      to: addDays(orderedTo, 1).toISOString(),
    },
  };
}

export function formatReportRangeLabel(fromDate: Date, toDate: Date) {
  const formatter = new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return `${formatter.format(fromDate)} - ${formatter.format(toDate)}`;
}

export function buildTrackerReportMetrics({
  entries,
  fromDate,
  toDate,
}: {
  entries: TrackerEntry[];
  fromDate: Date;
  toDate: Date;
}): TrackerReportMetrics {
  const firstDay = startOfDay(fromDate);
  const lastDay = startOfDay(toDate);
  const dailyMap = new Map<string, ReportDailyDatum>();

  for (let day = new Date(firstDay); day <= lastDay; day = addDays(day, 1)) {
    const dateKey = toDateKey(day);
    dailyMap.set(dateKey, {
      dateKey,
      label: formatAxisLabel(day),
      totalHours: 0,
    });
  }

  const projectTotals = new Map<string, number>();
  const rows = [...entries]
    .sort((left, right) => new Date(right.startAt).getTime() - new Date(left.startAt).getTime())
    .map((entry) => {
      const durationSeconds = getEntryDurationSeconds(entry);

      return {
        id: entry.id,
        dateLabel: formatDateLabel(entry.startAt),
        startTime: formatTime(entry.startAt),
        endTime: entry.endAt ? formatTime(entry.endAt) : "--:--",
        duration: formatDuration(durationSeconds),
        hours: formatDecimalHours(durationSeconds),
        projectName: entry.project?.name ?? "Without project",
        tagsLabel: entry.tags.length ? entry.tags.map((tag) => tag.name).join(", ") : "-",
        description: getEntryDescriptionLabel(entry.description),
      } satisfies ReportTableRow;
    });

  let totalSeconds = 0;

  for (const entry of entries) {
    const durationSeconds = getEntryDurationSeconds(entry);

    if (durationSeconds <= 0) {
      continue;
    }

    totalSeconds += durationSeconds;

    const startDate = new Date(entry.startAt);
    const dateKey = toDateKey(startDate);
    const day = dailyMap.get(dateKey);

    if (day) {
      day.totalHours += formatHours(durationSeconds);
    }

    const projectName = entry.project?.name ?? "Without project";
    projectTotals.set(projectName, (projectTotals.get(projectName) ?? 0) + durationSeconds);
  }

  const projectBreakdown = [...projectTotals.entries()]
    .sort((left, right) => right[1] - left[1])
    .map(([name, seconds], index) => ({
      name,
      seconds,
      percentage: totalSeconds > 0 ? (seconds / totalSeconds) * 100 : 0,
      fill: PROJECT_COLORS[index % PROJECT_COLORS.length] ?? PROJECT_COLORS[0],
    }));

  const projects = projectBreakdown.slice(0, 5);
  const remainingSeconds = projectBreakdown.slice(5).reduce((sum, item) => sum + item.seconds, 0);

  if (remainingSeconds > 0) {
    projects.push({
      name: "Other",
      seconds: remainingSeconds,
      percentage: totalSeconds > 0 ? (remainingSeconds / totalSeconds) * 100 : 0,
      fill: "hsl(210 16% 82%)",
    });
  }

  return {
    totalSeconds,
    totalSessions: rows.length,
    activeDays: [...dailyMap.values()].filter((day) => day.totalHours > 0).length,
    projectCount: projectTotals.size,
    daily: [...dailyMap.values()],
    projects,
    rows,
  };
}

export function exportTrackerReport({
  format,
  metrics,
  fromDate,
  toDate,
  rangeLabel,
}: {
  format: ReportExportFormat;
  metrics: TrackerReportMetrics;
  fromDate: Date;
  toDate: Date;
  rangeLabel: string;
}) {
  if (typeof window === "undefined") {
    return;
  }

  const summary = {
    range: rangeLabel,
    totalTracked: formatDuration(metrics.totalSeconds),
    sessions: metrics.totalSessions,
    activeDays: metrics.activeDays,
    projects: metrics.projectCount,
  };

  if (format === "json") {
    downloadFile(
      buildReportFilename(fromDate, toDate, "json"),
      `${JSON.stringify({ summary, entries: metrics.rows }, null, 2)}\n`,
      "application/json;charset=utf-8",
    );
    return;
  }

  if (format === "csv") {
    const lines = [
      ["Range", summary.range],
      ["Total tracked", summary.totalTracked],
      ["Sessions", String(summary.sessions)],
      ["Active days", String(summary.activeDays)],
      ["Projects", String(summary.projects)],
      [],
      ["Date", "Start", "End", "Duration", "Hours", "Project", "Tags", "Description"],
      ...metrics.rows.map((row) => [
        row.dateLabel,
        row.startTime,
        row.endTime,
        row.duration,
        row.hours,
        row.projectName,
        row.tagsLabel,
        row.description,
      ]),
    ];

    const content = lines
      .map((line) => line.map((value) => escapeCsvValue(value ?? "")).join(","))
      .join("\n");

    downloadFile(buildReportFilename(fromDate, toDate, "csv"), content, "text/csv;charset=utf-8");
    return;
  }

  const rows = metrics.rows
    .map(
      (row) => `
        <tr>
          <td>${escapeHtml(row.dateLabel)}</td>
          <td>${escapeHtml(row.startTime)}</td>
          <td>${escapeHtml(row.endTime)}</td>
          <td>${escapeHtml(row.duration)}</td>
          <td>${escapeHtml(row.hours)}</td>
          <td>${escapeHtml(row.projectName)}</td>
          <td>${escapeHtml(row.tagsLabel)}</td>
          <td>${escapeHtml(row.description)}</td>
        </tr>`,
    )
    .join("");

  const content = `
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body { font-family: Arial, sans-serif; }
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid #d1d5db; padding: 8px; font-size: 12px; text-align: left; }
          th { background: #f3f4f6; }
          .summary { margin-bottom: 16px; width: 360px; }
        </style>
      </head>
      <body>
        <table class="summary">
          <tr><th colspan="2">Time report summary</th></tr>
          <tr><td>Range</td><td>${escapeHtml(summary.range)}</td></tr>
          <tr><td>Total tracked</td><td>${escapeHtml(summary.totalTracked)}</td></tr>
          <tr><td>Sessions</td><td>${summary.sessions}</td></tr>
          <tr><td>Active days</td><td>${summary.activeDays}</td></tr>
          <tr><td>Projects</td><td>${summary.projects}</td></tr>
        </table>

        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Start</th>
              <th>End</th>
              <th>Duration</th>
              <th>Hours</th>
              <th>Project</th>
              <th>Tags</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </body>
    </html>`;

  downloadFile(
    buildReportFilename(fromDate, toDate, "xls"),
    content,
    "application/vnd.ms-excel;charset=utf-8",
  );
}
