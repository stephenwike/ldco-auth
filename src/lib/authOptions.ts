import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import clientPromise from "@/lib/mongo";
import bcrypt from "bcrypt";

const isProd = process.env.NODE_ENV === "production";

// Optional: allow overriding for staging
const cookieDomain = process.env.NEXTAUTH_COOKIE_DOMAIN;

export const authOptions: AuthOptions = {
  providers: [
    ...(process.env.GOOGLE_CLIENT_ID
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
          }),
        ]
      : []),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null;

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
    async signIn() {
      return true;
    },
    async jwt({ token, user, account }) {
      if (user && account?.provider === 'google') {
        const client = await clientPromise;
        if (client) {
          const db = client.db('ldco');
          let dbUser = await db.collection('users').findOne({ email: user.email });
          if (!dbUser) {
            const result = await db.collection('users').insertOne({
              email: user.email,
              name: user.name,
              googleId: user.id,
              createdAt: new Date(),
            });
            dbUser = { _id: result.insertedId, email: user.email, name: user.name };
          }
          token.id = dbUser._id.toString();
          token.email = dbUser.email as string;
          token.name = (dbUser.name ?? user.name) as string;
        }
      } else if (user) {
        token.id = user.id as string;
        token.email = user.email as string;
        token.name = user.name as string;
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

      }
      return session;
    },
  },

  pages: {
    signIn: "/auth",
  },
};
