import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/app/_app/dashboard")({
  beforeLoad: () => {
    redirect({ to: "/app/overview", throw: true });
  },
});
