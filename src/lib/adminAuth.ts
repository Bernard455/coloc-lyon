import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

/**
 * Vérifie si l'utilisateur connecté est administrateur, via une liste
 * d'emails autorisés (ADMIN_EMAILS, séparés par des virgules dans .env).
 * Suffisant pour un propriétaire unique ; si plusieurs niveaux de
 * permissions sont nécessaires plus tard (modérateur, etc.), remplacer
 * par un champ `role` sur le modèle User plutôt que cette liste statique.
 */
export async function isCurrentUserAdmin(): Promise<boolean> {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  if (!email) return false;

  const admins = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  return admins.includes(email.toLowerCase());
}
