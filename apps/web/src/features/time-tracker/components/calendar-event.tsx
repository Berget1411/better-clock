import type { EventProps } from "react-big-calendar";
import type { CalendarEntryEvent } from "../utils/calendar";

import { formatCalendarEventDuration } from "../utils/calendar";

export function CalendarEvent({ event }: EventProps<CalendarEntryEvent>) {
  return (
    <div className="flex h-full min-w-0 flex-col gap-1 overflow-hidden px-1 py-0.5 text-xs">
      <div className="truncate font-medium leading-tight">{event.title}</div>
      <div className="truncate text-[11px] text-muted-foreground">{event.resource.projectName}</div>
      <div className="mt-auto truncate text-[11px] tabular-nums text-muted-foreground">
        {formatCalendarEventDuration(event.resource.durationSeconds)}
      </div>
    </div>
  );
}
