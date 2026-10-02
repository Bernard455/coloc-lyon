import { getSiteContent } from "@/lib/siteContent";

export async function Footer() {
  const { brandName } = await getSiteContent();

  return (
    <footer className="mt-16 border-t border-gray-100 py-8 text-center text-xs text-gray-400 dark:border-gray-800">
      <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
        <a href="/aide" className="hover:underline">Aide &amp; FAQ</a>
        <a href="/contact" className="hover:underline">Nous contacter</a>
        <a href="/mentions-legales" className="hover:underline">Mentions légales</a>
        <a href="/confidentialite" className="hover:underline">Confidentialité</a>
        <a href="/cgu" className="hover:underline">CGU</a>
      </nav>
      <p className="mt-3">© {new Date().getFullYear()} {brandName}</p>
    </footer>
  );
}