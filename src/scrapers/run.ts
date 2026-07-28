/**
 * Orchestrateur d'ingestion — exécuté via `npm run ingest` (à planifier en
 * cron, ex: toutes les 30 min via un scheduler Vercel / GitHub Actions).
 *
 * 1. Appelle chaque adaptateur configuré
 * 2. Géocode les adresses manquantes
 * 3. Calcule le score qualité + détection de suspicion
 * 4. Déduplique via lib/dedupe.ts
 * 5. Upsert en base (clé unique source + sourceListingId)
 */

import { prisma } from "@/lib/db";
import { LYON_METRO_CITIES } from "@/types/listing";
import { manualAdapter } from "./adapters/manual";
import { jinkaAdapter } from "./adapters/jinka.example";
import { computeQualityScore, detectSuspicious } from "@/lib/scoring";
import { clusterDuplicates, type DedupeCandidate } from "@/lib/dedupe";
import type { SourceAdapter } from "./types";

const ADAPTERS: SourceAdapter[] = [manualAdapter, jinkaAdapter];

async function main() {
  const cities = [...LYON_METRO_CITIES];
  console.log(`[ingest] Démarrage — villes : ${cities.join(", ")}`);

  for (const adapter of ADAPTERS) {
    const log = await prisma.ingestionLog.create({
      data: { source: adapter.source, status: "running" }
    });

    if (!adapter.isConfigured()) {
      console.log(`[ingest] ${adapter.source} — non configuré, ignoré`);
      await prisma.ingestionLog.update({
        where: { id: log.id },
        data: { status: "success", finishedAt: new Date(), errors: ["Source non configurée"] }
      });
      continue;
    }

    try {
      const raw = await adapter.fetchListings({ cities });
      console.log(`[ingest] ${adapter.source} — ${raw.length} annonces récupérées`);

      let created = 0;
      for (const item of raw) {
        // Médiane du marché local pour ce nb de chambres (utilisée par le scoring)
        const comparable = await prisma.listing.findMany({
          where: { city: item.city, numberOfRooms: item.numberOfRooms, status: "ACTIVE" },
          select: { totalRent: true }
        });
        const median = comparable.length
          ? comparable.map((c) => c.totalRent).sort((a, b) => a - b)[Math.floor(comparable.length / 2)] / 100
          : null;

        const scoreBreakdown = computeQualityScore({
          totalRentEuros: item.totalRentEuros,
          surfaceM2: item.surfaceM2 ?? null,
          numberOfRooms: item.numberOfRooms,
          propertyType: item.propertyType,
          dpeRating: item.dpeRating ?? null,
          distanceMetroM: null,
          distanceTramM: null,
          neighborhood: item.neighborhood ?? null,
          furnished: item.furnished ?? null,
          photosCount: item.photos.length,
          descriptionLength: item.description.length,
          marketMedianRentEuros: median
        });

        const suspicion = detectSuspicious({
          totalRentEuros: item.totalRentEuros,
          marketMedianRentEuros: median,
          photosCount: item.photos.length,
          descriptionLength: item.description.length,
          hasPhone: Boolean(item.contactPhone),
          hasEmail: Boolean(item.contactEmail),
          requestsUpfrontPaymentKeywords: /virement|paiement.{0,20}avant.{0,20}visite|western union/i.test(item.description)
        });

        await prisma.listing.upsert({
          where: { source_sourceListingId: { source: item.source, sourceListingId: item.sourceListingId } },
          create: {
            title: item.title,
            description: item.description,
            propertyType: item.propertyType,
            totalRent: Math.round(item.totalRentEuros * 100),
            chargesIncluded: item.chargesIncluded,
            surfaceM2: item.surfaceM2,
            numberOfRooms: item.numberOfRooms,
            numberOfBathrooms: item.numberOfBathrooms,
            floor: item.floor,
            furnished: item.furnished,
            dpeRating: item.dpeRating,
            address: item.address,
            postalCode: item.postalCode,
            city: item.city,
            neighborhood: item.neighborhood,
            latitude: item.latitude,
            longitude: item.longitude,
            mainPhotoUrl: item.photos[0],
            photos: { create: item.photos.map((url, position) => ({ url, position })) },
            contactName: item.contactName,
            contactPhone: item.contactPhone,
            contactEmail: item.contactEmail,
            contactWhatsapp: item.contactWhatsapp,
            contactFormUrl: item.contactFormUrl,
            agencyName: item.agencyName,
            openingHours: item.openingHours,
            source: item.source,
            sourceUrl: item.sourceUrl,
            sourceListingId: item.sourceListingId,
            externalPublishedAt: item.publishedAt ? new Date(item.publishedAt) : undefined,
            qualityScore: scoreBreakdown.total,
            scoreBreakdown: scoreBreakdown as any,
            isSuspicious: suspicion.isSuspicious,
            suspiciousReasons: suspicion.reasons,
            fourthRoomStatus: item.numberOfRooms >= 4 ? "COMPATIBLE" : "UNKNOWN"
          },
          update: {
            title: item.title,
            description: item.description,
            totalRent: Math.round(item.totalRentEuros * 100),
            mainPhotoUrl: item.photos[0],
            photos: { deleteMany: {}, create: item.photos.map((url, position) => ({ url, position })) },
            qualityScore: scoreBreakdown.total,
            scoreBreakdown: scoreBreakdown as any,
            isSuspicious: suspicion.isSuspicious,
            suspiciousReasons: suspicion.reasons,
            updatedAt: new Date()
          }
        });
        created++;
      }

      await prisma.ingestionLog.update({
        where: { id: log.id },
        data: { status: "success", finishedAt: new Date(), listingsFound: raw.length, listingsNew: created }
      });
    } catch (err) {
      console.error(`[ingest] ${adapter.source} — erreur`, err);
      await prisma.ingestionLog.update({
        where: { id: log.id },
        data: { status: "failed", finishedAt: new Date(), errors: [String(err)] }
      });
    }
  }

  // Déduplication inter-sources
  const active = await prisma.listing.findMany({
    where: { status: "ACTIVE" },
    select: { id: true, latitude: true, longitude: true, totalRent: true, surfaceM2: true, numberOfRooms: true, title: true, description: true }
  });
  const candidates: DedupeCandidate[] = active.map((l) => ({
    id: l.id,
    latitude: l.latitude,
    longitude: l.longitude,
    totalRentEuros: l.totalRent / 100,
    surfaceM2: l.surfaceM2,
    numberOfRooms: l.numberOfRooms,
    title: l.title,
    description: l.description
  }));
  const clusters = clusterDuplicates(candidates).filter((c) => c.length > 1);
  console.log(`[ingest] ${clusters.length} clusters de doublons détectés`);

  for (const clusterIds of clusters) {
    const cluster = await prisma.dedupeCluster.create({ data: {} });
    await prisma.listing.updateMany({ where: { id: { in: clusterIds } }, data: { dedupeClusterId: cluster.id } });
  }

  console.log("[ingest] Terminé.");
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
