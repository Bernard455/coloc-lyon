import { getPopularityInfo } from "@/lib/popularity";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { PROPERTY_TYPE_PRIORITY, type ListingDTO, type PropertyType, type SortOption } from "@/types/listing";
import type { Prisma } from "@prisma/client";

function buildOrderBy(sort: SortOption): Prisma.ListingOrderByWithRelationInput[] {
  switch (sort) {
    case "price_asc":
      return [{ totalRent: "asc" }];
    case "price_desc":
      return [{ totalRent: "desc" }];
    case "surface_desc":
      return [{ surfaceM2: "desc" }];
    case "rooms_desc":
      return [{ numberOfRooms: "desc" }];
    case "date_desc":
      return [{ externalPublishedAt: "desc" }, { createdAt: "desc" }];
    case "distance_school_asc":
      return [{ distanceSchoolsM: "asc" }];
    case "commute_asc":
      return [{ centerCommuteMin: "asc" }];
    default:
      return [{ totalRent: "asc" }];
  }
}

function toDTO(listing: any, groupSize: number): ListingDTO {
  const numberOfRooms = listing.numberOfRooms || 1;
  return {
    id: listing.id,
    title: listing.title,
    description: listing.description,
    propertyType: listing.propertyType,
    totalRentEuros: listing.totalRent / 100,
    pricePerPersonEuros: Math.round(listing.totalRent / 100 / Math.max(groupSize, 1)),
    chargesIncluded: listing.chargesIncluded,
    surfaceM2: listing.surfaceM2,
    numberOfRooms,
    numberOfBathrooms: listing.numberOfBathrooms,
    floor: listing.floor,
    furnished: listing.furnished,
    dpeRating: listing.dpeRating,
    fourthRoomStatus: listing.fourthRoomStatus,
    fourthRoomNote: listing.fourthRoomNote,
    address: listing.address,
    city: listing.city,
    neighborhood: listing.neighborhood,
    latitude: listing.latitude,
    longitude: listing.longitude,
    distanceMetroM: listing.distanceMetroM,
    distanceTramM: listing.distanceTramM,
    distanceShopsM: listing.distanceShopsM,
    distanceSchoolsM: listing.distanceSchoolsM,
    centerCommuteMin: listing.centerCommuteMin,
    mainPhotoUrl: listing.mainPhotoUrl,
    photos: (listing.photos ?? []).map((p: any) => p.url),
    contact: {
      name: listing.contactName,
      phone: listing.contactPhone,
      email: listing.contactEmail,
      whatsapp: listing.contactWhatsapp,
      formUrl: listing.contactFormUrl,
      agencyName: listing.agencyName,
      openingHours: listing.openingHours
    },
    source: listing.source,
    sourceUrl: listing.sourceUrl,
    publishedAt: listing.externalPublishedAt ? listing.externalPublishedAt.toISOString() : null,
    qualityScore: listing.qualityScore,
    scoreBreakdown: listing.scoreBreakdown,
    isSuspicious: listing.isSuspicious,
    popularity: getPopularityInfo(listing._count?.favorites ?? 0)
  };
}

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;

  const cities = (params.get("cities") || "").split(",").filter(Boolean);
  const groupSize = Math.max(1, Number(params.get("groupSize") || 4));
  const maxTotalRentEuros = Number(params.get("maxTotalRentEuros") || 1600);
  const maxPricePerPersonEuros = Number(params.get("maxPricePerPersonEuros") || 400);
  const numberOfRooms = (params.get("numberOfRooms") || String(groupSize)).split(",").map(Number);
  const propertyTypes = (params.get("propertyTypes") || "").split(",").filter(Boolean) as PropertyType[];
  const onlyFourCompatible = params.get("onlyFourCompatible") === "true";
  const sort = (params.get("sort") || "price_asc") as SortOption;
  const page = Math.max(1, Number(params.get("page") || 1));
  const pageSize = Math.min(48, Number(params.get("pageSize") || 24));

  const where: Prisma.ListingWhereInput = {
    status: "ACTIVE",
    city: cities.length ? { in: cities } : undefined,
    numberOfRooms: { in: numberOfRooms },
    propertyType: propertyTypes.length ? { in: propertyTypes } : undefined,
    totalRent: { lte: Math.round(maxTotalRentEuros * 100) },
    ...(onlyFourCompatible ? { fourthRoomStatus: "COMPATIBLE" } : {})
  };

  // Filtre prix/personne : nécessite un post-filtrage car dépend de numberOfRooms
  // (Prisma ne peut pas exprimer totalRent / numberOfRooms <= X directement en SQL portable simple)
  const [total, rawListings] = await Promise.all([
    prisma.listing.count({ where }),
    prisma.listing.findMany({
      where,
      include: {
        photos: { orderBy: { position: "asc" } },
        _count: { select: { favorites: true } }
      },
      orderBy: buildOrderBy(sort),
      // On sur-fetch légèrement pour compenser le post-filtrage prix/personne, puis on pagine en mémoire
      take: pageSize * 3,
      skip: (page - 1) * pageSize
    })
  ]);

  let listings = rawListings
    .map((l) => toDTO(l, groupSize))
    .filter((l) => l.pricePerPersonEuros <= maxPricePerPersonEuros);

  // Tri secondaire par priorité de type de logement (logements entiers > coloc > chambre),
  // en respectant le tri principal choisi par l'utilisateur pour les valeurs égales.
  listings = listings.sort((a, b) => {
    if (sort === "price_asc" || sort === "price_desc") {
      const priorityDiff = PROPERTY_TYPE_PRIORITY[a.propertyType] - PROPERTY_TYPE_PRIORITY[b.propertyType];
      if (priorityDiff !== 0) return priorityDiff;
    }
    return 0;
  });

  listings = listings.slice(0, pageSize);

  return NextResponse.json({ listings, total, page, pageSize });
}
