import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Coloc Lyon — Logements pour groupes d'étudiants",
    template: "%s | Coloc Lyon"
  },
  description:
    "Trouvez en un seul endroit les colocations, appartements et maisons compatibles avec un groupe de 4 étudiants à Lyon et sa métropole.",
  metadataBase: new URL("https://coloc-lyon.fr"),
  openGraph: {
    title: "Coloc Lyon — Logements pour groupes d'étudiants",
    description: "Colocations, appartements et maisons pour 4 étudiants à Lyon.",
    locale: "fr_FR",
    type: "website"
  },
  robots: { index: true, follow: true }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased dark:bg-surface-dark dark:text-gray-100">
        {children}
      </body>
    </html>
  );
}
