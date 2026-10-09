/**
 * Logique pure des rôles (sans dépendance serveur) — testable seule.
 * ADMIN : accès complet. MODERATOR : messages et ajout d'annonces.
 * USER : aucun accès à /admin.
 */
export type AppRole = "USER" | "MODERATOR" | "ADMIN";

export const ROLES: AppRole[] = ["USER", "MODERATOR", "ADMIN"];

export const ROLE_LABELS: Record<AppRole, string> = {
  USER: "Utilisateur",
  MODERATOR: "Modérateur",
  ADMIN: "Administrateur"
};

export function parseRole(value: unknown): AppRole | null {
  return typeof value === "string" && (ROLES as string[]).includes(value) ? (value as AppRole) : null;
}

export function isAdminRole(role: AppRole): boolean {
  return role === "ADMIN";
}

export function isStaffRole(role: AppRole): boolean {
  return role === "ADMIN" || role === "MODERATOR";
}

/**
 * Vérifie si un email figure dans la liste ADMIN_EMAILS (séparée par des
 * virgules, insensible à la casse et aux espaces).
 */
export function isEmailInAdminList(email: string, list: string | undefined): boolean {
  const admins = (list || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return admins.includes(email.trim().toLowerCase());
}