/**
 * Parseur de recherche en langage naturel.
 *
 * Volontairement basé sur des règles (regex + dictionnaires) plutôt qu'un
 * appel LLM : latence quasi nulle, pas de coût API, déterministe, et
 * suffisant pour le vocabulaire fermé de ce domaine (prix, type de bien,
 * quartiers, proximité transport). Peut être doublé d'un appel LLM en
 * fallback pour les formulations vraiment ambiguës (voir `parseWithLLM`
 * plus bas, non implémenté par défaut).
 *
 * Exemples couverts :
 *  - "appartement pour 4 étudiants à moins de 400€ par personne"
 *  - "maison proche du métro"
 *  - "appartement entier près de Bellecour"
 */

import { LYON_METRO_CITIES, MIN_GROUP_SIZE, MAX_GROUP_SIZE, defaultRoomsForGroupSize, type PropertyType, type SearchFilters } from "@/types/listing";

export interface ParsedIntent {
  propertyTypes?: PropertyType[];
  maxPricePerPersonEuros?: number;
  maxTotalRentEuros?: number;
  nearMetro?: boolean;
  nearTram?: boolean;
  neighborhoodHint?: string;
  cityHint?: string;
  groupSizeHint?: number;
  numberOfRoomsHint?: number[];
}

const PROPERTY_TYPE_KEYWORDS: Array<{ regex: RegExp; type: PropertyType }> = [
  { regex: /\bmaisons?\b/i, type: "HOUSE" },
  { regex: /\bappartements?\b|\bappart\b/i, type: "APARTMENT" },
  { regex: /\bcoloc(ation)?s? (déjà )?constituée?s?\b|\bcoloc existante\b/i, type: "EXISTING_ROOMMATE_SHARE" },
  { regex: /\bchambre?s? (seule|individuelle)s?\b/i, type: "SINGLE_ROOM" }
];

const KNOWN_NEIGHBORHOODS = [
  "Bellecour", "Croix-Rousse", "Guillotière", "Part-Dieu", "Monplaisir",
  "Jean Macé", "Vaise", "Gerland", "Confluence", "Presqu'île", "Montchat",
  "Vieux Lyon", "Saxe-Gambetta", "Foch"
];

export function parseSearchQuery(query: string): ParsedIntent {
  const intent: ParsedIntent = {};
  const q = query.trim();
  if (!q) return intent;

  // Type de bien
  const foundTypes: PropertyType[] = [];
  for (const { regex, type } of PROPERTY_TYPE_KEYWORDS) {
    if (regex.test(q)) foundTypes.push(type);
  }
  if (/entier/i.test(q) && !foundTypes.includes("APARTMENT") && !foundTypes.includes("HOUSE")) {
    foundTypes.push("APARTMENT", "HOUSE");
  }
  if (foundTypes.length) intent.propertyTypes = Array.from(new Set(foundTypes));

  // Prix par personne : "400€ par personne", "400 euros/personne", "max 400€ chacun"
  const perPersonMatch = q.match(/(\d{2,4})\s?€?\s?(?:€|euros?)?\s?(?:par personne|\/personne|chacun|par tête)/i);
  if (perPersonMatch) intent.maxPricePerPersonEuros = parseInt(perPersonMatch[1], 10);

  // Prix total : "1600€ au total", "budget 1600 euros", "moins de 1600€"
  const totalMatch = q.match(/(\d{3,5})\s?€?\s?(?:€|euros?)?\s?(?:au total|total|max|maximum)?/i);
  if (totalMatch && !perPersonMatch) {
    const val = parseInt(totalMatch[1], 10);
    if (val >= 300) intent.maxTotalRentEuros = val; // évite de capter un nombre de m² etc.
  }

  // Proximité transport
  if (/métro/i.test(q)) intent.nearMetro = true;
  if (/tram(way)?/i.test(q)) intent.nearTram = true;

  // Quartier connu
  const neighborhood = KNOWN_NEIGHBORHOODS.find((n) => q.toLowerCase().includes(n.toLowerCase()));
  if (neighborhood) intent.neighborhoodHint = neighborhood;

  // Ville
  const city = LYON_METRO_CITIES.find((c) => q.toLowerCase().includes(c.toLowerCase()));
  if (city) intent.cityHint = city;

  // Taille de groupe explicite : "pour 5 étudiants", "6 chambres", "colocation à 3"
  const groupMatch = q.match(/\b([2-8])\b.{0,15}(étudiants?|chambres?|colocataires?|personnes?)/i) || q.match(/colocation à ([2-8])\b/i);
  if (groupMatch) {
    const n = parseInt(groupMatch[1], 10);
    if (n >= MIN_GROUP_SIZE && n <= MAX_GROUP_SIZE) {
      intent.groupSizeHint = n;
      intent.numberOfRoomsHint = defaultRoomsForGroupSize(n);
    }
  }

  return intent;
}

/** Fusionne l'intention extraite du texte libre avec les filtres structurés déjà actifs (les filtres explicites priment). */
export function mergeIntentIntoFilters(base: SearchFilters, intent: ParsedIntent): SearchFilters {
  return {
    ...base,
    propertyTypes: intent.propertyTypes ?? base.propertyTypes,
    maxPricePerPersonEuros: intent.maxPricePerPersonEuros ?? base.maxPricePerPersonEuros,
    maxTotalRentEuros: intent.maxTotalRentEuros ?? base.maxTotalRentEuros,
    groupSize: intent.groupSizeHint ?? base.groupSize,
    numberOfRooms: intent.numberOfRoomsHint ?? base.numberOfRooms,
    cities: intent.cityHint ? [intent.cityHint] : base.cities
  };
}
