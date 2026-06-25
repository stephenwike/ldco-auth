import AuthForm from "@/components/auth/AuthForm";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ return_to?: string }>;
}) {
  const params = await searchParams;
  const redirectUrl =
    params.return_to ??
    process.env.NEXT_PUBLIC_REDIRECT_URL ??
    "https://profile.localhost:44300";

  return <AuthForm mode="signup" redirectUrl={redirectUrl} returnTo={params.return_to} />;
}
