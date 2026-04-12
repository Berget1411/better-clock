import { createFileRoute } from "@tanstack/react-router";

import ReportsPage from "@/features/time-tracker/pages/reports-page";

export const Route = createFileRoute("/app/_app/reports")({
  component: ReportsPage,
});
