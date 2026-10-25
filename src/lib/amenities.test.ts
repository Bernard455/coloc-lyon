import { describe, it, expect } from "vitest";
import { amenityFlagsFromListing, getPresentAmenities, parseAmenities } from "./amenities";

describe("parseAmenities", () => {
  it("retourne une liste vide si le paramètre est absent ou vide", () => {
    expect(parseAmenities(null)).toEqual([]);
    expect(parseAmenities("")).toEqual([]);
  });

  it("garde les critères valides, ignore les inconnus et supprime les doublons", () => {
    expect(parseAmenities("parking, balcony,piscine,parking")).toEqual(["parking", "balcony"]);
  });
});

describe("amenityFlagsFromListing", () => {
  it("considère une information absente comme inconnue (null)", () => {
    expect(amenityFlagsFromListing({})).toEqual({ balcony: null, parking: null, pets: null, elevator: null });
  });

  it("reprend les valeurs de l'annonce", () => {
    expect(
      amenityFlagsFromListing({ hasBalcony: true, hasParking: false, petsAllowed: true, hasElevator: null })
    ).toEqual({ balcony: true, parking: false, pets: true, elevator: null });
  });
});

describe("getPresentAmenities", () => {
  it("ne garde que les équipements confirmés et tolère l'absence de données", () => {
    const present = getPresentAmenities({ balcony: true, parking: false, pets: null, elevator: true });
    expect(present.map((a) => a.key)).toEqual(["balcony", "elevator"]);
    expect(getPresentAmenities(undefined)).toEqual([]);
  });
});