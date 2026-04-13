import { Button } from "@open-learn/ui/components/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@open-learn/ui/components/card";
import { Input } from "@open-learn/ui/components/input";
import { Label } from "@open-learn/ui/components/label";
import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import z from "zod";

import { AUTH_COPY, AUTH_REDIRECT } from "../constants";
import { authClient } from "@/lib/auth-client";

export default function ResetPasswordForm({ token }: { token: string }) {
  const navigate = useNavigate();

  const form = useForm({
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
    onSubmit: async ({ value }) => {
      const { error } = await authClient.resetPassword({
        newPassword: value.newPassword,
        token,
      });

      if (error) {
        toast.error(error.message ?? error.statusText);
        return;
      }

      toast.success("Password updated. Please sign in.");
      navigate({ to: AUTH_REDIRECT.afterResetPassword });
    },
    validators: {
      onSubmit: z
        .object({
          newPassword: z.string().min(8, "Password must be at least 8 characters"),
          confirmPassword: z.string().min(8, "Password must be at least 8 characters"),
        })
        .refine((value) => value.newPassword === value.confirmPassword, {
          message: "Passwords do not match",
          path: ["confirmPassword"],
        }),
    },
  });

  return (
    <div className="mx-auto mt-10 w-full max-w-md px-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-semibold">{AUTH_COPY.resetPassword.title}</CardTitle>
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
            <form.Field name="newPassword">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>New password</Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="password"
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

            <form.Field name="confirmPassword">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>Confirm new password</Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="password"
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
                    ? AUTH_COPY.resetPassword.submitting
                    : AUTH_COPY.resetPassword.submit}
                </Button>
              )}
            </form.Subscribe>
          </form>
        </CardContent>

        <CardFooter className="justify-center text-sm text-muted-foreground">
          Enter a new password for your account.
        </CardFooter>
      </Card>
    </div>
  );
}
