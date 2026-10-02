import { prisma } from "@/lib/db";

export interface SiteContentData {
  ownerName: string;
  ownerAddress: string;
  ownerEmail: string;
  ownerPhone: string;
  tagline: string;
  brandName: string;
}

const DEFAULTS: SiteContentData = {
  ownerName: "",
  ownerAddress: "",
  ownerEmail: "",
  ownerPhone: "",
  tagline: "Compare et partage les logements trouvés pour ton groupe",
  brandName: "Comparo"
};

/**
 * Lit le contenu éditable depuis /admin/contenu (coordonnées légales,
 * tagline d'accueil, nom de marque affiché publiquement...). Retourne des
 * valeurs par défaut sûres tant que rien n'a encore été enregistré en base.
 */
export async function getSiteContent(): Promise<SiteContentData> {
  const row = await prisma.siteContent.findUnique({ where: { id: "default" } });
  if (!row) return DEFAULTS;
  return {
    ownerName: row.ownerName,
    ownerAddress: row.ownerAddress,
    ownerEmail: row.ownerEmail,
    ownerPhone: row.ownerPhone,
    tagline: row.tagline,
    brandName: row.brandName
  };
}