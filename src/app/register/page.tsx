import AuthForm from "@/components/auth/AuthForm";

// Legacy sign-up page (kept for the older app)
export default function RegisterPage() {
  return (
    <AuthForm
      mode="signup"
      redirectUrl={
        process.env.NEXT_PUBLIC_REDIRECT_URL ?? "https://profile.localhost:44300"
      }
    />
  );
}
