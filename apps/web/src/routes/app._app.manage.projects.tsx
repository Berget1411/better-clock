import { createFileRoute } from "@tanstack/react-router";

import ProjectsPage from "@/features/projects/pages/projects-page";

export const Route = createFileRoute("/app/_app/manage/projects")({
  component: ProjectsPage,
});
