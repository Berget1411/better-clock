export const AUTH_REDIRECT = {
  afterSignIn: "/app",
  afterSignUp: "/app",
  afterSignOut: "/login",
  afterResetPassword: "/login",
} as const;

export const AUTH_COPY = {
  signIn: {
    title: "Welcome Back",
    submit: "Sign In",
    submitting: "Submitting...",
    switchPrompt: "Need an account? Sign Up",
  },
  signUp: {
    title: "Create Account",
    submit: "Sign Up",
    submitting: "Submitting...",
    switchPrompt: "Already have an account? Sign In",
  },
  verifyEmail: {
    title: "Check your email",
    description: "We sent a verification link to",
    resend: "Resend email",
    resending: "Sending...",
    backToSignIn: "Back to sign in",
  },
  forgotPassword: {
    title: "Reset your password",
    description: "Enter your email and we'll send you a reset link.",
    submit: "Send reset link",
    submitting: "Sending...",
    backToSignIn: "Back to sign in",
    successTitle: "Check your email",
    successDescription: "If an account exists for that email, a reset link is on its way.",
  },
  resetPassword: {
    title: "Set new password",
    submit: "Update password",
    submitting: "Updating...",
  },
} as const;
