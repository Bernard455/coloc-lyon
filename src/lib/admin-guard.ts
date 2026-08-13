import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

/**
 * Garde d'accès admin minimal : compare l'email du compte connecté à la
 * liste ADMIN_EMAILS (séparés par des virgules) dans les variables
 * d'environnement. Pas de système de rôles complet (Super Admin /
 * Modérateur...) pour l'instant — un seul propriétaire suffit à ce stade.
 * Base facilement extensible plus tard vers une vraie table de rôles.
 */
export async function isCurrentUserAdmin(): Promise<boolean> {
  try {
    const session = await getServerSession(authOptions);
    const email = session?.user?.email;
    if (!email) return false;

    const adminEmails = (process.env.ADMIN_EMAILS || "")
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);

    return adminEmails.includes(email.toLowerCase());
  } catch {
    return false;
  }
}
