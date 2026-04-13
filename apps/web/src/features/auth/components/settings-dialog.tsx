import { Button } from "@open-learn/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@open-learn/ui/components/dialog";
import { Input } from "@open-learn/ui/components/input";
import { Label } from "@open-learn/ui/components/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@open-learn/ui/components/tabs";
import { useForm } from "@tanstack/react-form";
import { KeyRoundIcon, PaletteIcon, UserIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import z from "zod";

import { useTheme } from "@/components/theme-provider";
import { authClient } from "@/lib/auth-client";

type SettingsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: {
    email: string;
    image?: string | null;
    name?: string | null;
  };
  refetchSession: () => Promise<unknown>;
};

const themeOptions = [
  {
    description: "Always use the light interface.",
    label: "Light",
    value: "light",
  },
  {
    description: "Always use the dark interface.",
    label: "Dark",
    value: "dark",
  },
  {
    description: "Match your system preference.",
    label: "System",
    value: "system",
  },
] as const;

export default function SettingsDialog({
  open,
  onOpenChange,
  refetchSession,
  user,
}: SettingsDialogProps) {
  const { setTheme, theme } = useTheme();
  const currentTheme = theme ?? "system";
  const [canChangePassword, setCanChangePassword] = useState<boolean | null>(null);
  const [isSendingReset, setIsSendingReset] = useState(false);

  useEffect(() => {
    if (!open) {
      setCanChangePassword(null);
      return;
    }

    setCanChangePassword(null);

    let isCancelled = false;

    async function loadAccounts() {
      const { data, error } = await authClient.listAccounts();

      if (isCancelled) {
        return;
      }

      if (error) {
        setCanChangePassword(false);
        return;
      }

      setCanChangePassword(data.some((account) => account.providerId === "credential"));
    }

    void loadAccounts();

    return () => {
      isCancelled = true;
    };
  }, [open, user.email]);

  const profileForm = useForm({
    defaultValues: {
      image: user.image ?? "",
      name: user.name ?? "",
    },
    onSubmit: async ({ value }) => {
      const trimmedName = value.name.trim();
      const trimmedImage = value.image.trim();
      const updates: { image: string | null; name: string } = {
        image: trimmedImage || null,
        name: trimmedName,
      };

      const { error } = await authClient.updateUser(updates);

      if (error) {
        toast.error(error.message ?? error.statusText);
        return;
      }

      await refetchSession();
      toast.success("Profile updated");
      onOpenChange(false);
    },
    validators: {
      onSubmit: z.object({
        image: z
          .string()
          .trim()
          .refine((value) => value.length === 0 || URL.canParse(value), {
            message: "Enter a valid image URL",
          }),
        name: z.string().trim().min(2, "Name must be at least 2 characters"),
      }),
    },
  });

  const passwordForm = useForm({
    defaultValues: {
      confirmPassword: "",
      currentPassword: "",
      newPassword: "",
    },
    onSubmit: async ({ value }) => {
      const { error } = await authClient.changePassword({
        currentPassword: value.currentPassword,
        newPassword: value.newPassword,
      });

      if (error) {
        toast.error(error.message ?? error.statusText);
        return;
      }

      toast.success("Password updated");
      passwordForm.reset();
      onOpenChange(false);
    },
    validators: {
      onSubmit: z
        .object({
          confirmPassword: z.string().min(8, "Confirm password must be at least 8 characters"),
          currentPassword: z.string().min(8, "Current password must be at least 8 characters"),
          newPassword: z.string().min(8, "New password must be at least 8 characters"),
        })
        .refine((value) => value.newPassword !== value.currentPassword, {
          message: "New password must be different",
          path: ["newPassword"],
        })
        .refine((value) => value.newPassword === value.confirmPassword, {
          message: "Passwords do not match",
          path: ["confirmPassword"],
        }),
    },
  });

  async function handleForgotPassword() {
    setIsSendingReset(true);
    try {
      const { error } = await authClient.requestPasswordReset({
        email: user.email,
        redirectTo: window.location.origin + "/reset-password",
      });
      if (error) {
        toast.error(error.message ?? error.statusText);
      } else {
        toast.success("Password reset link sent to your email");
      }
    } finally {
      setIsSendingReset(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Update your account details and choose how the app should look.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="account" className="gap-4">
          <TabsList variant="line" className="w-full justify-start gap-2 border-b px-0 pb-1">
            <TabsTrigger value="account">
              <UserIcon />
              Account
            </TabsTrigger>
            <TabsTrigger value="theme">
              <PaletteIcon />
              Theme
            </TabsTrigger>
          </TabsList>

          <TabsContent value="account" className="grid gap-4">
            <form
              onSubmit={(event) => {
                event.preventDefault();
                event.stopPropagation();
                profileForm.handleSubmit();
              }}
              className="grid gap-4 border border-border p-4"
            >
              <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                <UserIcon className="size-3.5" />
                Profile
              </div>

              <div className="grid gap-2">
                <Label htmlFor="settings-name">Name</Label>
                <profileForm.Field name="name">
                  {(field) => (
                    <>
                      <Input
                        id="settings-name"
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(event) => field.handleChange(event.target.value)}
                      />
                      {field.state.meta.errors.map((error) => (
                        <p key={error?.message} className="text-xs text-destructive">
                          {error?.message}
                        </p>
                      ))}
                    </>
                  )}
                </profileForm.Field>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="settings-email">Email</Label>
                <Input id="settings-email" value={user.email} disabled readOnly />
                <p className="text-xs text-muted-foreground">
                  Email changes are not enabled in this app yet.
                </p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="settings-image">Avatar URL</Label>
                <profileForm.Field name="image">
                  {(field) => (
                    <>
                      <Input
                        id="settings-image"
                        name={field.name}
                        placeholder="https://example.com/avatar.png"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(event) => field.handleChange(event.target.value)}
                      />
                      {field.state.meta.errors.map((error) => (
                        <p key={error?.message} className="text-xs text-destructive">
                          {error?.message}
                        </p>
                      ))}
                    </>
                  )}
                </profileForm.Field>
              </div>

              <profileForm.Subscribe
                selector={(state) => ({
                  canSubmit: state.canSubmit,
                  isSubmitting: state.isSubmitting,
                })}
              >
                {({ canSubmit, isSubmitting }) => (
                  <div className="flex justify-end">
                    <Button type="submit" disabled={!canSubmit || isSubmitting}>
                      {isSubmitting ? "Saving..." : "Save profile"}
                    </Button>
                  </div>
                )}
              </profileForm.Subscribe>
            </form>

            {canChangePassword ? (
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  passwordForm.handleSubmit();
                }}
                className="grid gap-4 border border-border p-4"
              >
                <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                  <KeyRoundIcon className="size-3.5" />
                  Password
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="settings-current-password">Current password</Label>
                  <passwordForm.Field name="currentPassword">
                    {(field) => (
                      <>
                        <Input
                          id="settings-current-password"
                          name={field.name}
                          type="password"
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(event) => field.handleChange(event.target.value)}
                        />
                        {field.state.meta.errors.map((error) => (
                          <p key={error?.message} className="text-xs text-destructive">
                            {error?.message}
                          </p>
                        ))}
                      </>
                    )}
                  </passwordForm.Field>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="settings-new-password">New password</Label>
                  <passwordForm.Field name="newPassword">
                    {(field) => (
                      <>
                        <Input
                          id="settings-new-password"
                          name={field.name}
                          type="password"
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(event) => field.handleChange(event.target.value)}
                        />
                        {field.state.meta.errors.map((error) => (
                          <p key={error?.message} className="text-xs text-destructive">
                            {error?.message}
                          </p>
                        ))}
                      </>
                    )}
                  </passwordForm.Field>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="settings-confirm-password">Confirm new password</Label>
                  <passwordForm.Field name="confirmPassword">
                    {(field) => (
                      <>
                        <Input
                          id="settings-confirm-password"
                          name={field.name}
                          type="password"
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(event) => field.handleChange(event.target.value)}
                        />
                        {field.state.meta.errors.map((error) => (
                          <p key={error?.message} className="text-xs text-destructive">
                            {error?.message}
                          </p>
                        ))}
                      </>
                    )}
                  </passwordForm.Field>
                </div>

                <passwordForm.Subscribe
                  selector={(state) => ({
                    canSubmit: state.canSubmit,
                    isSubmitting: state.isSubmitting,
                  })}
                >
                  {({ canSubmit, isSubmitting }) => (
                    <div className="flex justify-end">
                      <Button type="submit" disabled={!canSubmit || isSubmitting}>
                        {isSubmitting ? "Updating..." : "Update password"}
                      </Button>
                    </div>
                  )}
                </passwordForm.Subscribe>

                <div className="flex justify-start">
                  <Button
                    type="button"
                    variant="link"
                    className="h-auto px-0 text-xs text-muted-foreground"
                    disabled={isSendingReset}
                    onClick={handleForgotPassword}
                  >
                    {isSendingReset ? "Sending reset link..." : "Forgot your current password?"}
                  </Button>
                </div>
              </form>
            ) : null}
          </TabsContent>

          <TabsContent value="theme" className="grid gap-4 border border-border p-4">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
              <PaletteIcon className="size-3.5" />
              Appearance
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {themeOptions.map((option) => (
                <Button
                  key={option.value}
                  type="button"
                  variant={currentTheme === option.value ? "default" : "outline"}
                  className="h-auto flex-col items-start justify-start gap-1 px-3 py-3 text-left"
                  onClick={() => setTheme(option.value)}
                >
                  <span>{option.label}</span>
                  <span className="text-[11px] font-normal text-current/70">
                    {option.description}
                  </span>
                </Button>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
