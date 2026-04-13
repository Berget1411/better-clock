import { Button } from "@open-learn/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@open-learn/ui/components/card";
import { Input } from "@open-learn/ui/components/input";
import { Label } from "@open-learn/ui/components/label";
import { useForm } from "@tanstack/react-form";
import { MailCheckIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import z from "zod";

import { AUTH_COPY } from "../constants";
import { authClient } from "@/lib/auth-client";

export default function ForgotPasswordForm({ onBackToSignIn }: { onBackToSignIn: () => void }) {
  const [submitted, setSubmitted] = useState(false);

  const form = useForm({
    defaultValues: {
      email: "",
    },
    onSubmit: async ({ value }) => {
      const { error } = await authClient.requestPasswordReset({
        email: value.email,
        redirectTo: window.location.origin + "/reset-password",
      });

      if (error) {
        toast.error(error.message ?? error.statusText);
        return;
      }

      setSubmitted(true);
    },
    validators: {
      onSubmit: z.object({
        email: z.email("Invalid email address"),
      }),
    },
  });

  if (submitted) {
    return (
      <div className="mx-auto mt-10 w-full max-w-md px-6">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-muted">
              <MailCheckIcon className="size-6 text-muted-foreground" />
            </div>
            <CardTitle className="text-2xl font-semibold">
              {AUTH_COPY.forgotPassword.successTitle}
            </CardTitle>
            <CardDescription>{AUTH_COPY.forgotPassword.successDescription}</CardDescription>
          </CardHeader>
          <CardFooter className="justify-center">
            <Button variant="link" onClick={onBackToSignIn} className="px-0">
              {AUTH_COPY.forgotPassword.backToSignIn}
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto mt-10 w-full max-w-md px-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-semibold">{AUTH_COPY.forgotPassword.title}</CardTitle>
          <CardDescription>{AUTH_COPY.forgotPassword.description}</CardDescription>
        </CardHeader>

        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
            className="space-y-4"
          >
            <form.Field name="email">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>Email</Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="email"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  {field.state.meta.errors.map((error) => (
                    <p key={error?.message} className="text-xs text-destructive">
                      {error?.message}
                    </p>
                  ))}
                </div>
              )}
            </form.Field>

            <form.Subscribe
              selector={(state) => ({
                canSubmit: state.canSubmit,
                isSubmitting: state.isSubmitting,
              })}
            >
              {({ canSubmit, isSubmitting }) => (
                <Button type="submit" className="w-full" disabled={!canSubmit || isSubmitting}>
                  {isSubmitting
                    ? AUTH_COPY.forgotPassword.submitting
                    : AUTH_COPY.forgotPassword.submit}
                </Button>
              )}
            </form.Subscribe>
          </form>
        </CardContent>

        <CardFooter className="justify-center">
          <Button variant="link" onClick={onBackToSignIn} className="px-0">
            {AUTH_COPY.forgotPassword.backToSignIn}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
