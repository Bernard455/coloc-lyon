import { prisma } from "@/lib/db";

export interface FaqItem {
  q: string;
  a: string;
}

export interface SiteContentData {
  ownerName: string;
  ownerAddress: string;
  ownerEmail: string;
  ownerPhone: string;
  tagline: string;
  brandName: string;
  faqItems: FaqItem[];
  legalUpdatedAt: string;
}

// Contenu historique codé en dur, repris comme valeur par défaut tant que
// personne n'a encore édité la FAQ depuis /admin/contenu.
const DEFAULT_FAQ: FaqItem[] = [
  {
    q: "Comment ajouter une annonce que j'ai trouvée sur LeBonCoin ou PAP ?",
    a: "Depuis l'accueil, clique sur \"Ajouter une annonce\". Recopie les infos et colle le lien vers l'annonce originale — l'adresse est localisée automatiquement, et un score qualité est calculé."
  },
  {
    q: "Le site va-t-il chercher les annonces tout seul ?",
    a: "Pas depuis les grandes plateformes (LeBonCoin, SeLoger…) — leurs conditions d'utilisation l'interdisent. Le site centralise ce que toi et ton groupe ajoutez, plus d'éventuelles sources partenaires légales."
  },
  {
    q: "Comment fonctionne un groupe privé ?",
    a: "Crée un groupe depuis \"Groupes\", partage le code d'invitation à tes futurs colocataires. Chacun peut ensuite partager ses favoris dans le groupe, avec une note, et vous comparez ensemble."
  },
  {
    q: "Qu'est-ce que le badge \"Compatible N colocataires\" ?",
    a: "Il indique si un logement de N-1 chambres a un espace (salon, pièce supplémentaire) pouvant accueillir un colocataire de plus, selon les infos que tu as renseignées."
  },
  {
    q: "Comment fonctionne le score qualité ?",
    a: "Calculé automatiquement à partir du prix par rapport au marché local, du type de logement, des transports, du DPE, du quartier et de la qualité de l'annonce elle-même. Clique sur le score pour voir le détail."
  },
  {
    q: "Puis-je retirer un favori partagé dans un groupe ?",
    a: "Oui, n'importe quel membre du groupe peut le retirer depuis la page du groupe — pas seulement la personne qui l'a ajouté."
  }
];

const DEFAULTS: SiteContentData = {
  ownerName: "",
  ownerAddress: "",
  ownerEmail: "",
  ownerPhone: "",
  tagline: "Compare et partage les logements trouvés pour ton groupe",
  brandName: "Comparo",
  faqItems: DEFAULT_FAQ,
  legalUpdatedAt: ""
};

/**
 * Lit le contenu éditable depuis /admin/contenu (coordonnées légales,
 * tagline d'accueil, nom de marque, FAQ, date de mise à jour légale...).
 * Retourne des valeurs par défaut sûres tant que rien n'a encore été
 * enregistré en base — la FAQ par défaut reprend le contenu historique
 * codé en dur.
 */
export async function getSiteContent(): Promise<SiteContentData> {
  const row = await prisma.siteContent.findUnique({ where: { id: "default" } });
  if (!row) return DEFAULTS;
  const faqItems =
    Array.isArray(row.faqItems) && row.faqItems.length > 0
      ? (row.faqItems as unknown as FaqItem[])
      : DEFAULT_FAQ;
  return {
    ownerName: row.ownerName,
    ownerAddress: row.ownerAddress,
    ownerEmail: row.ownerEmail,
    ownerPhone: row.ownerPhone,
    tagline: row.tagline,
    brandName: row.brandName,
    faqItems,
    legalUpdatedAt: row.legalUpdatedAt
  };
}

/**
 * Formate la date de mise à jour légale en français ("6 octobre 2026"),
 * ou renvoie le placeholder historique tant qu'elle n'a pas été renseignée.
 */
export function formatLegalUpdatedAt(legalUpdatedAt: string): string {
  if (!legalUpdatedAt) return "[À compléter — date de mise en production réelle]";
  const date = new Date(legalUpdatedAt);
  if (Number.isNaN(date.getTime())) return "[À compléter — date de mise en production réelle]";
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}