import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { computeQualityScore, detectSuspicious } from "@/lib/scoring";
import { isCurrentUserStaff } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

const createListingSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  propertyType: z.enum(["APARTMENT", "HOUSE", "EXISTING_ROOMMATE_SHARE", "SINGLE_ROOM"]),
  totalRentEuros: z.number().positive(),
  chargesIncluded: z.boolean(),
  surfaceM2: z.number().positive().optional(),
  numberOfRooms: z.number().int().min(1).max(10),
  numberOfBathrooms: z.number().int().optional(),
  furnished: z.boolean().optional(),
  dpeRating: z.string().optional(),
  fourthRoomStatus: z.enum(["UNKNOWN", "COMPATIBLE", "NOT_COMPATIBLE"]).optional(),
  fourthRoomNote: z.string().optional(),
  address: z.string().min(3),
  postalCode: z.string().min(4),
  city: z.string().min(2),
  neighborhood: z.string().optional(),
  latitude: z.number(),
  longitude: z.number(),
  photos: z.array(z.string().url()).default([]),
  contactName: z.string().optional(),
  contactPhone: z.string().optional(),
  contactEmail: z.string().email().optional(),
  contactWhatsapp: z.string().optional(),
  agencyName: z.string().optional(),
  sourceUrl: z.string().url(),
  originalSource: z
    .enum([
      "LEBONCOIN", "SELOGER", "BIENICI", "PAP", "STUDAPART", "CARTE_DES_COLOCS",
      "LOCSERVICE", "JINKA", "LOGIC_IMMO", "AGENCY", "STUDENT_RESIDENCE", "OTHER"
    ])
    .default("OTHER")
});

/**
 * Création manuelle d'une annonce (formulaire admin `/admin/ajouter-annonce`).
 * C'est le moyen le plus fiable d'alimenter la base tant qu'aucun
 * partenariat API n'est signé — voir src/scrapers/README.md.
 */
export async function POST(req: NextRequest) {
  if (!(await isCurrentUserStaff())) {
    return NextResponse.json({ error: "Accès réservé aux administrateurs" }, { status: 403 });
  }
  const data = createListingSchema.parse(await req.json());

  const comparable = await prisma.listing.findMany({
    where: { city: data.city, numberOfRooms: data.numberOfRooms, status: "ACTIVE" },
    select: { totalRent: true }
  });
  const median = comparable.length
    ? comparable.map((c) => c.totalRent).sort((a, b) => a - b)[Math.floor(comparable.length / 2)] / 100
    : null;

  const scoreBreakdown = computeQualityScore({
    totalRentEuros: data.totalRentEuros,
    surfaceM2: data.surfaceM2 ?? null,
    numberOfRooms: data.numberOfRooms,
    propertyType: data.propertyType,
    dpeRating: data.dpeRating ?? null,
    distanceMetroM: null,
    distanceTramM: null,
    neighborhood: data.neighborhood ?? null,
    furnished: data.furnished ?? null,
    photosCount: data.photos.length,
    descriptionLength: data.description.length,
    marketMedianRentEuros: median
  });

  const suspicion = detectSuspicious({
    totalRentEuros: data.totalRentEuros,
    marketMedianRentEuros: median,
    photosCount: data.photos.length,
    descriptionLength: data.description.length,
    hasPhone: Boolean(data.contactPhone),
    hasEmail: Boolean(data.contactEmail),
    requestsUpfrontPaymentKeywords: /virement|paiement.{0,20}avant.{0,20}visite|western union/i.test(data.description)
  });

  const listing = await prisma.listing.create({
    data: {
      title: data.title,
      description: data.description,
      propertyType: data.propertyType,
      totalRent: Math.round(data.totalRentEuros * 100),
      chargesIncluded: data.chargesIncluded,
      surfaceM2: data.surfaceM2,
      numberOfRooms: data.numberOfRooms,
      numberOfBathrooms: data.numberOfBathrooms,
      furnished: data.furnished,
      dpeRating: data.dpeRating,
      fourthRoomStatus: data.fourthRoomStatus ?? (data.numberOfRooms >= 4 ? "COMPATIBLE" : "UNKNOWN"),
      fourthRoomNote: data.fourthRoomNote,
      address: data.address,
      postalCode: data.postalCode,
      city: data.city,
      neighborhood: data.neighborhood,
      latitude: data.latitude,
      longitude: data.longitude,
      mainPhotoUrl: data.photos[0],
      photos: { create: data.photos.map((url, position) => ({ url, position })) },
      contactName: data.contactName,
      contactPhone: data.contactPhone,
      contactEmail: data.contactEmail,
      contactWhatsapp: data.contactWhatsapp,
      agencyName: data.agencyName,
      source: data.originalSource,
      sourceUrl: data.sourceUrl,
      sourceListingId: `manual-form-${Date.now()}`,
      qualityScore: scoreBreakdown.total,
      scoreBreakdown: scoreBreakdown as any,
      isSuspicious: suspicion.isSuspicious,
      suspiciousReasons: suspicion.reasons,
      externalPublishedAt: new Date()
    }
  });

  return NextResponse.json({ listing }, { status: 201 });
}
