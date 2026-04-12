import { createFileRoute } from "@tanstack/react-router";
import TagsPage from "@/features/tags/pages/tags-page";

export const Route = createFileRoute("/app/_app/tags")({
  component: TagsPage,
});
