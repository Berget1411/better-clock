import { useMemo, useState, type ReactNode } from "react";
import { ActivityIcon, CalendarRangeIcon } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, XAxis, YAxis } from "recharts";

import { Badge } from "@open-learn/ui/components/badge";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@open-learn/ui/components/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@open-learn/ui/components/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@open-learn/ui/components/select";
import { Skeleton } from "@open-learn/ui/components/skeleton";
import { cn } from "@open-learn/ui/lib/utils";

import { useTrackerOverviewQuery } from "../services/queries";
import {
  DASHBOARD_RANGE_OPTIONS,
  buildTrackerDashboardMetrics,
  formatCompactDuration,
  formatMetricDuration,
  formatProjectShare,
  getDashboardRange,
  type DashboardRangeKey,
} from "../utils/dashboard";
import { getEntryDescriptionLabel, getElapsedSeconds } from "../utils/date-time";

const dailyChartConfig = {
  totalHours: {
    label: "Tracked hours",
    color: "hsl(174 84% 32%)",
  },
} satisfies ChartConfig;

const projectChartConfig = {
  hours: {
    label: "Hours",
    color: "hsl(174 84% 32%)",
  },
} satisfies ChartConfig;

export default function TrackerDashboardPage() {
  const [rangeKey, setRangeKey] = useState<DashboardRangeKey>("30d");
  const [projectFilter, setProjectFilter] = useState("all");
  const range = useMemo(() => getDashboardRange(rangeKey), [rangeKey]);
  const trackerOverview = useTrackerOverviewQuery(range);
  const projectId = projectFilter === "all" ? null : Number(projectFilter);
  const metrics = useMemo(
    () =>
      buildTrackerDashboardMetrics({
        entries: trackerOverview.data?.entries ?? [],
        projects: trackerOverview.data?.projects ?? [],
        tags: trackerOverview.data?.tags ?? [],
        rangeKey,
        projectId,
      }),
    [
      projectId,
      rangeKey,
      trackerOverview.data?.entries,
      trackerOverview.data?.projects,
      trackerOverview.data?.tags,
    ],
  );

  const rangeLabel =
    DASHBOARD_RANGE_OPTIONS.find((option) => option.key === rangeKey)?.label ?? "Last 30 days";
  const activeEntry = trackerOverview.data?.activeEntry ?? null;
  const activeTimerSeconds = activeEntry ? getElapsedSeconds(activeEntry.startAt, new Date()) : 0;
  const hasEntries = metrics.totalSeconds > 0;

  return (
    <div className="flex w-full flex-col gap-4">
      <section className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {activeEntry
              ? `Running now: ${getEntryDescriptionLabel(activeEntry.description)} - ${formatMetricDuration(activeTimerSeconds)}`
              : "Overview of tracked time across your recent work."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <FilterSelect
            ariaLabel="Select project"
            value={projectFilter}
            onValueChange={setProjectFilter}
            placeholder="Project"
            options={[
              { value: "all", label: "Project" },
              ...(trackerOverview.data?.projects ?? []).map((project) => ({
                value: String(project.id),
                label: project.name,
              })),
            ]}
          />
          <FilterSelect
            ariaLabel="Owner filter"
            value="me"
            onValueChange={() => undefined}
            placeholder="Owner"
            options={[{ value: "me", label: "Only me" }]}
          />
          <FilterSelect
            ariaLabel="Select date range"
            value={rangeKey}
            onValueChange={(value) => setRangeKey(value as DashboardRangeKey)}
            placeholder="Range"
            options={DASHBOARD_RANGE_OPTIONS.map((option) => ({
              value: option.key,
              label: option.label,
            }))}
            icon={<CalendarRangeIcon className="size-3.5 text-muted-foreground" />}
          />
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        <Card className="py-0">
          <CardHeader className="grid gap-0 border-b border-border/70 px-0 py-0 md:grid-cols-3">
            <SummaryCell
              label="Total time"
              value={formatMetricDuration(metrics.totalSeconds)}
              detail={`${metrics.totalSessions} sessions`}
            />
            <SummaryCell
              label="Top project"
              value={metrics.topProjectName}
              detail={formatCompactDuration(metrics.topProjectSeconds)}
              bordered
            />
            <SummaryCell
              label="Top tag"
              value={metrics.topTagName}
              detail={formatCompactDuration(metrics.topTagSeconds)}
              bordered
            />
          </CardHeader>

          <CardContent className="px-0 py-0">
            {trackerOverview.isLoading ? (
              <div className="space-y-4 p-4">
                <Skeleton className="h-[280px] w-full" />
                <div className="grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)]">
                  <Skeleton className="h-[220px] w-[220px] justify-self-center" />
                  <div className="space-y-3">
                    {Array.from({ length: 3 }, (_, index) => (
                      <Skeleton key={index} className="h-12 w-full" />
                    ))}
                  </div>
                </div>
              </div>
            ) : hasEntries ? (
              <>
                <div className="border-b border-border/70 px-3 py-3 md:px-4">
                  <ChartContainer config={dailyChartConfig} className="h-[300px] w-full">
                    <BarChart data={metrics.daily} barGap={10}>
                      <CartesianGrid vertical={false} />
                      <XAxis
                        dataKey="label"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={10}
                        minTickGap={18}
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        tickMargin={10}
                        width={42}
                        tickFormatter={(value) => `${value}h`}
                      />
                      <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
                      <Bar
                        dataKey="totalHours"
                        fill="var(--color-totalHours)"
                        maxBarSize={28}
                        radius={[0, 0, 0, 0]}
                      />
                    </BarChart>
                  </ChartContainer>
                </div>

                <div className="grid gap-5 px-3 py-4 md:px-4 lg:grid-cols-[260px_minmax(0,1fr)] lg:items-center">
                  <div className="relative mx-auto flex w-full max-w-[220px] items-center justify-center">
                    <ChartContainer
                      config={projectChartConfig}
                      className="aspect-square h-[220px] w-full"
                    >
                      <PieChart>
                        <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
                        <Pie
                          data={metrics.projects}
                          dataKey="hours"
                          nameKey="name"
                          innerRadius={54}
                          outerRadius={88}
                          paddingAngle={2}
                          strokeWidth={0}
                        >
                          {metrics.projects.map((project) => (
                            <Cell key={project.name} fill={project.fill} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ChartContainer>
                    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-xl font-semibold">
                        {formatMetricDuration(metrics.totalSeconds)}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {metrics.projects.map((project) => (
                      <div
                        key={project.name}
                        className="grid gap-2 sm:grid-cols-[minmax(0,220px)_auto_minmax(120px,1fr)_auto] sm:items-center"
                      >
                        <div className="truncate text-sm font-medium">{project.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {formatMetricDuration(project.seconds)}
                        </div>
                        <ShareBar percentage={project.percentage} color={project.fill} />
                        <div className="text-right text-sm text-muted-foreground">
                          {formatProjectShare(project.percentage)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <EmptyState
                title="No tracked time in this range"
                description="Log a few sessions from the tracker to populate the dashboard."
              />
            )}
          </CardContent>
        </Card>

        <Card className="py-0">
          <CardHeader className="border-b border-border/70 py-3">
            <div>
              <CardTitle>Most tracked activities</CardTitle>
              <CardDescription>Top work items in {rangeLabel.toLowerCase()}.</CardDescription>
            </div>
            <CardAction>
              <Badge variant="outline">Top {Math.min(metrics.activities.length || 8, 10)}</Badge>
            </CardAction>
          </CardHeader>
          <CardContent className="px-0 py-0">
            {trackerOverview.isLoading ? (
              <div className="space-y-2 p-3">
                {Array.from({ length: 8 }, (_, index) => (
                  <Skeleton key={index} className="h-14 w-full" />
                ))}
              </div>
            ) : metrics.activities.length ? (
              metrics.activities.map((activity, index) => (
                <div
                  key={`${activity.name}-${activity.projectName}`}
                  className={cn(
                    "flex items-start justify-between gap-3 border-b border-border/70 px-4 py-3",
                    index === metrics.activities.length - 1 && "border-b-0",
                  )}
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{activity.name}</p>
                    <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="size-1.5 shrink-0 rounded-full bg-[hsl(174_84%_32%)]" />
                      <span className="truncate">{activity.projectName}</span>
                    </div>
                  </div>
                  <div className="shrink-0 text-right text-sm font-medium">
                    {formatMetricDuration(activity.totalSeconds)}
                  </div>
                </div>
              ))
            ) : (
              <EmptyState
                title="No activities ranked yet"
                description="Once you have tracked entries, your top activities will appear here."
                className="m-3 min-h-[240px]"
              />
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function FilterSelect({
  ariaLabel,
  value,
  onValueChange,
  placeholder,
  options,
  icon,
}: {
  ariaLabel: string;
  value: string;
  onValueChange: (value: string) => void;
  placeholder: string;
  options: Array<{ value: string; label: string }>;
  icon?: ReactNode;
}) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger aria-label={ariaLabel} className="min-w-28 bg-background text-sm">
        {icon}
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function SummaryCell({
  label,
  value,
  detail,
  bordered = false,
}: {
  label: string;
  value: string;
  detail: string;
  bordered?: boolean;
}) {
  return (
    <div
      className={cn(
        "space-y-1 px-4 py-5",
        bordered && "border-t border-border/70 md:border-t-0 md:border-l",
      )}
    >
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="truncate text-[2rem] leading-none font-medium tracking-tight">{value}</p>
      <p className="text-xs text-muted-foreground">{detail}</p>
    </div>
  );
}

function ShareBar({ percentage, color }: { percentage: number; color: string }) {
  return (
    <div className="h-3 w-full bg-muted">
      <div className="h-full" style={{ width: `${percentage}%`, backgroundColor: color }} />
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
