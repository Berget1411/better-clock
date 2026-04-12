import type { ComponentType } from "react";
import type { CalendarProps, SlotInfo } from "react-big-calendar";
import type { CalendarEntryEvent, CalendarViewKey } from "../utils/calendar";

import { Calendar } from "react-big-calendar";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";

import { CalendarEvent } from "./calendar-event";
import { CALENDAR_FORMATS, calendarLocalizer, getCalendarEventClassName } from "../utils/calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import "../styles/react-big-calendar.css";

interface CalendarInteractionArgs {
  event: CalendarEntryEvent;
  start: string | Date;
  end: string | Date;
  isAllDay?: boolean;
}

interface TrackerCalendarProps {
  view: CalendarViewKey;
  date: Date;
  events: CalendarEntryEvent[];
  onViewChange: (view: CalendarViewKey) => void;
  onNavigate: (date: Date) => void;
  onSelectEvent: (event: CalendarEntryEvent) => void;
  onSelectSlot: (slot: SlotInfo) => void;
  onEventDrop: (args: CalendarInteractionArgs) => void;
  onEventResize: (args: CalendarInteractionArgs) => void;
}

const DnDCalendar = withDragAndDrop<CalendarEntryEvent>(
  Calendar as ComponentType<CalendarProps<CalendarEntryEvent>>,
);

const minTime = new Date(1970, 0, 1, 0, 0, 0, 0);
const maxTime = new Date(1970, 0, 1, 23, 59, 0, 0);
const scrollToTime = new Date(1970, 0, 1, 8, 0, 0, 0);

export function TrackerCalendar({
  view,
  date,
  events,
  onViewChange,
  onNavigate,
  onSelectEvent,
  onSelectSlot,
  onEventDrop,
  onEventResize,
}: TrackerCalendarProps) {
  return (
    <div className="open-clock-calendar h-[calc(100vh-18rem)] min-h-[42rem] border bg-card ring-1 ring-foreground/10">
      <DnDCalendar
        localizer={calendarLocalizer}
        date={date}
        events={events}
        view={view}
        views={{ week: true, day: true, month: true }}
        defaultView="week"
        formats={CALENDAR_FORMATS}
        toolbar={false}
        selectable
        popup
        drilldownView="day"
        step={30}
        timeslots={2}
        min={minTime}
        max={maxTime}
        scrollToTime={scrollToTime}
        resizable
        draggableAccessor={(event) => event.resource.canEdit}
        resizableAccessor={(event) => event.resource.canEdit}
        onNavigate={onNavigate}
        onView={(nextView) => onViewChange(nextView as CalendarViewKey)}
        onSelectSlot={onSelectSlot}
        onSelectEvent={(event) => onSelectEvent(event)}
        onEventDrop={onEventDrop}
        onEventResize={onEventResize}
        eventPropGetter={(event) => ({ className: getCalendarEventClassName(event) })}
        components={{
          event: CalendarEvent,
        }}
        messages={{
          showMore: (count) => `+${count} more`,
        }}
      />
    </div>
  );
}
