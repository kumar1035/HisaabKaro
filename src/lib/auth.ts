import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";

// JWT sessions keep API calls stateless, while the application user is always
// resolved from our own User table in the callbacks below.
export const authOptions: NextAuthOptions = {
  providers: [GoogleProvider({ clientId: process.env.GOOGLE_CLIENT_ID ?? "", clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "" })],
  session: { strategy: "jwt" },
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false;
      await prisma.user.upsert({ where: { email: user.email }, update: { name: user.name ?? undefined }, create: { email: user.email, name: user.name } });
      return true;
    },
    async jwt({ token, user }) {
      const email = user?.email ?? token.email;
      if (email) token.userId = (await prisma.user.findUnique({ where: { email } }))?.id;
      return token;
    },
    async session({ session, token }) {
      if (session.user) (session.user as typeof session.user & { id?: string }).id = token.userId as string | undefined;
      return session;
    },
  },
  pages: { signIn: "/" },
  secret: process.env.NEXTAUTH_SECRET,
};
