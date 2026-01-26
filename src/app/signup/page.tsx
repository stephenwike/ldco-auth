import AuthForm from "@/components/auth/AuthForm";

// New app entrypoint signup page
export default function SignupPage() {
  return (
    <AuthForm
      mode="signup"
      redirectUrl={
        process.env.NEXT_PUBLIC_REDIRECT_URL ??
        "https://profile.localhost:44300"
      }
    />
  );
}
