import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, XAxis, YAxis } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@open-learn/ui/components/chart";

import { formatMetricDuration, formatProjectShare } from "../utils/dashboard";

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
  hours: {
    label: "Hours",
    color: "hsl(174 84% 32%)",
  },
} satisfies ChartConfig;

interface DailyEntry {
  label: string;
  totalHours: number;
  billableHours: number;
}

interface BreakdownItem {
  name: string;
  seconds: number;
  hours: number;
  percentage: number;
  fill: string;
}

function ShareBar({ percentage, color }: { percentage: number; color: string }) {
  return (
    <div className="h-3 w-full bg-muted">
      <div className="h-full" style={{ width: `${percentage}%`, backgroundColor: color }} />
    </div>
  );
}

export function DashboardBarChart({ daily }: { daily: DailyEntry[] }) {
  return (
    <ChartContainer config={dailyChartConfig} className="h-[300px] w-full">
      <BarChart data={daily} barGap={10}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={10} minTickGap={18} />
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
        <Bar
          dataKey="billableHours"
          fill="var(--color-billableHours)"
          maxBarSize={28}
          radius={[0, 0, 0, 0]}
        />
      </BarChart>
    </ChartContainer>
  );
}

export function DashboardPieChart({
  breakdownItems,
  totalSeconds,
}: {
  breakdownItems: BreakdownItem[];
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
