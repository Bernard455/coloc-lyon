import { describe, it, expect } from "vitest";
import { getPopularityInfo } from "./popularity";

describe("getPopularityInfo", () => {
  it("retourne null quand il n'y a aucun favori", () => {
    expect(getPopularityInfo(0)).toBeNull();
  });

  it("retourne null pour une valeur négative ou invalide", () => {
    expect(getPopularityInfo(-1)).toBeNull();
  });

  it("retourne 'low' (🟢) entre 1 et 2 favoris", () => {
    expect(getPopularityInfo(1)?.level).toBe("low");
    expect(getPopularityInfo(2)?.level).toBe("low");
  });

  it("retourne 'medium' (🟡) entre 3 et 5 favoris", () => {
    expect(getPopularityInfo(3)?.level).toBe("medium");
    expect(getPopularityInfo(5)?.level).toBe("medium");
  });

  it("retourne 'high' (🟠) entre 6 et 10 favoris", () => {
    expect(getPopularityInfo(6)?.level).toBe("high");
    expect(getPopularityInfo(10)?.level).toBe("high");
  });

  it("retourne 'very_high' (🔴) à partir de 11 favoris", () => {
    expect(getPopularityInfo(11)?.level).toBe("very_high");
    expect(getPopularityInfo(500)?.level).toBe("very_high");
  });

  it("n'expose jamais le chiffre exact dans l'objet retourné", () => {
    const info = getPopularityInfo(7);
    expect(info).not.toHaveProperty("count");
    expect(info).not.toHaveProperty("favoritesCount");
  });
});