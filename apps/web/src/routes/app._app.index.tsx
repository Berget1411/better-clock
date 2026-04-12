import { createFileRoute } from "@tanstack/react-router";

import TimeTrackerPage from "@/features/time-tracker/pages/time-tracker-page";

export const Route = createFileRoute("/app/_app/")({
  component: TimeTrackerPage,
});
