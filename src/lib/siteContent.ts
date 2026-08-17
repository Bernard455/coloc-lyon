import { prisma } from "@/lib/db";

export interface SiteContentData {
  ownerName: string;
  ownerAddress: string;
  ownerEmail: string;
  ownerPhone: string;
}

const DEFAULTS: SiteContentData = {
  ownerName: "",
  ownerAddress: "",
  ownerEmail: "",
  ownerPhone: ""
};

/**
 * Lit les coordonnées légales éditables depuis /admin/contenu.
 * Retourne des chaînes vides tant qu'elles n'ont jamais été renseignées.
 */
export async function getSiteContent(): Promise<SiteContentData> {
  const row = await prisma.siteContent.findUnique({ where: { id: "default" } });
  if (!row) return DEFAULTS;
  return {
    ownerName: row.ownerName,
    ownerAddress: row.ownerAddress,
    ownerEmail: row.ownerEmail,
    ownerPhone: row.ownerPhone
  };
}