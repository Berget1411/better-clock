import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import LoginPage from "@/features/auth/pages/login-page";

export const Route = createFileRoute("/login")({
  validateSearch: z.object({
    invitationId: z.string().optional(),
  }),
  component: function Login() {
    const { invitationId } = Route.useSearch();
    return <LoginPage invitationId={invitationId} />;
  },
});
