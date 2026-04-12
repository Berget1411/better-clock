import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/app/_app/tags")({
  beforeLoad: () => {
    redirect({ to: "/app/manage/tags", throw: true });
  },
});
