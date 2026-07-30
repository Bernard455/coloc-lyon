import { describe, it, expect } from "vitest";
import { parseSearchQuery } from "../nlpSearch";

describe("parseSearchQuery", () => {
  it("extrait le budget par personne et le nombre d'étudiants", () => {
    const intent = parseSearchQuery("Je cherche un appartement pour 4 étudiants à moins de 400 € par personne.");
    expect(intent.propertyTypes).toContain("APARTMENT");
    expect(intent.maxPricePerPersonEuros).toBe(400);
    expect(intent.groupSizeHint).toBe(4);
    expect(intent.numberOfRoomsHint).toEqual([4, 3]);
  });

  it("généralise à d'autres tailles de groupe (pas seulement 4)", () => {
    const intent = parseSearchQuery("Colocation pour 6 personnes à Marseille");
    expect(intent.groupSizeHint).toBe(6);
    expect(intent.numberOfRoomsHint).toEqual([6, 5]);
    expect(intent.cityHint).toBeUndefined(); // Marseille n'est pas dans la liste suggérée Lyon, c'est attendu
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
