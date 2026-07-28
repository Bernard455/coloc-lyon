import type { PropertyType, SourcePlatform } from "@/types/listing";

/** Forme normalisée qu'un adaptateur doit produire, quelle que soit la source d'origine. */
export interface RawListing {
  sourceListingId: string;
  source: SourcePlatform;
  sourceUrl: string;
  title: string;
  description: string;
  propertyType: PropertyType;
  totalRentEuros: number;
  chargesIncluded: boolean;
  chargesAmountEuros?: number;
  surfaceM2?: number;
  numberOfRooms: number;
  numberOfBathrooms?: number;
  floor?: string;
  furnished?: boolean;
  dpeRating?: string;
  address: string;
  postalCode: string;
  city: string;
  neighborhood?: string;
  latitude: number;
  longitude: number;
  photos: string[];
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  contactWhatsapp?: string;
  contactFormUrl?: string;
  agencyName?: string;
  openingHours?: string;
  publishedAt?: string; // ISO date
}

export interface SourceAdapter {
  source: SourcePlatform;
  /** true si la source est correctement configurée (clé API présente, etc.) */
  isConfigured(): boolean;
  /** Récupère les annonces brutes pour une zone donnée. */
  fetchListings(params: { cities: string[] }): Promise<RawListing[]>;
}
