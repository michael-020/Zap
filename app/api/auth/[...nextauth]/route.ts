import { prisma } from "@/lib/prisma";
import NextAuth from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google"
import bcrypt from "bcrypt"
import { AuthOptions } from "next-auth";
import { AUTHOPTIONS } from "@/prisma/app/generated/prisma";

export const authOptions: AuthOptions = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text", placeholder: "Email" },
        password: { label: "Password", type: "password", placeholder: "Password" }
      },
      async authorize(credentials) {
        if(!credentials?.email || !credentials?.password)
          return null

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email 
          }
        })

        if(!user || !user.password)
          return null

        const checkPassword = await bcrypt.compare(credentials.password, user.password);
        if(!checkPassword)
          return null

        return { id: user.id, email: user.email }
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!
    })
  ],
  callbacks: {
    session: ({ session, token }) => {
      if (session?.user) {
        session.user.id = token.id as string 
      }
      return session
    },
    jwt: ({token, user}) => {
      if(user){
        return {
          ...token,
          id: user.id
        }
      }
      return token
    }, 
    async signIn({ account, profile }) {
      try {
        if (!profile?.email) {
          console.error("No email provided by Google");
          return false;
        }

        if (account?.provider === "google") {
          await prisma.user.upsert({
            where: {
              email: profile.email,
            },
            update: {
              provider: AUTHOPTIONS.GOOGLE,
            },
            create: {
              email: profile.email,
              provider: AUTHOPTIONS.GOOGLE,
            },
          });
          return true
        }

        return false;
      } catch (error) {
        console.error("Error in signIn callback:", error);
        if (error instanceof Error) {
          console.error(`Error type: ${error.name}, Message: ${error.message}`);
        }
        return false;
      }
    },
  },
  session: {
    strategy: "jwt"
  },
  pages: {
    signIn: "/signin",
    error: '/auth/error'
  },
  secret: process.env.AUTH_SECRET
})

const handler = authOptions
export { handler as GET, handler as POST}