import { createFileRoute } from "@tanstack/react-router";

import HomePage from "@/features/home/pages/home-page";

export const Route = createFileRoute("/")({
  component: HomePage,
  head: () => ({
    meta: [
      {
        title: "better clock | Home",
      },
      {
        name: "description",
        content: "Track time with clear project context and a calm workspace.",
      },
    ],
  }),
});
