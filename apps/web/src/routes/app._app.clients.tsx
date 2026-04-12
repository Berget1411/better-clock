import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/app/_app/clients")({
  beforeLoad: () => {
    redirect({ to: "/app/manage/clients", throw: true });
  },
});
