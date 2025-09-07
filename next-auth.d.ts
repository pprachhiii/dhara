import { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      needsPassword?: boolean;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    id: string;
    needsPassword?: boolean; 
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    needsPassword?: boolean;
  }
}
