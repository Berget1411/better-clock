import { createFileRoute } from "@tanstack/react-router";

import CalendarPage from "@/features/time-tracker/pages/calendar-page";

export const Route = createFileRoute("/app/_app/calendar")({
  component: CalendarRoute,
});

function CalendarRoute() {
  return <CalendarPage />;
}
