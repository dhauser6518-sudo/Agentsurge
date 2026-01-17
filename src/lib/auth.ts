import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user) {
          return null;
        }

        const passwordMatch = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        );

        if (!passwordMatch) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || user.email,
          role: user.role,
          emailVerified: user.emailVerified,
          subscriptionStatus: user.subscriptionStatus,
          trialEndsAt: user.trialEndsAt?.toISOString() || null,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user && user.id) {
        token.id = user.id;
        token.role = (user as { role?: string }).role || "agent";
        token.emailVerified = (user as { emailVerified?: boolean }).emailVerified ?? false;
        token.subscriptionStatus = (user as { subscriptionStatus?: string }).subscriptionStatus || "inactive";
        token.trialEndsAt = (user as { trialEndsAt?: string | null }).trialEndsAt ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id: string }).id = token.id as string;
        (session.user as { role: string }).role = (token.role as string) || "agent";
        (session.user as { emailVerified: boolean }).emailVerified = (token.emailVerified as boolean) ?? false;
        (session.user as { subscriptionStatus: string }).subscriptionStatus = (token.subscriptionStatus as string) || "inactive";
        (session.user as { trialEndsAt: string | null }).trialEndsAt = (token.trialEndsAt as string | null) ?? null;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
});
