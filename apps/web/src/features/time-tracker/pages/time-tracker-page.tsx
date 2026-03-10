import { useMemo, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@open-learn/ui/components/tabs";

import { ActivityHistoryList } from "../components/activity-history-list";
import { ManualEntryForm } from "../components/manual-entry-form";
import { TimerEntryForm } from "../components/timer-entry-form";
import { TRACKER_COPY } from "../constants";
import { useTrackerOverviewQuery } from "../services/queries";
import { getTrackerOverviewRange } from "../utils/date-time";

export default function TimeTrackerPage() {
  const [mode, setMode] = useState("timer");
  const [expandedEntryId, setExpandedEntryId] = useState<number | null>(null);
  const range = useMemo(() => getTrackerOverviewRange(), []);
  const trackerOverview = useTrackerOverviewQuery(range);

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold">{TRACKER_COPY.pageTitle}</h1>
        <p className="text-sm text-muted-foreground">{TRACKER_COPY.pageDescription}</p>
      </div>

      <Tabs value={mode} onValueChange={setMode} className="flex flex-col gap-3">
        <div className="flex justify-start">
          <TabsList variant="line">
            <TabsTrigger value="timer">{TRACKER_COPY.timerTab}</TabsTrigger>
            <TabsTrigger value="manual">{TRACKER_COPY.manualTab}</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="timer">
          <TimerEntryForm
            activeEntry={trackerOverview.data?.activeEntry ?? null}
            projects={trackerOverview.data?.projects ?? []}
            tags={trackerOverview.data?.tags ?? []}
            range={range}
          />
        </TabsContent>

        <TabsContent value="manual">
          <ManualEntryForm
            projects={trackerOverview.data?.projects ?? []}
            tags={trackerOverview.data?.tags ?? []}
            range={range}
          />
        </TabsContent>
      </Tabs>

      <ActivityHistoryList
        entries={trackerOverview.data?.entries ?? []}
        projects={trackerOverview.data?.projects ?? []}
        tags={trackerOverview.data?.tags ?? []}
        range={range}
        expandedEntryId={expandedEntryId}
        onExpandedEntryChange={setExpandedEntryId}
        isLoading={trackerOverview.isLoading}
      />
    </div>
  );
}
