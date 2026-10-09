import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";
import { isAdminRole, isEmailInAdminList, isStaffRole, parseRole, type AppRole } from "@/lib/roles";

/**
 * Rôle de l'utilisateur connecté. Les emails listés dans ADMIN_EMAILS
 * (variable d'environnement) sont toujours ADMIN : filet de sécurité qui
 * garantit au propriétaire de ne jamais se retrouver bloqué, même en cas
 * d'erreur dans la table des rôles. Pour les autres, le rôle vient du
 * champ `role` du modèle User.
 */
export async function getCurrentRole(): Promise<AppRole> {
  try {
    const session = await getServerSession(authOptions);
    const email = session?.user?.email;
    if (!email) return "USER";

    if (isEmailInAdminList(email, process.env.ADMIN_EMAILS)) return "ADMIN";

    const userId = (session?.user as { id?: string } | undefined)?.id;
    if (!userId) return "USER";

    const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
    return parseRole(user?.role) ?? "USER";
  } catch {
    return "USER";
  }
}

/** Accès complet (contenu du site, synchronisation, gestion des rôles). */
export async function isCurrentUserAdmin(): Promise<boolean> {
  return isAdminRole(await getCurrentRole());
}

/** Accès équipe : admin ou modérateur (messages, ajout d'annonces). */
export async function isCurrentUserStaff(): Promise<boolean> {
  return isStaffRole(await getCurrentRole());
}