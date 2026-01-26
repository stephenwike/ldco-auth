import AuthForm from "@/components/auth/AuthForm";

// Legacy sign-in page (kept for the older app)
export default function AuthPage() {
  return (
    <AuthForm
      mode="signin"
      redirectUrl={
        process.env.NEXT_PUBLIC_REDIRECT_URL ?? "https://profile.localhost:44300"
      }
    />
  );
}
