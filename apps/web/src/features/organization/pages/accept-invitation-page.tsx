import * as React from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@open-learn/ui/components/card";
import { Button } from "@open-learn/ui/components/button";
import { Skeleton } from "@open-learn/ui/components/skeleton";
import { authClient } from "@/lib/auth-client";

interface AcceptInvitationPageProps {
  invitationId: string;
}

export default function AcceptInvitationPage({ invitationId }: AcceptInvitationPageProps) {
  const navigate = useNavigate();
  const [accepting, setAccepting] = React.useState(false);
  const [declining, setDeclining] = React.useState(false);

  const sessionQuery = useQuery({
    queryKey: ["session"],
    queryFn: () => authClient.getSession(),
    staleTime: 15_000,
  });

  const isSignedIn = !!sessionQuery.data?.data?.user;

  // If not signed in, redirect to login with the invitationId preserved
  React.useEffect(() => {
    if (!sessionQuery.isPending && !isSignedIn) {
      navigate({ to: "/login", search: { invitationId } });
    }
  }, [sessionQuery.isPending, isSignedIn, invitationId, navigate]);

  async function handleAccept() {
    setAccepting(true);
    try {
      const result = await authClient.organization.acceptInvitation({ invitationId });
      if (result.error) throw new Error(result.error.message);
      toast.success("You've joined the organisation");
      navigate({ to: "/app" });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to accept invitation");
    } finally {
      setAccepting(false);
    }
  }

  async function handleDecline() {
    setDeclining(true);
    try {
      const result = await authClient.organization.rejectInvitation({ invitationId });
      if (result.error) throw new Error(result.error.message);
      toast.success("Invitation declined");
      navigate({ to: "/app" });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to decline invitation");
    } finally {
      setDeclining(false);
    }
  }

  if (sessionQuery.isPending) {
    return (
      <div className="mx-auto mt-20 max-w-md px-6 space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  if (!isSignedIn) {
    // Redirecting — show nothing
    return null;
  }

  return (
    <div className="mx-auto mt-20 max-w-md px-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-semibold">Organisation Invitation</CardTitle>
          <CardDescription>
            You've been invited to join an organisation on Open Clock.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Button onClick={handleAccept} disabled={accepting || declining} className="w-full">
            {accepting ? "Accepting…" : "Accept invitation"}
          </Button>
          <Button
            variant="outline"
            onClick={handleDecline}
            disabled={accepting || declining}
            className="w-full"
          >
            {declining ? "Declining…" : "Decline"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
