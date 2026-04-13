import { Button } from "@open-learn/ui/components/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@open-learn/ui/components/card";
import { Link, useNavigate } from "@tanstack/react-router";
import { ShieldAlertIcon } from "lucide-react";
import { useEffect } from "react";

import ResetPasswordForm from "../components/reset-password-form";

export default function ResetPasswordPage({ token, error }: { token?: string; error?: string }) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!token && !error) {
      navigate({ to: "/login" });
    }
  }, [token, error, navigate]);

  if (error) {
    return (
      <div className="mx-auto mt-10 w-full max-w-md px-6">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-destructive/10">
              <ShieldAlertIcon className="size-6 text-destructive" />
            </div>
            <CardTitle className="text-2xl font-semibold">Link expired</CardTitle>
            <CardDescription>
              This password reset link has expired or is invalid. Please request a new one.
            </CardDescription>
          </CardHeader>
          <CardFooter className="justify-center">
            <Button variant="link" asChild className="px-0">
              <Link to="/login">Back to sign in</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (!token) {
    return null;
  }

  return <ResetPasswordForm token={token} />;
}
