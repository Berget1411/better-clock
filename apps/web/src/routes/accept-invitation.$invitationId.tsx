import { createFileRoute } from "@tanstack/react-router";
import AcceptInvitationPage from "@/features/organization/pages/accept-invitation-page";

export const Route = createFileRoute("/accept-invitation/$invitationId")({
  component: function AcceptInvitation() {
    const { invitationId } = Route.useParams();
    return <AcceptInvitationPage invitationId={invitationId} />;
  },
});
