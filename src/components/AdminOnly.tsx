import { isCurrentUserAdmin } from "@/lib/adminAuth";

/**
 * Protège une page réservée aux administrateurs (pas aux modérateurs).
 * Vérification côté serveur ; à utiliser dans le layout.tsx du dossier de la page.
 */
export async function AdminOnly({ children }: { children: React.ReactNode }) {
  if (!(await isCurrentUserAdmin())) {
    return (
      <main className="mx-auto max-w-md px-4 py-20 text-center">
        <p className="text-4xl">🔒</p>
        <h1 className="mt-4 text-xl font-bold">Réservé aux administrateurs</h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Cette page est réservée aux administrateurs.{" "}
          <a href="/admin/messages" className="underline">Retour aux messages</a> ou{" "}
          <a href="/" className="underline">à l'accueil</a>.
        </p>
      </main>
    );
  }
  return <>{children}</>;
}