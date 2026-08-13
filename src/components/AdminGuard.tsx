"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

/**
 * Protège l'affichage des pages /admin/*. La vraie sécurité est côté
 * serveur (chaque route API admin vérifie isCurrentUserAdmin() elle-même)
 * — ce composant n'est qu'une protection d'affichage pour ne pas montrer
 * l'interface admin à quelqu'un qui n'a pas les droits.
 */
export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    if (status === "loading") return;
    fetch("/api/admin/whoami")
      .then((r) => r.json())
      .then((data) => setIsAdmin(data.isAdmin))
      .catch(() => setIsAdmin(false));
  }, [status]);

  if (status === "loading" || isAdmin === null) {
    return <main className="mx-auto max-w-2xl px-4 py-8"><p className="text-gray-500">Chargement…</p></main>;
  }

  if (status !== "authenticated" || !isAdmin) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-8">
        <a href="/" className="mb-4 inline-block text-sm text-brand-600 hover:underline">← Retour à l'accueil</a>
        <p className="text-gray-500">
          {status !== "authenticated"
            ? "Connecte-toi avec un compte administrateur pour accéder à cette page."
            : "Ton compte n'a pas les droits administrateur pour accéder à cette page."}
        </p>
      </main>
    );
  }

  return <>{children}</>;
}
