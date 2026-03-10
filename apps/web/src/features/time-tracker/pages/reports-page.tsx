import { lazy, Suspense, useMemo, useReducer } from "react";
import {
  ActivityIcon,
  CalendarRangeIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DownloadIcon,
  FileJson2Icon,
  FileSpreadsheetIcon,
  FileTextIcon,
  PrinterIcon,
  Share2Icon,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@open-learn/ui/components/badge";
import { Button } from "@open-learn/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@open-learn/ui/components/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@open-learn/ui/components/dropdown-menu";
import { Input } from "@open-learn/ui/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@open-learn/ui/components/select";
import { Skeleton } from "@open-learn/ui/components/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@open-learn/ui/components/table";
import { cn } from "@open-learn/ui/lib/utils";

import { useTrackerOverviewQuery } from "../services/queries";
import { formatMetricDuration } from "../utils/dashboard";
import {
  buildTrackerReportMetrics,
  exportTrackerReport,
  formatReportRangeLabel,
  getReportPresetRange,
  REPORT_EXPORT_LABELS,
  REPORT_PRESET_OPTIONS,
  resolveReportRange,
  resolveReportRangeFromDates,
  type ReportExportFormat,
  type ReportPresetKey,
} from "../utils/reports";

const ReportsBarChart = lazy(() =>
  import("../components/reports-charts").then((m) => ({ default: m.ReportsBarChart })),
);
const ReportsPieChart = lazy(() =>
  import("../components/reports-charts").then((m) => ({ default: m.ReportsPieChart })),
);

const billableOptions = [
  { value: "all", label: "Billability" },
  { value: "billable", label: "Billable only" },
  { value: "non-billable", label: "Non-billable" },
] as const;

const initialRange = getReportPresetRange("last-month");

function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

// ─── Reducer ──────────────────────────────────────────────────────────────────

type BillableFilter = (typeof billableOptions)[number]["value"];

interface FiltersState {
  preset: ReportPresetKey;
  fromInput: string;
  toInput: string;
  projectFilter: string;
  billableFilter: BillableFilter;
  searchValue: string;
}

type FiltersAction =
  | { type: "SET_PRESET"; preset: ReportPresetKey; fromInput: string; toInput: string }
  | { type: "SET_CUSTOM_FROM"; fromInput: string }
  | { type: "SET_CUSTOM_TO"; toInput: string }
  | { type: "SET_PROJECT_FILTER"; projectFilter: string }
  | { type: "SET_BILLABLE_FILTER"; billableFilter: BillableFilter }
  | { type: "SET_SEARCH"; searchValue: string }
  | { type: "RESET_FILTERS" }
  | { type: "SHIFT_RANGE"; fromInput: string; toInput: string };

function filtersReducer(state: FiltersState, action: FiltersAction): FiltersState {
  switch (action.type) {
    case "SET_PRESET":
      return {
        ...state,
        preset: action.preset,
        fromInput: action.fromInput,
        toInput: action.toInput,
      };
    case "SET_CUSTOM_FROM":
      return { ...state, preset: "custom", fromInput: action.fromInput };
    case "SET_CUSTOM_TO":
      return { ...state, preset: "custom", toInput: action.toInput };
    case "SET_PROJECT_FILTER":
      return { ...state, projectFilter: action.projectFilter };
    case "SET_BILLABLE_FILTER":
      return { ...state, billableFilter: action.billableFilter };
    case "SET_SEARCH":
      return { ...state, searchValue: action.searchValue };
    case "RESET_FILTERS":
      return { ...state, projectFilter: "all", billableFilter: "all", searchValue: "" };
    case "SHIFT_RANGE":
      return { ...state, preset: "custom", fromInput: action.fromInput, toInput: action.toInput };
    default:
      return state;
  }
}

const initialFiltersState: FiltersState = {
  preset: "last-month",
  fromInput: initialRange.fromInput,
  toInput: initialRange.toInput,
  projectFilter: "all",
  billableFilter: "all",
  searchValue: "",
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ReportsPage() {
  const [filters, dispatch] = useReducer(filtersReducer, initialFiltersState);
  const { preset, fromInput, toInput, projectFilter, billableFilter, searchValue } = filters;

  const resolvedRange = useMemo(() => resolveReportRange(fromInput, toInput), [fromInput, toInput]);
  const rangeLabel = useMemo(
    () => formatReportRangeLabel(resolvedRange.fromDate, resolvedRange.toDate),
    [resolvedRange.fromDate, resolvedRange.toDate],
  );
  const trackerOverview = useTrackerOverviewQuery(resolvedRange.range);

  const filteredEntries = useMemo(() => {
    const query = searchValue.trim().toLowerCase();

    return (trackerOverview.data?.entries ?? []).filter((entry) => {
      if (projectFilter !== "all" && entry.project?.id !== Number(projectFilter)) {
        return false;
      }

      if (billableFilter === "billable" && !entry.isBillable) {
        return false;
      }

      if (billableFilter === "non-billable" && entry.isBillable) {
        return false;
      }

      if (!query) {
        return true;
      }

      const projectName = entry.project?.name ?? "Without project";
      const tagNames = entry.tags.map((tag) => tag.name).join(" ");
      const haystack = `${entry.description} ${projectName} ${tagNames}`.toLowerCase();

      return haystack.includes(query);
    });
  }, [billableFilter, projectFilter, searchValue, trackerOverview.data?.entries]);

  const metrics = useMemo(
    () =>
      buildTrackerReportMetrics({
        entries: filteredEntries,
        fromDate: resolvedRange.fromDate,
        toDate: resolvedRange.toDate,
      }),
    [filteredEntries, resolvedRange.fromDate, resolvedRange.toDate],
  );

  const hasEntries = metrics.totalSessions > 0;

  function handlePresetChange(value: string) {
    const nextPreset = value as ReportPresetKey;

    if (nextPreset === "custom") {
      dispatch({ type: "SET_PRESET", preset: nextPreset, fromInput, toInput });
      return;
    }

    const nextRange = getReportPresetRange(nextPreset);
    dispatch({
      type: "SET_PRESET",
      preset: nextPreset,
      fromInput: nextRange.fromInput,
      toInput: nextRange.toInput,
    });
  }

  function handleCustomFromChange(value: string) {
    dispatch({ type: "SET_CUSTOM_FROM", fromInput: value });
  }

  function handleCustomToChange(value: string) {
    dispatch({ type: "SET_CUSTOM_TO", toInput: value });
  }

  function shiftRange(direction: -1 | 1) {
    const fromDate = resolvedRange.fromDate;
    const toDate = resolvedRange.toDate;
    const dayCount = Math.max(
      1,
      Math.round((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24)) + 1,
    );
    const nextRange = resolveReportRangeFromDates(
      addDays(fromDate, dayCount * direction),
      addDays(toDate, dayCount * direction),
    );

    dispatch({ type: "SHIFT_RANGE", fromInput: nextRange.fromInput, toInput: nextRange.toInput });
  }

  function handleExport(format: ReportExportFormat) {
    if (!metrics.rows.length) {
      toast.error("No report rows to export yet");
      return;
    }

    exportTrackerReport({
      format,
      metrics,
      fromDate: resolvedRange.fromDate,
      toDate: resolvedRange.toDate,
      rangeLabel,
    });

    toast.success(`${REPORT_EXPORT_LABELS[format]} report exported`);
  }

  function handleShare() {
    if (typeof window === "undefined") {
      return;
    }

    void navigator.clipboard
      .writeText(window.location.href)
      .then(() => toast.success("Report link copied"))
      .catch(() => toast.error("Could not copy report link"));
  }

  function handlePrint() {
    if (typeof window === "undefined") {
      return;
    }

    window.print();
  }

  function resetFilters() {
    dispatch({ type: "RESET_FILTERS" });
  }

  return (
    <div className="flex w-full min-w-0 flex-col gap-3 overflow-x-hidden text-[13px]">
      <section className="flex flex-col gap-2 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-wrap items-center gap-1.5">
          <Button variant="outline" size="sm" className="h-9 px-3 uppercase">
            Time report
          </Button>
          <Badge variant="outline" className="h-9 rounded-none px-3 text-[11px] uppercase">
            Summary
          </Badge>
          <Badge
            variant="outline"
            className="h-9 rounded-none px-3 text-[11px] text-muted-foreground"
          >
            Detailed
          </Badge>
          <Badge
            variant="outline"
            className="h-9 rounded-none px-3 text-[11px] text-muted-foreground"
          >
            Weekly
          </Badge>
          <Badge
            variant="outline"
            className="h-9 rounded-none px-3 text-[11px] text-muted-foreground"
          >
            Shared
          </Badge>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 xl:justify-end">
          <div className="flex min-w-0 flex-wrap items-center sm:flex-nowrap">
            <Button
              variant="outline"
              size="sm"
              className="h-9 rounded-none border-r-0 px-3"
              onClick={() => shiftRange(-1)}
              aria-label="Previous period"
            >
              <ChevronLeftIcon className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-9 max-w-full rounded-none px-3 font-normal"
            >
              <CalendarRangeIcon className="size-4" />
              {rangeLabel}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-9 rounded-none border-l-0 px-3"
              onClick={() => shiftRange(1)}
              aria-label="Next period"
            >
              <ChevronRightIcon className="size-4" />
            </Button>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 rounded-none px-3">
                <DownloadIcon className="size-4" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-none">
              <DropdownMenuItem onClick={() => handleExport("csv")}>
                <FileTextIcon className="size-4" />
                Export CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("excel")}>
                <FileSpreadsheetIcon className="size-4" />
                Export Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("json")}>
                <FileJson2Icon className="size-4" />
                Export JSON
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </section>

      <Card className="overflow-hidden border-border/70 bg-muted/10 py-0">
        <CardContent className="flex flex-wrap gap-2 p-3">
          <div className="min-w-0 flex-1 basis-[180px] sm:basis-[160px]">
            <CompactSelect
              value={preset}
              onValueChange={handlePresetChange}
              ariaLabel="Select report preset"
            >
              {REPORT_PRESET_OPTIONS.map((option) => (
                <SelectItem key={option.key} value={option.key}>
                  {option.label}
                </SelectItem>
              ))}
            </CompactSelect>
          </div>

          <div className="min-w-0 flex-1 basis-[160px] sm:basis-[150px]">
            <Input
              type="date"
              value={fromInput}
              onChange={(event) => handleCustomFromChange(event.target.value)}
              className="h-9 rounded-none bg-background text-xs"
            />
          </div>

          <div className="min-w-0 flex-1 basis-[160px] sm:basis-[150px]">
            <Input
              type="date"
              value={toInput}
              onChange={(event) => handleCustomToChange(event.target.value)}
              className="h-9 rounded-none bg-background text-xs"
            />
          </div>

          <div className="min-w-0 flex-1 basis-[180px] sm:basis-[160px]">
            <CompactSelect
              value={projectFilter}
              onValueChange={(value) =>
                dispatch({ type: "SET_PROJECT_FILTER", projectFilter: value })
              }
              ariaLabel="Filter by project"
            >
              <SelectItem value="all">Project</SelectItem>
              {(trackerOverview.data?.projects ?? []).map((project) => (
                <SelectItem key={project.id} value={String(project.id)}>
                  {project.name}
                </SelectItem>
              ))}
            </CompactSelect>
          </div>

          <div className="min-w-0 flex-1 basis-[180px] sm:basis-[160px]">
            <CompactSelect
              value={billableFilter}
              onValueChange={(value) =>
                dispatch({ type: "SET_BILLABLE_FILTER", billableFilter: value as BillableFilter })
              }
              ariaLabel="Filter by billability"
            >
              {billableOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </CompactSelect>
          </div>

          <div className="min-w-0 flex-[2_1_220px] basis-[220px]">
            <Input
              value={searchValue}
              onChange={(event) =>
                dispatch({ type: "SET_SEARCH", searchValue: event.target.value })
              }
              placeholder="Description or tag"
              className="h-9 rounded-none bg-background text-xs"
            />
          </div>

          <Button
            variant="outline"
            size="sm"
            className="h-9 rounded-none px-3"
            onClick={resetFilters}
          >
            Reset filters
          </Button>
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-border/70 py-0">
        <div className="flex flex-col gap-3 border-b border-border/70 bg-muted/20 px-3 py-2 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
            <InlineMetric label="Total" value={formatMetricDuration(metrics.totalSeconds)} />
            <InlineMetric label="Billable" value={formatMetricDuration(metrics.billableSeconds)} />
            <InlineMetric
              label="Non-billable"
              value={formatMetricDuration(metrics.nonBillableSeconds)}
            />
            <InlineMetric label="Sessions" value={String(metrics.totalSessions)} />
            <InlineMetric label="Projects" value={String(metrics.projectCount)} />
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 rounded-none px-2.5"
              onClick={handlePrint}
            >
              <PrinterIcon className="size-4" />
              Print
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 rounded-none px-2.5"
              onClick={handleShare}
            >
              <Share2Icon className="size-4" />
              Share
            </Button>
          </div>
        </div>

        <CardContent className="px-0 py-0">
          {trackerOverview.isLoading ? (
            <div className="space-y-3 p-3">
              <Skeleton className="h-[280px] w-full" />
              <div className="grid gap-3 2xl:grid-cols-[minmax(0,1fr)_320px]">
                <Skeleton className="h-[360px] w-full" />
                <Skeleton className="h-[360px] w-full" />
              </div>
            </div>
          ) : hasEntries ? (
            <>
              <div className="border-b border-border/70 px-3 py-3">
                <Suspense fallback={<Skeleton className="h-[280px] w-full" />}>
                  <ReportsBarChart daily={metrics.daily} />
                </Suspense>
              </div>

              <div className="grid gap-0 2xl:grid-cols-[minmax(0,1fr)_360px]">
                <section className="min-w-0 border-b border-border/70 2xl:border-r 2xl:border-b-0">
                  <div className="flex items-center justify-between border-b border-border/70 bg-muted/20 px-3 py-2">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                        Detailed time log
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {metrics.rows.length} rows in {rangeLabel}
                      </p>
                    </div>
                    <Badge variant="outline" className="rounded-none">
                      {metrics.activeDays} active days
                    </Badge>
                  </div>

                  <div className="max-h-[360px] overflow-auto">
                    <Table>
                      <TableHeader className="sticky top-0 z-10 bg-background">
                        <TableRow>
                          <TableHead className="pl-3">Title</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Duration</TableHead>
                          <TableHead>Project</TableHead>
                          <TableHead>Billable</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {metrics.rows.map((row) => (
                          <TableRow key={row.id}>
                            <TableCell className="pl-3">
                              <div className="min-w-0">
                                <p className="truncate text-xs font-medium">{row.description}</p>
                                <p className="truncate text-[11px] text-muted-foreground">
                                  {row.startTime} - {row.endTime}
                                  {row.tagsLabel !== "-" ? ` • ${row.tagsLabel}` : ""}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell className="text-muted-foreground">{row.dateLabel}</TableCell>
                            <TableCell className="font-medium">{row.duration}</TableCell>
                            <TableCell>{row.projectName}</TableCell>
                            <TableCell>
                              <span
                                className={cn(
                                  "inline-flex items-center rounded-none border px-2 py-1 text-[11px]",
                                  row.billableLabel === "Billable"
                                    ? "border-emerald-600/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                                    : "border-border bg-muted/50 text-muted-foreground",
                                )}
                              >
                                {row.billableLabel}
                              </span>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </section>

                <section className="min-w-0">
                  <div className="border-b border-border/70 bg-muted/20 px-3 py-2">
                    <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                      Project split
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Distribution of tracked time across projects
                    </p>
                  </div>

                  <Suspense fallback={<Skeleton className="h-[360px] w-full" />}>
                    <ReportsPieChart
                      projects={metrics.projects}
                      totalSeconds={metrics.totalSeconds}
                    />
                  </Suspense>
                </section>
              </div>
            </>
          ) : (
            <EmptyState
              title="No tracked time in this range"
              description="Adjust the dates or log time from the tracker to build a report."
              className="m-3"
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function CompactSelect({
  value,
  onValueChange,
  ariaLabel,
  children,
}: {
  value: string;
  onValueChange: (value: string) => void;
  ariaLabel: string;
  children: React.ReactNode;
}) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger
        aria-label={ariaLabel}
        className="h-9 w-full min-w-0 rounded-none bg-background text-xs"
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>{children}</SelectContent>
    </Select>
  );
}

function InlineMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-1.5">
      <span className="text-muted-foreground">{label}:</span>
      <span className="text-base font-semibold text-foreground">{value}</span>
    </div>
  );
}

function EmptyState({
  title,
  description,
  className,
}: {
  title: string;
  description: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex min-h-[220px] flex-col items-center justify-center border border-dashed border-border/70 bg-muted/15 px-6 text-center",
        className,
      )}
    >
      <ActivityIcon className="mb-3 size-5 text-muted-foreground" />
      <p className="text-sm font-medium">{title}</p>
      <p className="mt-1 max-w-md text-xs text-muted-foreground">{description}</p>
    </div>
  );
}
