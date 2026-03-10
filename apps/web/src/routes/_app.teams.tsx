import { createFileRoute } from "@tanstack/react-router";
import TeamsPage from "@/features/organization/pages/teams-page";

export const Route = createFileRoute("/_app/teams")({
  component: TeamsPage,
});
