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
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import z from "zod";

import Loader from "@/components/loader";
import { AUTH_COPY, AUTH_REDIRECT } from "../constants";
import { authClient } from "@/lib/auth-client";
import OAuthButtons from "./oauth-buttons";

export default function SignInForm({
  onSwitchToSignUp,
  invitationId,
}: {
  onSwitchToSignUp: () => void;
  invitationId?: string;
}) {
  const navigate = useNavigate();
  const { isPending } = authClient.useSession();

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      await authClient.signIn.email(
        { email: value.email, password: value.password },
        {
          onSuccess: async () => {
            if (invitationId) {
              try {
                await authClient.organization.acceptInvitation({ invitationId });
                toast.success("Sign in successful — you've joined the organisation");
              } catch (err: unknown) {
                toast.error(
                  err instanceof Error
                    ? err.message
                    : "Failed to accept invitation. Please try again.",
                );
              }
            } else {
              toast.success("Sign in successful");
            }
            navigate({ to: AUTH_REDIRECT.afterSignIn });
          },
          onError: (error) => {
            toast.error(error.error.message ?? error.error.statusText);
          },
        },
      );
    },
    validators: {
      onSubmit: z.object({
        email: z.email("Invalid email address"),
        password: z.string().min(8, "Password must be at least 8 characters"),
      }),
    },
  });

  if (isPending) return <Loader />;

  return (
    <div className="mx-auto mt-10 w-full max-w-md px-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-semibold">{AUTH_COPY.signIn.title}</CardTitle>
          <CardDescription>Continue with</CardDescription>
          <OAuthButtons invitationId={invitationId} />
        </CardHeader>

        <CardContent>
          <div className="relative mb-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                or sign in with email
              </span>
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
            className="space-y-4"
          >
            <div>
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
                      <p key={error?.message} className="text-red-500">
                        {error?.message}
                      </p>
                    ))}
                  </div>
                )}
              </form.Field>
            </div>

            <div>
              <form.Field name="password">
                {(field) => (
                  <div className="space-y-2">
                    <Label htmlFor={field.name}>Password</Label>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="password"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                    {field.state.meta.errors.map((error) => (
                      <p key={error?.message} className="text-red-500">
                        {error?.message}
                      </p>
                    ))}
                  </div>
                )}
              </form.Field>
            </div>

            <form.Subscribe
              selector={(state) => ({
                canSubmit: state.canSubmit,
                isSubmitting: state.isSubmitting,
              })}
            >
              {({ canSubmit, isSubmitting }) => (
                <Button type="submit" className="w-full" disabled={!canSubmit || isSubmitting}>
                  {isSubmitting ? AUTH_COPY.signIn.submitting : AUTH_COPY.signIn.submit}
                </Button>
              )}
            </form.Subscribe>
          </form>
        </CardContent>

        <CardFooter className="justify-center">
          <Button variant="link" onClick={onSwitchToSignUp} className="px-0">
            {AUTH_COPY.signIn.switchPrompt}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
