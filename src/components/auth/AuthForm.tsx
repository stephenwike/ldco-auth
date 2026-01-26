"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, { useMemo, useState } from "react";

type Mode = "signin" | "signup";

export default function AuthForm({
  mode,
  redirectUrl,
}: {
  mode: Mode;
  /** Where to send the user after successful sign-in/sign-up */
  redirectUrl: string;
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isSignup = mode === "signup";

  const title = useMemo(() => (isSignup ? "Create Account" : "Sign In"), [isSignup]);
  const submitLabel = useMemo(() => (isSignup ? "Sign Up" : "Sign In"), [isSignup]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isSignup) {
        // Minimal requirement: API expects name, email, password.
        const safeName = name.trim() || email.split("@")[0] || "New User";

        const res = await fetch("/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: safeName, email, password }),
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError(data?.message || "Registration failed");
          return;
        }
      }

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid credentials");
        return;
      }

      router.push(redirectUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error");
    } finally {
      setLoading(false);
    }
  };

  const otherHref = isSignup ? "/login" : "/signup";
  const otherLabel = isSignup ? "Already have an account? Sign in" : "Need an account? Sign up";

  return (
    <main className="mx-auto w-full max-w-sm px-4 py-10">
      <h2 className="mb-6 text-2xl font-semibold">{title}</h2>

      {error && (
        <p className="mb-4 rounded border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        {isSignup && (
          <input
            className="w-full rounded border border-white/10 bg-white/5 px-3 py-2 outline-none"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
          />
        )}

        <input
          className="w-full rounded border border-white/10 bg-white/5 px-3 py-2 outline-none"
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          required
        />

        <input
          className="w-full rounded border border-white/10 bg-white/5 px-3 py-2 outline-none"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-white px-3 py-2 font-medium text-black disabled:opacity-60"
        >
          {loading ? "Please wait..." : submitLabel}
        </button>
      </form>

      <div className="mt-4 text-center text-sm">
        <Link className="underline" href={otherHref}>
          {otherLabel}
        </Link>
      </div>
    </main>
  );
}
