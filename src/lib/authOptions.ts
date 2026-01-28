import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import clientPromise from "@/lib/mongo";
import bcrypt from "bcrypt";

// ✅ ALPHA: import allowlist checker
import { isAlphaAllowed } from "@/lib/alphaAllowList";

const isProd = process.env.NODE_ENV === "production";

// Optional: allow overriding for staging
const cookieDomain = process.env.NEXTAUTH_COOKIE_DOMAIN;

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null;

        // ✅ ALPHA: block login for non-approved emails
        if (!isAlphaAllowed(credentials.email)) return null;

        const client = await clientPromise;
        if (!client) return null;
        const db = client.db("ldco");

        const user = await db
          .collection("users")
          .findOne({ email: credentials.email });

        if (!user) return null;

        const isMatch = await bcrypt.compare(credentials.password, user.password);
        if (!isMatch) return null;

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
        };
      },
    }),
  ],

  // ✅ ENV-AWARE COOKIES
  cookies: {
    sessionToken: {
      // In prod, NextAuth recommends __Secure- prefix when using secure cookies
      name: isProd ? "__Secure-next-auth.session-token" : "next-auth.session-token",
      options: {
        httpOnly: true,
        path: "/",
        secure: isProd,                 // false on localhost, true on prod
        sameSite: isProd ? "none" : "lax",
        // Only set domain in prod (localhost must NOT set a parent domain)
        ...(isProd && cookieDomain ? { domain: cookieDomain } : {}),
      },
    },
  },

  session: { strategy: "jwt" },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.email = user.email as string;
        token.name = user.name as string;

        // ✅ ALPHA (optional): expose flag in token for middleware/UI if needed
        token.alphaAllowed = true;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user = {
          id: token.id as string,
          email: token.email as string,
          name: token.name as string,
        } as typeof session.user;

        // ✅ ALPHA (optional): expose flag in session for UI if you use it
        (session as any).alphaAllowed = (token as any).alphaAllowed ?? false;
      }
      return session;
    },
  },

  pages: {
    signIn: "/auth",
  },
};
