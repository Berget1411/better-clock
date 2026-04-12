import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/app/_app/tracker")({
  beforeLoad: () => {
    redirect({ to: "/app", throw: true });
  },
});
