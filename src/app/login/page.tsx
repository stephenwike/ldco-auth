import AuthForm from "@/components/auth/AuthForm";

// New app entrypoint login page
export default function LoginPage() {
  return (
    <AuthForm
      mode="signin"
      redirectUrl={
        process.env.NEXT_PUBLIC_REDIRECT_URL ??
        "https://profile.localhost:44300"
      }
    />
  );
}
