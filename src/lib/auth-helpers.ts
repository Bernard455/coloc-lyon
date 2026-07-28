/**
 * Wrapper minimal autour d'Auth.js. À brancher sur `getServerSession(authOptions)`
 * une fois la configuration Auth.js (src/app/api/auth/[...nextauth]/route.ts)
 * mise en place avec un vrai provider (Google, email magic link, etc.).
 */
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function getCurrentUserId(): Promise<string | null> {
  try {
    const session = await getServerSession(authOptions);
    return (session?.user as { id?: string } | undefined)?.id ?? null;
  } catch {
    return null;
  }
}
