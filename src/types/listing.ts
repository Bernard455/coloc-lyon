export type PropertyType = "APARTMENT" | "HOUSE" | "EXISTING_ROOMMATE_SHARE" | "SINGLE_ROOM";
export type FourthRoomStatus = "UNKNOWN" | "COMPATIBLE" | "NOT_COMPATIBLE";
export type SourcePlatform =
  | "LEBONCOIN"
  | "SELOGER"
  | "BIENICI"
  | "PAP"
  | "STUDAPART"
  | "CARTE_DES_COLOCS"
  | "LOCSERVICE"
  | "JINKA"
  | "LOGIC_IMMO"
  | "AGENCY"
  | "STUDENT_RESIDENCE"
  | "OTHER";

export interface ListingDTO {
  id: string;
  title: string;
  description: string;
  propertyType: PropertyType;
  totalRentEuros: number;
  pricePerPersonEuros: number; // calculé côté serveur, dépend de numberOfRooms
  chargesIncluded: boolean;
  surfaceM2: number | null;
  numberOfRooms: number;
  numberOfBathrooms: number | null;
  floor: string | null;
  furnished: boolean | null;
  dpeRating: string | null;
  fourthRoomStatus: FourthRoomStatus;
  fourthRoomNote: string | null;
  address: string;
  city: string;
  neighborhood: string | null;
  latitude: number;
  longitude: number;
  distanceMetroM: number | null;
  distanceTramM: number | null;
  distanceShopsM: number | null;
  distanceSchoolsM: number | null;
  centerCommuteMin: number | null;
  mainPhotoUrl: string | null;
  photos: string[];
  contact: {
    name: string | null;
    phone: string | null;
    email: string | null;
    whatsapp: string | null;
    formUrl: string | null;
    agencyName: string | null;
    openingHours: string | null;
  };
  source: SourcePlatform;
  sourceUrl: string;
  publishedAt: string | null;
  qualityScore: number | null;
  scoreBreakdown: ScoreBreakdown | null;
  isSuspicious: boolean;
}

export interface ScoreBreakdown {
  total: number;
  factors: Array<{
    label: string;
    positive: boolean;
    weight: number;
    detail: string;
  }>;
}

export type SortOption =
  | "price_asc"
  | "price_desc"
  | "surface_desc"
  | "rooms_desc"
  | "date_desc"
  | "distance_school_asc"
  | "commute_asc";

export interface SearchFilters {
  cities: string[];
  groupSize: number; // taille du groupe recherché (2 à 8) — remplace le "4" auparavant fixe
  maxTotalRentEuros: number;
  maxPricePerPersonEuros: number;
  numberOfRooms: number[];
  propertyTypes: PropertyType[];
  onlyFourCompatible?: boolean;
  sort: SortOption;
  page: number;
  pageSize: number;
  query?: string; // recherche en langage naturel brute, avant parsing NLP
}

// Villes de départ suggérées (bassin lyonnais) — n'importe quelle autre
// ville en France peut être ajoutée librement dans les filtres et le
// formulaire admin, ce n'est plus une liste fermée.
export const LYON_METRO_CITIES = [
  "Lyon",
  "Villeurbanne",
  "Bron",
  "Vénissieux",
  "Caluire-et-Cuire",
  "Oullins",
  "Tassin-la-Demi-Lune"
] as const;

export const MIN_GROUP_SIZE = 2;
export const MAX_GROUP_SIZE = 8;

function defaultRoomsForGroupSize(groupSize: number): number[] {
  // Priorité : logements avec exactement la taille du groupe, puis un de
  // moins (chambre en moins compensée par un salon convertible par ex).
  return groupSize > MIN_GROUP_SIZE ? [groupSize, groupSize - 1] : [groupSize];
}

export const DEFAULT_FILTERS: SearchFilters = {
  cities: [...LYON_METRO_CITIES],
  groupSize: 4,
  maxTotalRentEuros: 1600,
  maxPricePerPersonEuros: 400,
  numberOfRooms: defaultRoomsForGroupSize(4),
  propertyTypes: ["APARTMENT", "HOUSE", "EXISTING_ROOMMATE_SHARE"],
  sort: "price_asc",
  page: 1,
  pageSize: 24
};

export { defaultRoomsForGroupSize };

// Ordre de priorité utilisé pour le tri secondaire (après le critère de tri choisi)
export const PROPERTY_TYPE_PRIORITY: Record<PropertyType, number> = {
  HOUSE: 0,
  APARTMENT: 1,
  EXISTING_ROOMMATE_SHARE: 2,
  SINGLE_ROOM: 3
};
