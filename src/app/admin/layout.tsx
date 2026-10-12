import { isCurrentUserStaff } from "@/lib/adminAuth";
/**
 * Protège automatiquement toutes les pages sous /admin/* — vérification
 * côté serveur, pas seulement dans l'interface. Laisse entrer l'équipe
 * (admin et modérateur) ; les pages réservées aux admins ajoutent leur
 * propre protection via <AdminOnly>.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const isStaff = await isCurrentUserStaff();
  if (!isStaff) {
    return (
      <main className="mx-auto max-w-md px-4 py-20 text-center">
        <p className="text-4xl">🔒</p>
        <h1 className="mt-4 text-xl font-bold">Accès réservé</h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Cette section est réservée à l'équipe d'administration. Connecte-toi avec un compte autorisé, ou{" "}
          <a href="/" className="underline">retourne à l'accueil</a>.
        </p>
      </main>
    );
  }
  return <>{children}</>;
}