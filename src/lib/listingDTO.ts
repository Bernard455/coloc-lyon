import { getPopularityInfo } from "@/lib/popularity";
import type { ListingDTO } from "@/types/listing";

/**
 * Convertit un enregistrement Listing brut (tel que renvoyé par Prisma via
 * une route API, photos incluses) en ListingDTO attendu par <ListingCard>.
 * Utilisé partout où une annonce arrive imbriquée dans un autre objet
 * (favori, item de groupe) plutôt que via /api/listings qui fait déjà cette
 * conversion côté serveur.
 */
export function listingToDTO(l: any): ListingDTO {
  const numberOfRooms = l.numberOfRooms || 1;
  return {
    id: l.id,
    title: l.title,
    description: l.description,
    propertyType: l.propertyType,
    totalRentEuros: l.totalRent / 100,
    pricePerPersonEuros: Math.round(l.totalRent / 100 / Math.max(numberOfRooms, 1)),
    chargesIncluded: l.chargesIncluded,
    surfaceM2: l.surfaceM2,
    numberOfRooms,
    numberOfBathrooms: l.numberOfBathrooms,
    floor: l.floor,
    furnished: l.furnished,
    dpeRating: l.dpeRating,
    fourthRoomStatus: l.fourthRoomStatus,
    fourthRoomNote: l.fourthRoomNote,
    address: l.address,
    city: l.city,
    neighborhood: l.neighborhood,
    latitude: l.latitude,
    longitude: l.longitude,
    distanceMetroM: l.distanceMetroM,
    distanceTramM: l.distanceTramM,
    distanceShopsM: l.distanceShopsM,
    distanceSchoolsM: l.distanceSchoolsM,
    centerCommuteMin: l.centerCommuteMin,
    mainPhotoUrl: l.mainPhotoUrl,
    photos: (l.photos ?? []).map((p: any) => (typeof p === "string" ? p : p.url)),
    contact: {
      name: l.contactName ?? null,
      phone: l.contactPhone ?? null,
      email: l.contactEmail ?? null,
      whatsapp: l.contactWhatsapp ?? null,
      formUrl: l.contactFormUrl ?? null,
      agencyName: l.agencyName ?? null,
      openingHours: l.openingHours ?? null
    },
    source: l.source,
    sourceUrl: l.sourceUrl,
    publishedAt: l.externalPublishedAt ?? null,
    qualityScore: l.qualityScore,
    scoreBreakdown: l.scoreBreakdown,
    isSuspicious: l.isSuspicious,
    popularity: getPopularityInfo(l._count?.favorites ?? l.favoritesCount ?? 0)
  };
}
