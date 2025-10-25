// eslint-disable-next-line @typescript-eslint/no-unused-vars
import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      isPremium: boolean
    }
  }

  interface User {
    id: string;
    email: string;
    isPremium: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
  }
}
