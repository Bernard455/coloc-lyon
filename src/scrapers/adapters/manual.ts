/**
 * Adaptateur "manuel" — la source qui fonctionne réellement sans dépendre
 * d'un tiers. Deux modes d'alimentation :
 *
 *  1. Un formulaire admin (à construire dans /app/admin/ajouter-annonce)
 *     où un utilisateur colle le lien + les infos d'une annonce vue sur
 *     LeBonCoin/SeLoger/etc. — usage strictement personnel, pas de
 *     republication automatisée du contenu tiers.
 *  2. Un import CSV (ex: export d'agences partenaires qui acceptent de
 *     fournir leurs disponibilités dans ce format).
 *
 * Ce fichier lit simplement un CSV local ; le formulaire admin peut écrire
 * dans le même fichier ou directement en base via l'API /api/listings (POST).
 */

import { readFileSync, existsSync } from "fs";
import path from "path";
import type { SourceAdapter, RawListing } from "../types";
import type { PropertyType } from "@/types/listing";
import { geocodeAddress } from "@/lib/geocoding";

const CSV_PATH = path.join(process.cwd(), "data", "manual-listings.csv");

function parseCsvLine(line: string): string[] {
  // Parseur CSV simple avec support des guillemets (suffisant pour un export contrôlé)
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

const VALID_PROPERTY_TYPES: PropertyType[] = ["APARTMENT", "HOUSE", "EXISTING_ROOMMATE_SHARE", "SINGLE_ROOM"];

export const manualAdapter: SourceAdapter = {
  source: "OTHER",

  isConfigured() {
    return existsSync(CSV_PATH);
  },

  async fetchListings({ cities }): Promise<RawListing[]> {
    if (!this.isConfigured()) return [];

    const content = readFileSync(CSV_PATH, "utf-8");
    const lines = content.split("\n").filter((l) => l.trim().length > 0);
    if (lines.length < 2) return [];

    const headers = parseCsvLine(lines[0]);
    const rows = lines.slice(1).map((line) => {
      const values = parseCsvLine(line);
      const row: Record<string, string> = {};
      headers.forEach((h, i) => (row[h] = values[i] ?? ""));
      return row;
    });

    const listings: RawListing[] = [];

    for (const row of rows) {
      if (!cities.some((c) => c.toLowerCase() === row.city?.toLowerCase())) continue;

      const propertyType = VALID_PROPERTY_TYPES.includes(row.propertyType as PropertyType)
        ? (row.propertyType as PropertyType)
        : "APARTMENT";

      // Géocodage automatique si latitude/longitude absentes du CSV —
      // évite d'avoir à les calculer soi-même avant l'import. Un délai
      // léger entre les appels respecte les limites de taux des services
      // de géocodage gratuits utilisés (voir src/lib/geocoding.ts).
      let latitude = row.latitude ? Number(row.latitude) : NaN;
      let longitude = row.longitude ? Number(row.longitude) : NaN;

      if (!latitude || !longitude || Number.isNaN(latitude) || Number.isNaN(longitude)) {
        const geocoded = await geocodeAddress({ address: row.address, postalCode: row.postalCode, city: row.city });
        if (geocoded) {
          latitude = geocoded.latitude;
          longitude = geocoded.longitude;
        } else {
          console.warn(`[manual-adapter] Adresse non géocodable, annonce ignorée : ${row.address}`);
          continue;
        }
        await new Promise((resolve) => setTimeout(resolve, 1100)); // respecte la limite ~1 req/s de Nominatim
      }

      listings.push({
        sourceListingId: row.id || `manual-${row.sourceUrl}`,
        source: (row.originalSource as RawListing["source"]) || "OTHER",
        sourceUrl: row.sourceUrl,
        title: row.title,
        description: row.description,
        propertyType,
        totalRentEuros: Number(row.totalRentEuros) || 0,
        chargesIncluded: row.chargesIncluded === "true",
        surfaceM2: row.surfaceM2 ? Number(row.surfaceM2) : undefined,
        numberOfRooms: Number(row.numberOfRooms) || 0,
        numberOfBathrooms: row.numberOfBathrooms ? Number(row.numberOfBathrooms) : undefined,
        furnished: row.furnished ? row.furnished === "true" : undefined,
        dpeRating: row.dpeRating || undefined,
        address: row.address,
        postalCode: row.postalCode,
        city: row.city,
        neighborhood: row.neighborhood || undefined,
        latitude,
        longitude,
        photos: row.photos ? row.photos.split("|").filter(Boolean) : [],
        contactName: row.contactName || undefined,
        contactPhone: row.contactPhone || undefined,
        contactEmail: row.contactEmail || undefined,
        agencyName: row.agencyName || undefined,
        publishedAt: row.publishedAt || undefined
      });
    }

    return listings;
  }
};
