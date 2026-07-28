/**
 * Moteur de scoring qualité (/100) et détection d'anomalies.
 *
 * Volontairement rule-based et transparent plutôt qu'un modèle boîte noire :
 * chaque facteur est explicable ("Pourquoi ?") comme demandé dans le brief.
 * Peut être remplacé/complété par un appel LLM (ex: résumé qualitatif de la
 * description) sans changer l'interface `computeQualityScore`.
 */

import type { ScoreBreakdown } from "@/types/listing";

export interface ScoringInput {
  totalRentEuros: number;
  surfaceM2: number | null;
  numberOfRooms: number;
  propertyType: "APARTMENT" | "HOUSE" | "EXISTING_ROOMMATE_SHARE" | "SINGLE_ROOM";
  dpeRating: string | null;
  distanceMetroM: number | null;
  distanceTramM: number | null;
  neighborhood: string | null;
  furnished: boolean | null;
  photosCount: number;
  descriptionLength: number;
  // pour comparer au marché local (mêmes ville + nb de chambres)
  marketMedianRentEuros: number | null;
}

const STUDENT_NEIGHBORHOODS_LYON = [
  "Guillotière",
  "Croix-Rousse",
  "Part-Dieu",
  "Monplaisir",
  "Jean Macé",
  "Vaise",
  "Bellecour",
  "Gerland"
];

export function computeQualityScore(input: ScoringInput): ScoreBreakdown {
  const factors: ScoreBreakdown["factors"] = [];
  let score = 50; // base neutre

  // 1. Prix vs médiane du marché local
  if (input.marketMedianRentEuros) {
    const ratio = input.totalRentEuros / input.marketMedianRentEuros;
    if (ratio <= 0.85) {
      score += 20;
      factors.push({ label: "Prix très inférieur au marché", positive: true, weight: 20, detail: `${Math.round((1 - ratio) * 100)}% moins cher que la médiane du secteur` });
    } else if (ratio <= 0.97) {
      score += 10;
      factors.push({ label: "Faible prix", positive: true, weight: 10, detail: "Sous la médiane du secteur" });
    } else if (ratio >= 1.2) {
      score -= 15;
      factors.push({ label: "Prix élevé", positive: false, weight: -15, detail: `${Math.round((ratio - 1) * 100)}% plus cher que la médiane du secteur` });
    }
  }

  // 2. Type de logement (entier > coloc constituée > chambre seule)
  if (input.propertyType === "HOUSE" || input.propertyType === "APARTMENT") {
    score += 10;
    factors.push({ label: "Logement entier", positive: true, weight: 10, detail: "Contrôle total sur l'attribution des chambres" });
  } else if (input.propertyType === "SINGLE_ROOM") {
    score -= 5;
    factors.push({ label: "Chambre individuelle uniquement", positive: false, weight: -5, detail: "Ne garantit pas la cohésion du groupe de 4" });
  }

  // 3. Transport
  if (input.distanceMetroM !== null && input.distanceMetroM <= 500) {
    score += 10;
    factors.push({ label: "Proche du métro", positive: true, weight: 10, detail: `${input.distanceMetroM} m d'une station` });
  } else if (input.distanceTramM !== null && input.distanceTramM <= 400) {
    score += 6;
    factors.push({ label: "Proche du tram", positive: true, weight: 6, detail: `${input.distanceTramM} m d'un arrêt` });
  }

  // 4. DPE
  if (input.dpeRating) {
    if (["A", "B", "C"].includes(input.dpeRating)) {
      score += 8;
      factors.push({ label: "Bon DPE", positive: true, weight: 8, detail: `Classe ${input.dpeRating}` });
    } else if (["F", "G"].includes(input.dpeRating)) {
      score -= 12;
      factors.push({ label: "Mauvais DPE", positive: false, weight: -12, detail: `Classe ${input.dpeRating} — charges de chauffage probablement élevées` });
    }
  }

  // 5. Quartier étudiant reconnu
  if (input.neighborhood && STUDENT_NEIGHBORHOODS_LYON.some((n) => input.neighborhood!.toLowerCase().includes(n.toLowerCase()))) {
    score += 7;
    factors.push({ label: "Quartier étudiant", positive: true, weight: 7, detail: input.neighborhood });
  }

  // 6. Meublé (évite un budget mobilier de départ pour 4 étudiants)
  if (input.furnished) {
    score += 5;
    factors.push({ label: "Meublé", positive: true, weight: 5, detail: "Pas de budget mobilier à prévoir" });
  }

  // 7. Surface par personne
  if (input.surfaceM2) {
    const perPerson = input.surfaceM2 / Math.max(input.numberOfRooms, 4);
    if (perPerson >= 20) {
      score += 5;
      factors.push({ label: "Surface confortable", positive: true, weight: 5, detail: `~${Math.round(perPerson)} m² par personne` });
    } else if (perPerson < 12) {
      score -= 8;
      factors.push({ label: "Surface serrée", positive: false, weight: -8, detail: `~${Math.round(perPerson)} m² par personne seulement` });
    }
  }

  // 8. Qualité de l'annonce elle-même (proxy de sérieux de l'annonceur)
  if (input.photosCount === 0) {
    score -= 15;
    factors.push({ label: "Aucune photo", positive: false, weight: -15, detail: "Annonce sans photo — à vérifier" });
  } else if (input.photosCount >= 6) {
    score += 4;
    factors.push({ label: "Annonce bien illustrée", positive: true, weight: 4, detail: `${input.photosCount} photos` });
  }
  if (input.descriptionLength < 60) {
    score -= 5;
    factors.push({ label: "Description très courte", positive: false, weight: -5, detail: "Peu d'informations fournies par l'annonceur" });
  }

  score = Math.max(0, Math.min(100, Math.round(score)));

  return { total: score, factors };
}

export interface SuspicionInput {
  totalRentEuros: number;
  marketMedianRentEuros: number | null;
  photosCount: number;
  descriptionLength: number;
  hasPhone: boolean;
  hasEmail: boolean;
  requestsUpfrontPaymentKeywords: boolean; // détecté via analyse de texte de la description
}

/**
 * Heuristiques de détection d'annonces suspectes (arnaques classiques :
 * prix anormalement bas, aucun moyen de contact vérifiable, demande de
 * paiement avant visite, etc.). Ne remplace pas une vérification humaine.
 */
export function detectSuspicious(input: SuspicionInput): { isSuspicious: boolean; reasons: string[] } {
  const reasons: string[] = [];

  if (input.marketMedianRentEuros && input.totalRentEuros < input.marketMedianRentEuros * 0.5) {
    reasons.push("Prix anormalement bas par rapport au marché local (>50% sous la médiane)");
  }
  if (!input.hasPhone && !input.hasEmail) {
    reasons.push("Aucun moyen de contact direct vérifiable");
  }
  if (input.photosCount === 0) {
    reasons.push("Absence totale de photos");
  }
  if (input.requestsUpfrontPaymentKeywords) {
    reasons.push("La description mentionne un paiement ou virement avant visite — signal classique d'arnaque locative");
  }
  if (input.descriptionLength < 30) {
    reasons.push("Description quasi inexistante");
  }

  return { isSuspicious: reasons.length >= 2, reasons };
}
