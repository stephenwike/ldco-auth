"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, { useMemo, useState } from "react";

type Mode = "signin" | "signup";

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

export default function AuthForm({
  mode,
  redirectUrl,
  returnTo,
}: {
  mode: Mode;
  redirectUrl: string;
  returnTo?: string;
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isSignup = mode === "signup";
  const title = useMemo(() => (isSignup ? "Create your account" : "Welcome back"), [isSignup]);
  const subtitle = useMemo(() => (isSignup ? "Get started with DanceCard" : "Sign in to DanceCard"), [isSignup]);
  const submitLabel = useMemo(() => (isSignup ? "Create Account" : "Sign In"), [isSignup]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isSignup) {
        const safeName = name.trim() || email.split("@")[0] || "New User";

        const signupRes = await fetch("/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: safeName, email, password }),
        });

        const signupData = await signupRes.json().catch(() => ({}));
        if (!signupRes.ok) {
          setError(signupData?.message || "Registration failed");
          return;
        }
      }

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password");
        return;
      }

      router.push(redirectUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error");
    } finally {
      setLoading(false);
    }
  };

  function handleGoogleSignIn() {
    if (returnTo) {
      document.cookie = `oauth_return_to=${encodeURIComponent(returnTo)}; path=/; max-age=300; samesite=lax`;
    }
    signIn("google", { callbackUrl: "/" });
  }

  const returnToParam = returnTo ? `?return_to=${encodeURIComponent(returnTo)}` : "";
  const otherHref = isSignup ? `/login${returnToParam}` : `/signup${returnToParam}`;
  const otherLabel = isSignup ? "Already have an account?" : "Don’t have an account?";
  const otherAction = isSignup ? "Sign in" : "Sign up";

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0e0e18] px-4">
      <div className="w-full max-w-[400px] rounded-2xl border border-white/[0.08] bg-[#161625] p-8 shadow-2xl shadow-black/40">
        {/* Branding */}
        <div className="mb-6 text-center">
          <div className="mb-2 text-3xl">🎛️</div>
          <h1 className="text-xl font-bold text-white">{title}</h1>
          <p className="mt-1 text-sm text-white/40">{subtitle}</p>
        </div>

        {/* Google Sign-In */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          className="flex w-full items-center justify-center gap-3 rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-medium text-white/80 transition hover:border-white/20 hover:bg-white/[0.06]"
        >
          <GoogleIcon />
          Continue with Google
        </button>

        {/* Divider */}
        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-white/[0.08]" />
          <span className="text-xs text-white/25">or</span>
          <div className="h-px flex-1 bg-white/[0.08]" />
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2.5 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {isSignup && (
            <div>
              <label className="mb-1 block text-xs font-medium text-white/50">Name</label>
              <input
                className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-white placeholder-white/20 outline-none transition focus:border-[#8A5CFF]/60 focus:ring-1 focus:ring-[#8A5CFF]/30"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
              />
            </div>
          )}

          <div>
            <label className="mb-1 block text-xs font-medium text-white/50">Email</label>
            <input
              className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-white placeholder-white/20 outline-none transition focus:border-[#8A5CFF]/60 focus:ring-1 focus:ring-[#8A5CFF]/30"
              placeholder="you@example.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-white/50">Password</label>
            <input
              className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-white placeholder-white/20 outline-none transition focus:border-[#8A5CFF]/60 focus:ring-1 focus:ring-[#8A5CFF]/30"
              placeholder="••••••••"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-1 w-full rounded-lg bg-[#8A5CFF] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#7c3aed] disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Please wait...
              </span>
            ) : (
              submitLabel
            )}
          </button>
        </form>

        {/* Toggle sign-in / sign-up */}
        <p className="mt-5 text-center text-sm text-white/35">
          {otherLabel}{" "}
          <Link className="font-medium text-[#8A5CFF] hover:text-[#a78bfa] transition" href={otherHref}>
            {otherAction}
          </Link>
        </p>
      </div>
    </div>
  );
}
