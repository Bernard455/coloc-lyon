/**
 * TEMPLATE — Adaptateur Jinka (agrégateur légal).
 *
 * Non fonctionnel tant que JINKA_API_KEY n'est pas configuré et qu'aucun
 * partenariat n'a été signé avec Jinka. Structure fournie pour brancher
 * rapidement une vraie clé une fois l'accès obtenu — voir scrapers/README.md.
 *
 * Documentation à consulter au moment de l'intégration réelle :
 * https://www.jinka.fr (section partenaires/API — à confirmer, l'offre
 * évolue).
 */

import type { SourceAdapter, RawListing } from "../types";

export const jinkaAdapter: SourceAdapter = {
  source: "JINKA",

  isConfigured() {
    return Boolean(process.env.JINKA_API_KEY);
  },

  async fetchListings({ cities }): Promise<RawListing[]> {
    if (!this.isConfigured()) return [];

    // --- Squelette d'intégration, à adapter au vrai contrat d'API Jinka ---
    // const response = await fetch("https://api.jinka.fr/v1/alerts/results", {
    //   headers: { Authorization: `Bearer ${process.env.JINKA_API_KEY}` }
    // });
    // const data = await response.json();
    // return data.results
    //   .filter((r: any) => cities.includes(r.city))
    //   .map(mapJinkaResultToRawListing);

    return [];
  }
};

// function mapJinkaResultToRawListing(raw: any): RawListing {
//   return {
//     sourceListingId: raw.id,
//     source: "JINKA",
//     sourceUrl: raw.url,
//     title: raw.title,
//     description: raw.description ?? "",
//     propertyType: mapJinkaPropertyType(raw.property_type),
//     totalRentEuros: raw.price,
//     chargesIncluded: raw.charges_included ?? false,
//     numberOfRooms: raw.rooms,
//     surfaceM2: raw.area,
//     address: raw.address,
//     postalCode: raw.postal_code,
//     city: raw.city,
//     latitude: raw.lat,
//     longitude: raw.lng,
//     photos: raw.photos ?? [],
//     publishedAt: raw.published_at
//   };
// }
