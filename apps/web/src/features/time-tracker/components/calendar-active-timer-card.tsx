import type { TrackerEntry } from "@open-learn/api/modules/time-tracker/time-tracker.schema";
import type { TrackerOverviewRange } from "../utils/date-time";

import { Button } from "@open-learn/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@open-learn/ui/components/card";
import { Link } from "@tanstack/react-router";
import { Clock3Icon, SquareIcon } from "lucide-react";

import { useStopTimer } from "../services/mutations";
import { formatDuration, formatTime, getElapsedSeconds } from "../utils/date-time";

interface CalendarActiveTimerCardProps {
  activeEntry: TrackerEntry;
  now: Date;
  range: TrackerOverviewRange;
}

export function CalendarActiveTimerCard({ activeEntry, now, range }: CalendarActiveTimerCardProps) {
  const stopTimer = useStopTimer(range);
  const duration = formatDuration(getElapsedSeconds(activeEntry.startAt, now));

  return (
    <Card size="sm" className="gap-3 border bg-card/80">
      <CardHeader className="gap-2 border-b py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Clock3Icon className="size-3.5 text-[hsl(174_84%_32%)]" />
              Active timer
            </CardTitle>
            <CardDescription>
              Running since {formatTime(activeEntry.startAt)} ·{" "}
              {activeEntry.project?.name ?? "Without project"}
            </CardDescription>
          </div>
          <div className="text-sm font-medium tabular-nums">{duration}</div>
        </div>
      </CardHeader>
      <CardContent className="pb-0">
        <div className="text-sm font-medium">
          {activeEntry.description.trim() || activeEntry.task?.title || "No description"}
        </div>
      </CardContent>
      <CardFooter className="justify-between gap-2">
        <Button asChild variant="outline" className="h-8 px-3">
          <Link to="/tracker">Open tracker</Link>
        </Button>
        <Button
          type="button"
          className="h-8 px-3"
          onClick={() => stopTimer.mutate({ entryId: activeEntry.id })}
          disabled={stopTimer.isPending}
        >
          <SquareIcon />
          Stop now
        </Button>
      </CardFooter>
    </Card>
  );
}
