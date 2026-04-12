import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/app/_app/manage/")({
  beforeLoad: () => {
    redirect({ to: "/app/manage/projects", throw: true });
  },
});
