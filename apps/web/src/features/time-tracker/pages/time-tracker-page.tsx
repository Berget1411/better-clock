import { useMemo, useState } from "react";

import {
  AppPage,
  AppPageHeader,
  AppPageHeaderMeta,
  AppSurface,
  AppSurfaceHeader,
} from "@/components/app-page-shell";
import { useTasksQuery } from "@/features/tasks/services/queries";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@open-learn/ui/components/tabs";

import { ActivityHistoryList } from "../components/activity-history-list";
import { ManualEntryForm } from "../components/manual-entry-form";
import { TimerEntryForm } from "../components/timer-entry-form";
import { TRACKER_COPY } from "../constants";
import { useTrackerOverviewQuery } from "../services/queries";
import {
  formatDuration,
  getElapsedSeconds,
  getEntryDurationSeconds,
  getTrackerOverviewRange,
} from "../utils/date-time";

export default function TimeTrackerPage() {
  const [mode, setMode] = useState("timer");
  const [expandedEntryId, setExpandedEntryId] = useState<number | null>(null);
  const range = useMemo(() => getTrackerOverviewRange(), []);
  const trackerOverview = useTrackerOverviewQuery(range);
  const tasksQuery = useTasksQuery();

  const entries = trackerOverview.data?.entries ?? [];
  const activeEntry = trackerOverview.data?.activeEntry ?? null;
  const projects = trackerOverview.data?.projects ?? [];
  const tags = trackerOverview.data?.tags ?? [];

  const todayTotal = useMemo(() => {
    const todayKey = new Date().toDateString();
    const completedToday = entries.reduce((total, entry) => {
      return new Date(entry.startAt).toDateString() === todayKey
        ? total + getEntryDurationSeconds(entry)
        : total;
    }, 0);

    if (!activeEntry || new Date(activeEntry.startAt).toDateString() !== todayKey) {
      return completedToday;
    }

    return completedToday + getElapsedSeconds(activeEntry.startAt, new Date());
  }, [activeEntry, entries]);

  return (
    <Tabs value={mode} onValueChange={setMode}>
      <AppPage>
        <AppPageHeader
          title={TRACKER_COPY.pageTitle}
          description="Start a timer quickly, add manual entries when needed, and keep recent activity easy to understand."
          actions={
            <TabsList variant="line">
              <TabsTrigger value="timer">{TRACKER_COPY.timerTab}</TabsTrigger>
              <TabsTrigger value="manual">{TRACKER_COPY.manualTab}</TabsTrigger>
            </TabsList>
          }
        >
          <AppPageHeaderMeta
            items={[
              { label: "State", value: activeEntry ? "Running" : "Ready" },
              { label: "Today", value: formatDuration(todayTotal) },
              { label: "Sessions", value: String(entries.length) },
            ]}
          />
        </AppPageHeader>

        <AppSurface>
          <AppSurfaceHeader
            label="Capture"
            title={mode === "timer" ? "Track work live" : "Add time after the fact"}
            description={
              mode === "timer"
                ? "Keep the current task in focus and expand details only when you need them."
                : "Use manual mode when the work is already done and the exact time is known."
            }
          />
          <div className="p-4">
            <TabsContent value="timer" className="mt-0">
              <TimerEntryForm
                activeEntry={activeEntry}
                projects={projects}
                tasks={tasksQuery.data ?? []}
                tags={tags}
                range={range}
              />
            </TabsContent>

            <TabsContent value="manual" className="mt-0">
              <ManualEntryForm
                projects={projects}
                tasks={tasksQuery.data ?? []}
                tags={tags}
                range={range}
              />
            </TabsContent>
          </div>
        </AppSurface>

        <AppSurface>
          <AppSurfaceHeader
            label="History"
            title="Recent activity"
            description="Entries stay grouped by week and day so edits remain scannable."
          />
          <div className="p-4">
            <ActivityHistoryList
              entries={entries}
              projects={projects}
              tasks={tasksQuery.data ?? []}
              tags={tags}
              range={range}
              expandedEntryId={expandedEntryId}
              onExpandedEntryChange={setExpandedEntryId}
              isLoading={trackerOverview.isLoading || tasksQuery.isLoading}
            />
          </div>
        </AppSurface>
      </AppPage>
    </Tabs>
  );
}
