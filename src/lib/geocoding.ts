/**
 * Géocodage d'adresses — convertit une adresse texte en latitude/longitude.
 *
 * Utilise Nominatim (OpenStreetMap) par défaut : gratuit, aucune clé API,
 * mais avec une limite de taux stricte (1 requête/seconde, usage
 * raisonnable uniquement) — largement suffisant pour de la saisie manuelle
 * ou une ingestion à faible volume. Si le volume d'ingestion grossit
 * significativement (import de centaines d'annonces d'un coup), passer à
 * un provider payant (Google Geocoding API, Mapbox, ou l'API Adresse du
 * gouvernement français api-adresse.data.gouv.fr, qui est gratuite et sans
 * limite stricte pour des adresses françaises).
 */

export interface GeocodingResult {
  latitude: number;
  longitude: number;
  formattedAddress: string;
  postalCode: string | null;
  city: string | null;
  confidence: "high" | "medium" | "low";
}

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
// API Adresse du gouvernement français — gratuite, sans clé, plus précise sur les adresses FR
const ADRESSE_GOUV_URL = "https://api-adresse.data.gouv.fr/search/";

/**
 * Géocode une adresse française via l'API Adresse du gouvernement
 * (prioritaire, car plus précise et pensée pour la France), avec repli
 * automatique sur Nominatim si aucun résultat.
 */
export async function geocodeAddress(params: {
  address: string;
  postalCode?: string;
  city?: string;
}): Promise<GeocodingResult | null> {
  const query = [params.address, params.postalCode, params.city].filter(Boolean).join(", ");
  if (!query.trim()) return null;

  const viaGouv = await geocodeWithAdresseGouv(query);
  if (viaGouv) return viaGouv;

  return geocodeWithNominatim(query);
}

async function geocodeWithAdresseGouv(query: string): Promise<GeocodingResult | null> {
  try {
    const url = `${ADRESSE_GOUV_URL}?q=${encodeURIComponent(query)}&limit=1`;
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) return null;

    const data = await res.json();
    const feature = data.features?.[0];
    if (!feature) return null;

    const [longitude, latitude] = feature.geometry.coordinates;
    const props = feature.properties;

    return {
      latitude,
      longitude,
      formattedAddress: props.label,
      postalCode: props.postcode ?? null,
      city: props.city ?? null,
      confidence: props.score > 0.7 ? "high" : props.score > 0.4 ? "medium" : "low"
    };
  } catch (err) {
    console.error("[geocoding] Erreur API Adresse gouv", err);
    return null;
  }
}

async function geocodeWithNominatim(query: string): Promise<GeocodingResult | null> {
  try {
    const url = `${NOMINATIM_URL}?q=${encodeURIComponent(query)}&format=json&limit=1&addressdetails=1&countrycodes=fr`;
    const res = await fetch(url, {
      headers: {
        // Nominatim exige un User-Agent identifiable — obligatoire dans leur politique d'usage
        "User-Agent": "ColocLyon/1.0 (contact@coloc-lyon.fr)"
      }
    });
    if (!res.ok) return null;

    const data = await res.json();
    const result = data[0];
    if (!result) return null;

    return {
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon),
      formattedAddress: result.display_name,
      postalCode: result.address?.postcode ?? null,
      city: result.address?.city ?? result.address?.town ?? result.address?.village ?? null,
      confidence: result.importance > 0.6 ? "high" : result.importance > 0.3 ? "medium" : "low"
    };
  } catch (err) {
    console.error("[geocoding] Erreur Nominatim", err);
    return null;
  }
}

/**
 * Géocodage inverse (coordonnées → adresse). Utile pour un futur "clique sur
 * la carte pour placer l'annonce" côté formulaire admin.
 */
export async function reverseGeocode(lat: number, lon: number): Promise<string | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`;
    const res = await fetch(url, { headers: { "User-Agent": "ColocLyon/1.0 (contact@coloc-lyon.fr)" } });
    if (!res.ok) return null;
    const data = await res.json();
    return data.display_name ?? null;
  } catch {
    return null;
  }
}
