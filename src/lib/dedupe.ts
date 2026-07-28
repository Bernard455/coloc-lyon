/**
 * Détection de doublons entre annonces provenant de sources différentes.
 *
 * Une même annonce est souvent republiée sur LeBonCoin + PAP + une agence.
 * On ne peut pas se fier à un ID commun, donc on calcule une similarité
 * géographique + prix + surface + n-grammes du titre/description.
 */

export interface DedupeCandidate {
  id: string;
  latitude: number;
  longitude: number;
  totalRentEuros: number;
  surfaceM2: number | null;
  numberOfRooms: number;
  title: string;
  description: string;
}

const EARTH_RADIUS_M = 6371000;

function haversineDistanceM(a: { latitude: number; longitude: number }, b: { latitude: number; longitude: number }): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);

  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(h));
}

/** Similarité de Jaccard sur les tokens (mots) de deux textes, insensible à la casse. */
function textSimilarity(a: string, b: string): number {
  const tokenize = (s: string) =>
    new Set(
      s
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .split(/[^a-z0-9]+/)
        .filter((t) => t.length > 2)
    );
  const setA = tokenize(a);
  const setB = tokenize(b);
  if (setA.size === 0 || setB.size === 0) return 0;
  let intersection = 0;
  for (const t of setA) if (setB.has(t)) intersection++;
  const union = setA.size + setB.size - intersection;
  return intersection / union;
}

/**
 * Retourne true si deux annonces décrivent très probablement le même
 * logement réel (à fusionner dans un DedupeCluster).
 */
export function isLikelyDuplicate(a: DedupeCandidate, b: DedupeCandidate): boolean {
  if (a.numberOfRooms !== b.numberOfRooms) return false;

  const distance = haversineDistanceM(a, b);
  if (distance > 60) return false; // >60m => probablement pas le même bâtiment

  const priceDiff = Math.abs(a.totalRentEuros - b.totalRentEuros) / Math.max(a.totalRentEuros, b.totalRentEuros);
  if (priceDiff > 0.08) return false; // >8% d'écart de prix => suspect

  if (a.surfaceM2 && b.surfaceM2) {
    const surfaceDiff = Math.abs(a.surfaceM2 - b.surfaceM2) / Math.max(a.surfaceM2, b.surfaceM2);
    if (surfaceDiff > 0.1) return false;
  }

  const titleSim = textSimilarity(a.title, b.title);
  const descSim = textSimilarity(a.description, b.description);
  const textScore = Math.max(titleSim, descSim);

  return textScore > 0.35;
}

/**
 * Regroupe une liste d'annonces candidates en clusters de doublons.
 * Algorithme naïf O(n²) — largement suffisant pour un run d'ingestion
 * par ville/quartier ; à remplacer par un index spatial (ex: PostGIS
 * ST_DWithin) si le volume grossit significativement.
 */
export function clusterDuplicates(listings: DedupeCandidate[]): string[][] {
  const parent = new Map<string, string>();
  const find = (id: string): string => {
    if (!parent.has(id)) parent.set(id, id);
    let root = id;
    while (parent.get(root) !== root) root = parent.get(root)!;
    parent.set(id, root);
    return root;
  };
  const union = (a: string, b: string) => {
    const ra = find(a);
    const rb = find(b);
    if (ra !== rb) parent.set(ra, rb);
  };

  for (const l of listings) find(l.id);

  for (let i = 0; i < listings.length; i++) {
    for (let j = i + 1; j < listings.length; j++) {
      if (isLikelyDuplicate(listings[i], listings[j])) {
        union(listings[i].id, listings[j].id);
      }
    }
  }

  const clusters = new Map<string, string[]>();
  for (const l of listings) {
    const root = find(l.id);
    if (!clusters.has(root)) clusters.set(root, []);
    clusters.get(root)!.push(l.id);
  }

  return Array.from(clusters.values());
}
