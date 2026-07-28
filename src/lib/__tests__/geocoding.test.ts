import { describe, it, expect, vi, afterEach } from "vitest";
import { geocodeAddress } from "../geocoding";

const originalFetch = global.fetch;

afterEach(() => {
  global.fetch = originalFetch;
  vi.restoreAllMocks();
});

describe("geocodeAddress", () => {
  it("utilise le résultat de l'API Adresse gouv en priorité", async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        features: [
          {
            geometry: { coordinates: [4.8365, 45.7526] },
            properties: { label: "12 Rue de la Guillotière 69007 Lyon", postcode: "69007", city: "Lyon", score: 0.9 }
          }
        ]
      })
    } as Response);

    const result = await geocodeAddress({ address: "12 rue de la Guillotière", postalCode: "69007", city: "Lyon" });

    expect(result).not.toBeNull();
    expect(result?.latitude).toBeCloseTo(45.7526);
    expect(result?.longitude).toBeCloseTo(4.8365);
    expect(result?.confidence).toBe("high");
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it("se replie sur Nominatim si l'API Adresse gouv ne trouve rien", async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ features: [] }) } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [
          {
            lat: "45.77",
            lon: "4.87",
            display_name: "Villeurbanne, Rhône, France",
            importance: 0.7,
            address: { city: "Villeurbanne", postcode: "69100" }
          }
        ]
      } as Response);

    const result = await geocodeAddress({ address: "adresse improbable", city: "Villeurbanne" });

    expect(result).not.toBeNull();
    expect(result?.city).toBe("Villeurbanne");
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it("retourne null si aucune source ne trouve l'adresse", async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ features: [] }) } as Response)
      .mockResolvedValueOnce({ ok: true, json: async () => [] } as Response);

    const result = await geocodeAddress({ address: "adresse totalement inexistante xyz123" });
    expect(result).toBeNull();
  });

  it("retourne null pour une requête vide", async () => {
    global.fetch = vi.fn();
    const result = await geocodeAddress({ address: "" });
    expect(result).toBeNull();
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
