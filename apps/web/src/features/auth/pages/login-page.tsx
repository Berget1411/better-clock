import { useState } from "react";

import SignInForm from "../components/sign-in-form";
import SignUpForm from "../components/sign-up-form";

interface LoginPageProps {
  /** Present when the user was redirected here from an invitation link. */
  invitationId?: string;
}

export default function LoginPage({ invitationId }: LoginPageProps) {
  const [showSignIn, setShowSignIn] = useState(false);

  return showSignIn ? (
    <SignInForm onSwitchToSignUp={() => setShowSignIn(false)} invitationId={invitationId} />
  ) : (
    <SignUpForm onSwitchToSignIn={() => setShowSignIn(true)} invitationId={invitationId} />
  );
}
