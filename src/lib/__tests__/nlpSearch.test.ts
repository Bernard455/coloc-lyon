import { describe, it, expect } from "vitest";
import { parseSearchQuery } from "../nlpSearch";

describe("parseSearchQuery", () => {
  it("extrait le budget par personne et le nombre d'étudiants", () => {
    const intent = parseSearchQuery("Je cherche un appartement pour 4 étudiants à moins de 400 € par personne.");
    expect(intent.propertyTypes).toContain("APARTMENT");
    expect(intent.maxPricePerPersonEuros).toBe(400);
    expect(intent.numberOfRoomsHint).toEqual([4]);
  });

  it("détecte une recherche de maison proche du métro", () => {
    const intent = parseSearchQuery("Maison proche du métro.");
    expect(intent.propertyTypes).toContain("HOUSE");
    expect(intent.nearMetro).toBe(true);
  });

  it("détecte un quartier connu", () => {
    const intent = parseSearchQuery("Appartement entier près de Bellecour.");
    expect(intent.neighborhoodHint).toBe("Bellecour");
    expect(intent.propertyTypes).toContain("APARTMENT");
  });

  it("retourne un objet vide pour une requête vide", () => {
    expect(parseSearchQuery("")).toEqual({});
  });
});
