import { describe, it, expect } from "vitest";
import { listingToDTO } from "../listingDTO";

const rawListing = {
  id: "l1",
  title: "T4 Guillotière",
  description: "Bel appartement",
  propertyType: "APARTMENT",
  totalRent: 155000, // centimes
  chargesIncluded: true,
  surfaceM2: 95,
  numberOfRooms: 4,
  numberOfBathrooms: 2,
  floor: "3",
  furnished: true,
  dpeRating: "C",
  fourthRoomStatus: "COMPATIBLE",
  fourthRoomNote: null,
  address: "12 rue X",
  city: "Lyon",
  neighborhood: "Guillotière",
  latitude: 45.75,
  longitude: 4.83,
  distanceMetroM: 200,
  distanceTramM: null,
  distanceShopsM: null,
  distanceSchoolsM: null,
  centerCommuteMin: null,
  mainPhotoUrl: "https://example.com/photo.jpg",
  photos: [{ url: "https://example.com/photo.jpg" }, { url: "https://example.com/photo2.jpg" }],
  contactName: "Marie",
  contactPhone: "0600000000",
  contactEmail: null,
  contactWhatsapp: null,
  contactFormUrl: null,
  agencyName: null,
  openingHours: null,
  source: "OTHER",
  sourceUrl: "https://example.com",
  externalPublishedAt: "2026-07-20T00:00:00.000Z",
  qualityScore: 85,
  scoreBreakdown: { total: 85, factors: [] },
  isSuspicious: false
};

describe("listingToDTO", () => {
  it("convertit correctement les centimes en euros et calcule le prix par personne", () => {
    const dto = listingToDTO(rawListing);
    expect(dto.totalRentEuros).toBe(1550);
    expect(dto.pricePerPersonEuros).toBe(Math.round(1550 / 4));
  });

  it("extrait les URLs des objets photo imbriqués", () => {
    const dto = listingToDTO(rawListing);
    expect(dto.photos).toEqual(["https://example.com/photo.jpg", "https://example.com/photo2.jpg"]);
  });

  it("accepte aussi des photos déjà sous forme de simples chaînes", () => {
    const dto = listingToDTO({ ...rawListing, photos: ["https://example.com/a.jpg"] });
    expect(dto.photos).toEqual(["https://example.com/a.jpg"]);
  });

  it("regroupe les champs de contact dans un sous-objet", () => {
    const dto = listingToDTO(rawListing);
    expect(dto.contact.name).toBe("Marie");
    expect(dto.contact.phone).toBe("0600000000");
    expect(dto.contact.email).toBeNull();
  });

  it("ne plante pas si numberOfRooms est absent (repli à 1)", () => {
    const dto = listingToDTO({ ...rawListing, numberOfRooms: undefined });
    expect(dto.numberOfRooms).toBe(1);
    expect(dto.pricePerPersonEuros).toBe(1550);
  });
});
