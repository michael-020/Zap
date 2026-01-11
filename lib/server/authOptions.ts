import { prisma } from "@/lib/prisma";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google"
import bcrypt from "bcrypt"
import { AuthOptions } from "next-auth";
import { AUTHOPTIONS } from "@/prisma/app/generated/prisma";

export const authOptions: AuthOptions = ({
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
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

        return { id: user.id, email: user.email, isPremium: user.isPremium, downloadCount: user.downloadCount }
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!
    })
  ],
  callbacks: {
    session: ({ session, token }) => {
      if (session?.user && token.id) {
        session.user.id = token.id as string 
        session.user.isPremium = token.isPremium as boolean
        session.user.downloadCount = token.downloadCount as number
      }
      return session
    },
    jwt: async ({trigger, token, user, account, session}) => {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.isPremium = user.isPremium; 
        token.downloadCount = user.downloadCount
      }

      if (trigger === "update" && session) {
        console.log("updating user's premium status")
        console.log("session: ", session)

        const dbUser = await prisma.user.findUnique({
          where: { id: session.user.id },
        });
        
        if (dbUser) {
          token.isPremium = dbUser.isPremium;
          token.downloadCount = dbUser.downloadCount;

          return token
        }
      }
      
      if (account?.provider === "google" && token.email) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: token.email },
            select: { id: true, isPremium: true, downloadCount: true }
          });
          if (dbUser) {
            token.id = dbUser.id;
            token.isPremium = dbUser.isPremium;
            token.downloadCount = dbUser.downloadCount
          }
        } catch (error) {
          console.error("Error fetching user ID:", error);
        }
      }
      
      return token;
    }, 
    async signIn({ account, profile }) {
      try {
        if (account?.provider === "google") {
          if (!profile?.email) {
            console.error("No email provided by Google");
            return false;
          }
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

        return true;
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
