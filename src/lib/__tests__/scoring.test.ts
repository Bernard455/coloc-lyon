import { describe, it, expect } from "vitest";
import { computeQualityScore, detectSuspicious } from "../scoring";

describe("computeQualityScore", () => {
  it("donne un score élevé à un logement entier, pas cher, bien desservi et bon DPE", () => {
    const result = computeQualityScore({
      totalRentEuros: 1300,
      surfaceM2: 90,
      numberOfRooms: 4,
      propertyType: "APARTMENT",
      dpeRating: "B",
      distanceMetroM: 200,
      distanceTramM: null,
      neighborhood: "Guillotière",
      furnished: true,
      photosCount: 8,
      descriptionLength: 400,
      marketMedianRentEuros: 1600
    });
    expect(result.total).toBeGreaterThan(80);
  });

  it("pénalise un logement sans photo et avec description trop courte", () => {
    const result = computeQualityScore({
      totalRentEuros: 1600,
      surfaceM2: null,
      numberOfRooms: 3,
      propertyType: "SINGLE_ROOM",
      dpeRating: "G",
      distanceMetroM: null,
      distanceTramM: null,
      neighborhood: null,
      furnished: false,
      photosCount: 0,
      descriptionLength: 10,
      marketMedianRentEuros: 1400
    });
    expect(result.total).toBeLessThan(40);
  });

  it("reste borné entre 0 et 100", () => {
    const result = computeQualityScore({
      totalRentEuros: 5000,
      surfaceM2: 5,
      numberOfRooms: 4,
      propertyType: "SINGLE_ROOM",
      dpeRating: "G",
      distanceMetroM: null,
      distanceTramM: null,
      neighborhood: null,
      furnished: false,
      photosCount: 0,
      descriptionLength: 0,
      marketMedianRentEuros: 900
    });
    expect(result.total).toBeGreaterThanOrEqual(0);
    expect(result.total).toBeLessThanOrEqual(100);
  });
});

describe("detectSuspicious", () => {
  it("signale une annonce sans contact, sans photo et à prix anormalement bas", () => {
    const result = detectSuspicious({
      totalRentEuros: 500,
      marketMedianRentEuros: 1500,
      photosCount: 0,
      descriptionLength: 20,
      hasPhone: false,
      hasEmail: false,
      requestsUpfrontPaymentKeywords: false
    });
    expect(result.isSuspicious).toBe(true);
    expect(result.reasons.length).toBeGreaterThanOrEqual(2);
  });

  it("ne signale pas une annonce normale", () => {
    const result = detectSuspicious({
      totalRentEuros: 1400,
      marketMedianRentEuros: 1500,
      photosCount: 5,
      descriptionLength: 300,
      hasPhone: true,
      hasEmail: true,
      requestsUpfrontPaymentKeywords: false
    });
    expect(result.isSuspicious).toBe(false);
  });
});
