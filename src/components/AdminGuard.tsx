"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

/**
 * Protège l'affichage des pages /admin/*. La vraie sécurité est côté
 * serveur (layout admin, <AdminOnly> et chaque route API admin) — ce
 * composant n'est qu'une protection d'affichage. Il laisse passer
 * l'équipe (admin et modérateur) ; les pages réservées aux admins sont
 * protégées côté serveur par <AdminOnly>.
 */
export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const [isStaff, setIsStaff] = useState<boolean | null>(null);

  useEffect(() => {
    if (status === "loading") return;
    fetch("/api/admin/whoami")
      .then((r) => r.json())
      .then((data) => setIsStaff(Boolean(data.isStaff)))
      .catch(() => setIsStaff(false));
  }, [status]);

  if (status === "loading" || isStaff === null) {
    return <main className="mx-auto max-w-2xl px-4 py-8"><p className="text-gray-500">Chargement…</p></main>;
  }

  if (status !== "authenticated" || !isStaff) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-8">
        <a href="/" className="mb-4 inline-block text-sm text-brand-600 hover:underline">← Retour à l'accueil</a>
        <p className="text-gray-500">
          {status !== "authenticated"
            ? "Connecte-toi avec un compte autorisé pour accéder à cette page."
            : "Ton compte n'a pas les droits pour accéder à cette page."}
        </p>
      </main>
    );
  }

  return <>{children}</>;
}