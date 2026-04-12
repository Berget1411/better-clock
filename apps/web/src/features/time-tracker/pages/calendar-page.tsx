import type { TrackerEntry } from "@open-learn/api/modules/time-tracker/time-tracker.schema";
import type { SlotInfo } from "react-big-calendar";
import type { CalendarEntryEvent, CalendarSheetMode, CalendarViewKey } from "../utils/calendar";

import { useEffect, useMemo, useState } from "react";
import { CalendarClockIcon } from "lucide-react";

import { AppPage, AppPageHeader, AppPageHeaderMeta } from "@/components/app-page-shell";
import { useTasksQuery } from "@/features/tasks/services/queries";
import { Button } from "@open-learn/ui/components/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@open-learn/ui/components/empty";
import { Skeleton } from "@open-learn/ui/components/skeleton";

import { CALENDAR_COPY } from "../constants/calendar";
import { CalendarActiveTimerCard } from "../components/calendar-active-timer-card";
import { CalendarEntrySheet } from "../components/calendar-entry-sheet";
import { CalendarToolbar } from "../components/calendar-toolbar";
import { TrackerCalendar } from "../components/tracker-calendar";
import { useUpdateEntry } from "../services/mutations";
import { useTrackerOverviewQuery } from "../services/queries";
import {
  getCalendarRange,
  getCalendarViewTitle,
  getDefaultSlotEnd,
  mapTrackerEntriesToCalendarEvents,
  shiftCalendarDate,
} from "../utils/calendar";

interface CalendarSheetState {
  mode: CalendarSheetMode;
  entry: TrackerEntry | null;
  selection: { start: Date; end: Date } | null;
}

export default function CalendarPage() {
  const [view, setView] = useState<CalendarViewKey>("week");
  const [focusedDate, setFocusedDate] = useState(() => new Date());
  const [projectFilter, setProjectFilter] = useState<string>("all");
  const [sheetState, setSheetState] = useState<CalendarSheetState | null>(null);
  const [now, setNow] = useState(() => new Date());

  const range = useMemo(() => getCalendarRange(view, focusedDate), [focusedDate, view]);
  const trackerOverview = useTrackerOverviewQuery(range);
  const tasksQuery = useTasksQuery();
  const updateEntry = useUpdateEntry(range);

  useEffect(() => {
    if (!trackerOverview.data?.activeEntry) {
      return;
    }

    const timer = window.setInterval(() => setNow(new Date()), 30_000);

    return () => window.clearInterval(timer);
  }, [trackerOverview.data?.activeEntry]);

  const filteredEntries = useMemo(() => {
    const entries = trackerOverview.data?.entries ?? [];

    return entries.filter((entry) => {
      return projectFilter === "all" ? true : String(entry.project?.id ?? "") === projectFilter;
    });
  }, [projectFilter, trackerOverview.data?.entries]);

  const visibleEvents = useMemo(
    () =>
      mapTrackerEntriesToCalendarEvents({
        entries: filteredEntries,
        activeEntry:
          trackerOverview.data?.activeEntry &&
          (projectFilter === "all" ||
            String(trackerOverview.data.activeEntry.project?.id ?? "") === projectFilter)
            ? trackerOverview.data.activeEntry
            : null,
        now,
      }),
    [filteredEntries, now, projectFilter, trackerOverview.data?.activeEntry],
  );

  const title = useMemo(() => getCalendarViewTitle(view, focusedDate), [focusedDate, view]);

  const handleSelectSlot = (slot: SlotInfo) => {
    if (view === "month") {
      const start = new Date(slot.start);
      start.setHours(9, 0, 0, 0);
      const end = new Date(start);
      end.setHours(10, 0, 0, 0);

      setSheetState({
        mode: "create",
        entry: null,
        selection: { start, end },
      });
      return;
    }

    const start = new Date(slot.start);
    const end = slot.end > slot.start ? new Date(slot.end) : getDefaultSlotEnd(start);

    setSheetState({
      mode: "create",
      entry: null,
      selection: { start, end },
    });
  };

  const handleSelectEvent = (event: CalendarEntryEvent) => {
    if (!event.resource.canEdit) {
      return;
    }

    const entry =
      trackerOverview.data?.entries.find((item) => item.id === event.resource.entryId) ?? null;

    if (!entry) {
      return;
    }

    setSheetState({
      mode: "edit",
      entry,
      selection: null,
    });
  };

  const persistEventTimeChange = async ({
    event,
    start,
    end,
  }: {
    event: CalendarEntryEvent;
    start: string | Date;
    end: string | Date;
  }) => {
    if (!event.resource.canEdit) {
      return;
    }

    const entry = trackerOverview.data?.entries.find((item) => item.id === event.resource.entryId);

    if (!entry) {
      return;
    }

    try {
      await updateEntry.mutateAsync({
        entryId: entry.id,
        description: entry.description.trim(),
        projectId: entry.project?.id ?? null,
        taskId: entry.task?.id ?? null,
        tagIds: entry.tags.map((tag) => tag.id),
        isBillable: entry.isBillable,
        startAt: new Date(start).toISOString(),
        endAt: new Date(end).toISOString(),
      });
    } catch {
      // useUpdateEntry handles rollback + user-facing errors in its onError callback.
    }
  };

  const isLoading = (trackerOverview.isLoading && !trackerOverview.data) || tasksQuery.isLoading;

  return (
    <AppPage>
      <AppPageHeader
        title={CALENDAR_COPY.pageTitle}
        description="Review your schedule visually, move finished work in context, and create entries directly from the calendar."
      >
        <AppPageHeaderMeta
          items={[
            { label: "View", value: view },
            { label: "Range", value: title },
            {
              label: "Project",
              value:
                projectFilter === "all"
                  ? "All"
                  : (trackerOverview.data?.projects.find(
                      (project) => String(project.id) === projectFilter,
                    )?.name ?? "Filtered"),
            },
          ]}
        />
      </AppPageHeader>

      <CalendarToolbar
        title={title}
        view={view}
        projectFilter={projectFilter}
        projects={trackerOverview.data?.projects ?? []}
        onViewChange={setView}
        onProjectFilterChange={setProjectFilter}
        onToday={() => setFocusedDate(new Date())}
        onPrevious={() => setFocusedDate((current) => shiftCalendarDate(view, current, -1))}
        onNext={() => setFocusedDate((current) => shiftCalendarDate(view, current, 1))}
      />

      {trackerOverview.data?.activeEntry ? (
        <CalendarActiveTimerCard
          activeEntry={trackerOverview.data.activeEntry}
          now={now}
          range={range}
        />
      ) : null}

      {isLoading ? (
        <Skeleton className="h-[calc(100vh-18rem)] min-h-[42rem] w-full border" />
      ) : (
        <div className="flex flex-col gap-4">
          {visibleEvents.length === 0 ? (
            <Empty className="border bg-card py-10 ring-1 ring-foreground/10">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <CalendarClockIcon className="size-4" />
                </EmptyMedia>
                <EmptyTitle>{CALENDAR_COPY.emptyTitle}</EmptyTitle>
                <EmptyDescription>{CALENDAR_COPY.emptyDescription}</EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button
                  type="button"
                  className="h-8 px-3"
                  onClick={() => {
                    const start = new Date();
                    start.setMinutes(0, 0, 0);
                    setSheetState({
                      mode: "create",
                      entry: null,
                      selection: { start, end: getDefaultSlotEnd(start) },
                    });
                  }}
                >
                  {CALENDAR_COPY.createEntry}
                </Button>
              </EmptyContent>
            </Empty>
          ) : null}

          <TrackerCalendar
            view={view}
            date={focusedDate}
            events={visibleEvents}
            onViewChange={setView}
            onNavigate={setFocusedDate}
            onSelectEvent={handleSelectEvent}
            onSelectSlot={handleSelectSlot}
            onEventDrop={persistEventTimeChange}
            onEventResize={persistEventTimeChange}
          />
        </div>
      )}

      <CalendarEntrySheet
        open={sheetState !== null}
        mode={sheetState?.mode ?? "create"}
        entry={sheetState?.entry ?? null}
        selection={sheetState?.selection ?? null}
        projects={trackerOverview.data?.projects ?? []}
        tasks={tasksQuery.data ?? []}
        tags={trackerOverview.data?.tags ?? []}
        range={range}
        onOpenChange={(open) => {
          if (!open) {
            setSheetState(null);
          }
        }}
      />
    </AppPage>
  );
}
