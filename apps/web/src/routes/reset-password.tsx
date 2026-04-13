import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import ResetPasswordPage from "@/features/auth/pages/reset-password-page";

export const Route = createFileRoute("/reset-password")({
  validateSearch: z.object({
    token: z.string().optional(),
    error: z.string().optional(),
  }),
  component: function ResetPassword() {
    const { token, error } = Route.useSearch();
    return <ResetPasswordPage token={token} error={error} />;
  },
});
