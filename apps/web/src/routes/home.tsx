import { createFileRoute } from "@tanstack/react-router";

import HomePage from "@/features/home/pages/home-page";

export const Route = createFileRoute("/home")({
  component: HomePage,
  head: () => ({
    meta: [
      {
        title: "Open Clock Home",
      },
      {
        name: "description",
        content: "Simple dashboard landing page for Open Clock.",
      },
    ],
  }),
});
