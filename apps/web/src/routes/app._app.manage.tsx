import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/app/_app/manage")({
  component: ManageRoute,
});

function ManageRoute() {
  return <Outlet />;
}
