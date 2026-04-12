import { createFileRoute } from "@tanstack/react-router";

import TrackerDashboardPage from "@/features/time-tracker/pages/tracker-dashboard-page";

export const Route = createFileRoute("/app/_app/overview")({
  component: TrackerDashboardPage,
});
