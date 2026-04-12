import { createFileRoute } from "@tanstack/react-router";

import AiPage from "@/features/ai/pages/ai-page";

export const Route = createFileRoute("/app/_app/ai")({
  component: AiPage,
});
