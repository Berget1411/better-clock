import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, XAxis, YAxis } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@open-learn/ui/components/chart";

import { formatMetricDuration } from "../utils/dashboard";

const dailyChartConfig = {
  totalHours: {
    label: "Tracked hours",
    color: "hsl(174 84% 32%)",
  },
  billableHours: {
    label: "Billable hours",
    color: "hsl(200 78% 46%)",
  },
} satisfies ChartConfig;

const projectChartConfig = {
  percentage: {
    label: "Project share",
    color: "hsl(174 84% 32%)",
  },
} satisfies ChartConfig;

interface DailyEntry {
  label: string;
  totalHours: number;
  billableHours: number;
}

interface ProjectEntry {
  name: string;
  seconds: number;
  percentage: number;
  fill: string;
}

export function ReportsBarChart({ daily }: { daily: DailyEntry[] }) {
  return (
    <ChartContainer config={dailyChartConfig} className="h-[280px] w-full">
      <BarChart data={daily} barGap={8}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={10} minTickGap={16} />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={10}
          width={40}
          tickFormatter={(value) => `${value}h`}
        />
        <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
        <Bar dataKey="totalHours" fill="var(--color-totalHours)" maxBarSize={24} />
        <Bar dataKey="billableHours" fill="var(--color-billableHours)" maxBarSize={24} />
      </BarChart>
    </ChartContainer>
  );
}

export function ReportsPieChart({
  projects,
  totalSeconds,
}: {
  projects: ProjectEntry[];
  totalSeconds: number;
}) {
  return (
    <div className="grid gap-3 p-3">
      <div className="relative mx-auto flex w-full max-w-[210px] items-center justify-center">
        <ChartContainer config={projectChartConfig} className="aspect-square h-[210px] w-full">
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
