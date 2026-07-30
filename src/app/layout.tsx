import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
  title: {
    default: "Comparo — Comparateur de logements en colocation",
    template: "%s | Comparo"
  },
  description:
    "Compare, filtre et partage les logements que tu trouves pour ton groupe — colocations, appartements et maisons, avec score qualité automatique.",
  metadataBase: new URL("https://coloc-lyon.vercel.app"),
  openGraph: {
    title: "Comparo — Comparateur de logements en colocation",
    description: "Compare et partage les logements trouvés pour ton groupe.",
    locale: "fr_FR",
    type: "website"
  },
  robots: { index: true, follow: true }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased dark:bg-surface-dark dark:text-gray-100">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
