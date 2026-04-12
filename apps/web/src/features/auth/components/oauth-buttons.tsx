import { Button } from "@open-learn/ui/components/button";
import { useState } from "react";
import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";
import { AUTH_REDIRECT } from "../constants";
import { FaGoogle } from "react-icons/fa";

export default function OAuthButtons({ invitationId }: { invitationId?: string }) {
  const [loadingProvider, setLoadingProvider] = useState<"google" | null>(null);

  async function handleOAuth(provider: "google") {
    setLoadingProvider(provider);

    // If there's a pending invitation, send the user back to the accept page
    // after the OAuth round-trip so the invitation is accepted while signed in.
    const callbackPath = invitationId
      ? `/accept-invitation/${invitationId}`
      : AUTH_REDIRECT.afterSignIn;

    await authClient.signIn.social(
      {
        provider,
        callbackURL: window.location.origin + callbackPath,
      },
      {
        onError: (error) => {
          toast.error(error.error.message ?? error.error.statusText);
          setLoadingProvider(null);
        },
      },
    );
  }

  return (
    <div className="flex gap-2 justify-center items-center my-4 ">
      <Button
        type="button"
        size="lg"
        variant="outline"
        className="w-full"
        disabled={loadingProvider !== null}
        onClick={() => handleOAuth("google")}
      >
        <FaGoogle />
        {loadingProvider === "google" ? "Connecting..." : "Google"}
      </Button>
    </div>
  );
}
