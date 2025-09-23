import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from './prisma';
import { compare } from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  session: { strategy: 'jwt' },

  // 👇 Tell NextAuth to use our custom sign-in page
  pages: { signIn: '/signin' },

  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: String(credentials.email) },
        });
        if (!user || !user.hashedPassword) return null;

        const valid = await compare(String(credentials.password), user.hashedPassword);
        if (!valid) return null;

        // Keep what we need on the token/session
        return {
          id: user.id,
          email: user.email,
          name: user.name ?? undefined,
          role: (user as any).role ?? 'SALES',
        } as any;
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userId = (user as any).id;
        token.role = (user as any).role ?? 'SALES';
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.userId as string;
        (session.user as any).role = (token.role as string) || 'SALES';
      }
      return session;
    },
  },
};
