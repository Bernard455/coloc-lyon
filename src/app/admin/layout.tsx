import { isCurrentUserAdmin } from "@/lib/adminAuth";

/**
 * Protège automatiquement toutes les pages sous /admin/* — vérification
 * côté serveur, pas seulement dans l'interface (voir brief sécurité :
 * "les permissions doivent être vérifiées côté serveur, et non uniquement
 * dans l'interface").
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const isAdmin = await isCurrentUserAdmin();

  if (!isAdmin) {
    return (
      <main className="mx-auto max-w-md px-4 py-20 text-center">
        <p className="text-4xl">🔒</p>
        <h1 className="mt-4 text-xl font-bold">Accès réservé</h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Cette section est réservée aux administrateurs. Connecte-toi avec un compte autorisé, ou{" "}
          <a href="/" className="underline">retourne à l'accueil</a>.
        </p>
      </main>
    );
  }

  return <>{children}</>;
}
