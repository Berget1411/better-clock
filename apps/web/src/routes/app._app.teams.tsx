import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/app/_app/teams")({
  beforeLoad: () => {
    redirect({ to: "/app/manage/teams", throw: true });
  },
});
