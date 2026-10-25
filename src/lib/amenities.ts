/**
 * Équipements filtrables d'un logement. Chaque valeur est "oui" (true),
 * "non" (false) ou "inconnu" (null) : une annonce non renseignée n'est
 * jamais considérée comme "non".
 */
export type Amenity = "balcony" | "parking" | "pets" | "elevator";

export type AmenityFlags = Record<Amenity, boolean | null>;

export const AMENITIES: { key: Amenity; label: string; icon: string }[] = [
  { key: "balcony", label: "Balcon / terrasse", icon: "🌿" },
  { key: "parking", label: "Parking / garage", icon: "🅿️" },
  { key: "pets", label: "Animaux acceptés", icon: "🐾" },
  { key: "elevator", label: "Ascenseur", icon: "🛗" }
];

/** Lit le paramètre d'URL "amenities=balcony,parking" en ignorant les valeurs inconnues et les doublons. */
export function parseAmenities(value: string | null | undefined): Amenity[] {
  if (!value) return [];
  const valid: string[] = AMENITIES.map((a) => a.key);
  const parsed = value
    .split(",")
    .map((s) => s.trim())
    .filter((s) => valid.includes(s));
  return Array.from(new Set(parsed)) as Amenity[];
}

interface ListingAmenityColumns {
  hasBalcony?: boolean | null;
  hasParking?: boolean | null;
  petsAllowed?: boolean | null;
  hasElevator?: boolean | null;
}

/** Convertit les colonnes de la base en drapeaux ; une valeur absente devient null (inconnu). */
export function amenityFlagsFromListing(l: ListingAmenityColumns): AmenityFlags {
  return {
    balcony: l.hasBalcony ?? null,
    parking: l.hasParking ?? null,
    pets: l.petsAllowed ?? null,
    elevator: l.hasElevator ?? null
  };
}

/** Équipements confirmés (true) uniquement, dans l'ordre d'affichage. */
export function getPresentAmenities(flags: AmenityFlags | undefined) {
  if (!flags) return [];
  return AMENITIES.filter((a) => flags[a.key] === true);
}