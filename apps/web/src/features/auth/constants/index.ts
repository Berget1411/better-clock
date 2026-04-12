export const AUTH_REDIRECT = {
  afterSignIn: "/app",
  afterSignUp: "/app",
  afterSignOut: "/login",
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
} as const;
