/**
 * Indicateur de popularité — transforme un nombre de favoris en niveau
 * (couleur + libellé), sans jamais exposer le chiffre exact à l'utilisateur.
 * Seuils centralisés ici : à ajuster librement si besoin.
 */

export type PopularityLevel = "low" | "medium" | "high" | "very_high";

export interface PopularityInfo {
  level: PopularityLevel;
  emoji: string;
  label: string;
}

const THRESHOLDS: { min: number; level: PopularityLevel; emoji: string; label: string }[] = [
  { min: 11, level: "very_high", emoji: "🔴", label: "Forte demande" },
  { min: 6, level: "high", emoji: "🟠", label: "Très demandé" },
  { min: 3, level: "medium", emoji: "🟡", label: "Plusieurs intéressés" },
  { min: 1, level: "low", emoji: "🟢", label: "Quelques favoris" }
];

/**
 * Retourne l'info de popularité à afficher, ou null si l'annonce n'a
 * pas encore assez de favoris pour justifier un badge (0 favori).
 */
export function getPopularityInfo(favoritesCount: number): PopularityInfo | null {
  if (!favoritesCount || favoritesCount < 1) return null;
  const match = THRESHOLDS.find((t) => favoritesCount >= t.min);
  if (!match) return null;
  return { level: match.level, emoji: match.emoji, label: match.label };
}