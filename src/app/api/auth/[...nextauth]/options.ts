import { PrismaClient, User } from "@prisma/client";
import { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { hash, compare } from "bcryptjs";

// Prisma client setup (your version)
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ log: ["query"] });
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Inline bcrypt helper
const bcryptpass = {
  hashPassword: async (password: string) => await hash(password, 10),
  comparePassword: async (password: string, hashedPassword: string) => await compare(password, hashedPassword),
};

export const Authoptions: NextAuthOptions = {
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials): Promise<Omit<User, "password">> {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email or Password is required");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) {
          throw new Error("User not found or missing password");
        }

        const isPasswordCorrect = await bcryptpass.comparePassword(credentials.password, user.password);
        if (!isPasswordCorrect) throw new Error("Incorrect password");

        const { password: _password, ...filteredUser } = user;
        return filteredUser;
      },
    }),

    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: { params: { scope: "openid email profile" } },
    }),
  ],

  adapter: PrismaAdapter(prisma),

  callbacks: {
    async signIn({ user }) {
      if (user.email) {
        const dbUser = await prisma.user.findUnique({ where: { email: user.email } });
        return !!dbUser;
      }
      return false;
    },
    async session({ session, user }) {
      if (session.user) session.user.id = user.id;
      return session;
    },
  },

  pages: {
    signIn: "/login",
    error: "/login?error=true",
  },

  session: {
    strategy: "database",
    maxAge: 30 * 24 * 60 * 60,
  },

  secret: process.env.NEXTAUTH_SECRET,
};
