import { Button } from "@open-learn/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@open-learn/ui/components/card";
import { MailIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { AUTH_COPY } from "../constants";
import { authClient } from "@/lib/auth-client";

export default function VerifyEmailForm({
  email,
  onBackToSignIn,
}: {
  email: string;
  onBackToSignIn: () => void;
}) {
  const [isResending, setIsResending] = useState(false);

  async function handleResend() {
    setIsResending(true);
    try {
      const { error } = await authClient.sendVerificationEmail({
        email,
        callbackURL: window.location.origin + "/app",
      });
      if (error) {
        toast.error(error.message ?? error.statusText);
      } else {
        toast.success("Verification email sent");
      }
    } finally {
      setIsResending(false);
    }
  }

  return (
    <div className="mx-auto mt-10 w-full max-w-md px-6">
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-muted">
            <MailIcon className="size-6 text-muted-foreground" />
          </div>
          <CardTitle className="text-2xl font-semibold">{AUTH_COPY.verifyEmail.title}</CardTitle>
          <CardDescription>
            {AUTH_COPY.verifyEmail.description}{" "}
            <span className="font-medium text-foreground">{email}</span>
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-3 text-center text-sm text-muted-foreground">
          <p>Click the link in the email to verify your account and get started.</p>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            disabled={isResending}
            onClick={handleResend}
          >
            {isResending ? AUTH_COPY.verifyEmail.resending : AUTH_COPY.verifyEmail.resend}
          </Button>
        </CardContent>

        <CardFooter className="justify-center">
          <Button variant="link" onClick={onBackToSignIn} className="px-0">
            {AUTH_COPY.verifyEmail.backToSignIn}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
