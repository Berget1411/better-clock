import { useState } from "react";

import ForgotPasswordForm from "../components/forgot-password-form";
import SignInForm from "../components/sign-in-form";
import SignUpForm from "../components/sign-up-form";

type AuthView = "sign-up" | "sign-in" | "forgot-password";

interface LoginPageProps {
  /** Present when the user was redirected here from an invitation link. */
  invitationId?: string;
}

export default function LoginPage({ invitationId }: LoginPageProps) {
  const [view, setView] = useState<AuthView>("sign-up");

  if (view === "sign-in") {
    return (
      <SignInForm
        onSwitchToSignUp={() => setView("sign-up")}
        onForgotPassword={() => setView("forgot-password")}
        invitationId={invitationId}
      />
    );
  }

  if (view === "forgot-password") {
    return <ForgotPasswordForm onBackToSignIn={() => setView("sign-in")} />;
  }

  return <SignUpForm onSwitchToSignIn={() => setView("sign-in")} invitationId={invitationId} />;
}
