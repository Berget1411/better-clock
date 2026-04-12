import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, XAxis, YAxis } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@open-learn/ui/components/chart";

import { formatMetricDuration, formatProjectShare } from "../utils/dashboard";

// ─── Shared config & types ────────────────────────────────────────────────────

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

export interface DailyEntry {
  label: string;
  totalHours: number;
}

export interface PieChartItem {
  name: string;
  seconds: number;
  hours?: number;
  percentage: number;
  fill: string;
}

// ─── Shared sub-components ────────────────────────────────────────────────────

function ShareBar({ percentage, color }: { percentage: number; color: string }) {
  return (
    <div className="h-3 w-full bg-muted">
      <div className="h-full" style={{ width: `${percentage}%`, backgroundColor: color }} />
    </div>
  );
}

// ─── TrackerBarChart ──────────────────────────────────────────────────────────

interface TrackerBarChartProps {
  daily: DailyEntry[];
  /** Container height in px. Default: 300 */
  height?: number;
  /** Gap between bars. Default: 10 */
  barGap?: number;
  /** Maximum bar width in px. Default: 28 */
  maxBarSize?: number;
  /** Minimum tick gap on X axis. Default: 18 */
  minTickGap?: number;
  /** Y axis width in px. Default: 42 */
  yAxisWidth?: number;
}

export function TrackerBarChart({
  daily,
  height = 300,
  barGap = 10,
  maxBarSize = 28,
  minTickGap = 18,
  yAxisWidth = 42,
}: TrackerBarChartProps) {
  return (
    <ChartContainer config={dailyChartConfig} className="w-full" style={{ height }}>
      <BarChart data={daily} barGap={barGap}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tickMargin={10}
          minTickGap={minTickGap}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={10}
          width={yAxisWidth}
          tickFormatter={(value) => `${value}h`}
        />
        <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
        <Bar
          dataKey="totalHours"
          fill="var(--color-totalHours)"
          maxBarSize={maxBarSize}
          radius={[0, 0, 0, 0]}
        />
      </BarChart>
    </ChartContainer>
  );
}

// ─── DashboardPieChart ────────────────────────────────────────────────────────

export function DashboardPieChart({
  breakdownItems,
  totalSeconds,
}: {
  breakdownItems: PieChartItem[];
  totalSeconds: number;
}) {
  return (
    <div className="grid gap-5 px-3 py-4 md:px-4 lg:grid-cols-[260px_minmax(0,1fr)] lg:items-center">
      <div className="relative mx-auto flex w-full max-w-[220px] items-center justify-center">
        <ChartContainer config={projectChartConfig} className="aspect-square h-[220px] w-full">
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
            <Pie
              data={breakdownItems}
              dataKey="hours"
              nameKey="name"
              innerRadius={54}
              outerRadius={88}
              paddingAngle={2}
              strokeWidth={0}
            >
              {breakdownItems.map((item) => (
                <Cell key={item.name} fill={item.fill} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-semibold">{formatMetricDuration(totalSeconds)}</span>
        </div>
      </div>

      <div className="space-y-4">
        {breakdownItems.map((item) => (
          <div
            key={item.name}
            className="grid gap-2 sm:grid-cols-[minmax(0,220px)_auto_minmax(120px,1fr)_auto] sm:items-center"
          >
            <div className="truncate text-sm font-medium">{item.name}</div>
            <div className="text-sm text-muted-foreground">
              {formatMetricDuration(item.seconds)}
            </div>
            <ShareBar percentage={item.percentage} color={item.fill} />
            <div className="text-right text-sm text-muted-foreground">
              {formatProjectShare(item.percentage)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── ReportsPieChart ──────────────────────────────────────────────────────────

const reportsPieConfig = {
  percentage: {
    label: "Project share",
    color: "hsl(174 84% 32%)",
  },
} satisfies ChartConfig;

export function ReportsPieChart({
  projects,
  totalSeconds,
}: {
  projects: PieChartItem[];
  totalSeconds: number;
}) {
  return (
    <div className="grid gap-3 p-3">
      <div className="relative mx-auto flex w-full max-w-[210px] items-center justify-center">
        <ChartContainer config={reportsPieConfig} className="aspect-square h-[210px] w-full">
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
            <Pie
              data={projects}
              dataKey="seconds"
              nameKey="name"
              innerRadius={54}
              outerRadius={84}
              paddingAngle={2}
              strokeWidth={0}
            >
              {projects.map((project) => (
                <Cell key={project.name} fill={project.fill} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-semibold">{formatMetricDuration(totalSeconds)}</span>
          <span className="text-[11px] text-muted-foreground">total tracked</span>
        </div>
      </div>

      <div className="space-y-2">
        {projects.map((project) => (
          <div
            key={project.name}
            className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-2 text-xs"
          >
            <div className="flex min-w-0 items-center gap-2">
              <span
                className="size-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: project.fill }}
              />
              <span className="truncate font-medium">{project.name}</span>
            </div>
            <span className="text-muted-foreground">{formatMetricDuration(project.seconds)}</span>
            <span className="text-muted-foreground">{project.percentage.toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
