import { describe, it, expect } from "vitest";
import { isLikelyDuplicate, clusterDuplicates, type DedupeCandidate } from "../dedupe";

const base: DedupeCandidate = {
  id: "a",
  latitude: 45.764,
  longitude: 4.8357,
  totalRentEuros: 1500,
  surfaceM2: 85,
  numberOfRooms: 4,
  title: "Bel appartement T4 refait à neuf proche métro",
  description: "Grand appartement lumineux de 85m2, 4 chambres, proche métro et commerces, idéal étudiants"
};

describe("isLikelyDuplicate", () => {
  it("détecte deux annonces identiques republiées sur des sources différentes", () => {
    const b: DedupeCandidate = {
      ...base,
      id: "b",
      latitude: 45.7641,
      longitude: 4.83575,
      title: "Appartement T4 refait à neuf, proche métro",
      description: "Grand appartement lumineux 85m2 4 chambres proche métro et commerces parfait pour étudiants"
    };
    expect(isLikelyDuplicate(base, b)).toBe(true);
  });

  it("ne fusionne pas deux logements différents proches géographiquement mais à des prix différents", () => {
    const b: DedupeCandidate = { ...base, id: "b", totalRentEuros: 2200 };
    expect(isLikelyDuplicate(base, b)).toBe(false);
  });

  it("ne fusionne pas des logements avec un nombre de chambres différent", () => {
    const b: DedupeCandidate = { ...base, id: "b", numberOfRooms: 3 };
    expect(isLikelyDuplicate(base, b)).toBe(false);
  });

  it("ne fusionne pas des logements trop éloignés géographiquement", () => {
    const b: DedupeCandidate = { ...base, id: "b", latitude: 45.8, longitude: 4.9 };
    expect(isLikelyDuplicate(base, b)).toBe(false);
  });
});

describe("clusterDuplicates", () => {
  it("regroupe correctement 3 annonces dont 2 sont des doublons", () => {
    const dup: DedupeCandidate = {
      ...base,
      id: "b",
      title: "Appartement T4 refait à neuf, proche métro",
      description: "Grand appartement lumineux 85m2 4 chambres proche métro et commerces parfait pour étudiants"
    };
    const different: DedupeCandidate = { ...base, id: "c", latitude: 45.9, longitude: 4.7, title: "Petit studio Villeurbanne" };

    const clusters = clusterDuplicates([base, dup, different]).filter((c) => c.length > 1);
    expect(clusters).toHaveLength(1);
    expect(clusters[0].sort()).toEqual(["a", "b"]);
  });
});
