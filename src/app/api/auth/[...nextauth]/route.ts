import NextAuth, { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/db";

/**
 * Configuration Auth.js. Le provider Google est fourni comme choix par
 * défaut (le plus simple pour des étudiants qui ont tous un compte Google
 * via leur école). Un provider "Email" (magic link) peut être ajouté de la
 * même façon avec un service SMTP.
 *
 * Nécessite GOOGLE_CLIENT_ID et GOOGLE_CLIENT_SECRET dans .env — voir
 * .env.example et https://console.cloud.google.com/apis/credentials pour
 * créer les identifiants OAuth.
 */
export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || ""
    })
  ],
  session: { strategy: "database" },
  pages: {
    signIn: "/connexion"
  },
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        (session.user as { id?: string }).id = user.id;
      }
      return session;
    }
  }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
