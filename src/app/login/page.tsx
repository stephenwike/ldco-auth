import AuthForm from "@/components/auth/AuthForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ return_to?: string }>;
}) {
  const params = await searchParams;
  const redirectUrl =
    params.return_to ??
    process.env.NEXT_PUBLIC_REDIRECT_URL ??
    "https://profile.localhost:44300";

  return <AuthForm mode="signin" redirectUrl={redirectUrl} returnTo={params.return_to} />;
}
