"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LYON_METRO_CITIES } from "@/types/listing";

const PROPERTY_TYPES = [
  { value: "APARTMENT", label: "Appartement entier" },
  { value: "HOUSE", label: "Maison" },
  { value: "EXISTING_ROOMMATE_SHARE", label: "Colocation constituée" },
  { value: "SINGLE_ROOM", label: "Chambre individuelle" }
];

const SOURCES = [
  "LEBONCOIN", "SELOGER", "BIENICI", "PAP", "STUDAPART", "CARTE_DES_COLOCS",
  "LOCSERVICE", "JINKA", "LOGIC_IMMO", "AGENCY", "STUDENT_RESIDENCE", "OTHER"
];

/**
 * Formulaire d'ajout manuel d'une annonce vue sur une plateforme tierce.
 * C'est la voie recommandée tant qu'aucun partenariat API n'est signé
 * (voir src/scrapers/README.md) : usage personnel, on ne republie pas le
 * contenu original en masse, on saisit ce qu'on a déjà consulté soi-même.
 */
export default function AddListingPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Géocodage automatique de l'adresse (remplace la saisie manuelle de lat/lng)
  const [address, setAddress] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [city, setCity] = useState<string>(LYON_METRO_CITIES[0]);
  const [geocoding, setGeocoding] = useState(false);
  const [geocodeResult, setGeocodeResult] = useState<{
    latitude: number;
    longitude: number;
    formattedAddress: string;
    confidence: "high" | "medium" | "low";
  } | null>(null);
  const [geocodeError, setGeocodeError] = useState<string | null>(null);

  async function handleGeocode() {
    if (!address.trim()) {
      setGeocodeError("Renseigne d'abord l'adresse.");
      return;
    }
    setGeocoding(true);
    setGeocodeError(null);
    setGeocodeResult(null);
    try {
      const params = new URLSearchParams({ address, postalCode, city });
      const res = await fetch(`/api/geocode?${params.toString()}`);
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Adresse introuvable");
      }
      const data = await res.json();
      setGeocodeResult(data);
    } catch (err) {
      setGeocodeError(err instanceof Error ? err.message : "Erreur de géocodage");
    } finally {
      setGeocoding(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!geocodeResult) {
      setError("Localise d'abord l'adresse (bouton \"Localiser l'adresse\") avant d'enregistrer.");
      return;
    }

    setSubmitting(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const photosRaw = String(form.get("photos") || "");

    const payload = {
      title: String(form.get("title")),
      description: String(form.get("description")),
      propertyType: String(form.get("propertyType")),
      totalRentEuros: Number(form.get("totalRentEuros")),
      chargesIncluded: form.get("chargesIncluded") === "on",
      surfaceM2: form.get("surfaceM2") ? Number(form.get("surfaceM2")) : undefined,
      numberOfRooms: Number(form.get("numberOfRooms")),
      numberOfBathrooms: form.get("numberOfBathrooms") ? Number(form.get("numberOfBathrooms")) : undefined,
      furnished: form.get("furnished") === "on",
      dpeRating: String(form.get("dpeRating") || "") || undefined,
      fourthRoomStatus: String(form.get("fourthRoomStatus") || "UNKNOWN"),
      fourthRoomNote: String(form.get("fourthRoomNote") || "") || undefined,
      address,
      postalCode,
      city,
      neighborhood: String(form.get("neighborhood") || "") || undefined,
      latitude: geocodeResult.latitude,
      longitude: geocodeResult.longitude,
      photos: photosRaw.split("\n").map((s) => s.trim()).filter(Boolean),
      contactName: String(form.get("contactName") || "") || undefined,
      contactPhone: String(form.get("contactPhone") || "") || undefined,
      contactEmail: String(form.get("contactEmail") || "") || undefined,
      agencyName: String(form.get("agencyName") || "") || undefined,
      sourceUrl: String(form.get("sourceUrl")),
      originalSource: String(form.get("originalSource") || "OTHER")
    };

    try {
      const res = await fetch("/api/admin/listings", { method: "POST", body: JSON.stringify(payload) });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      router.push(`/listing/${data.listing.id}`);
    } catch (err) {
      setError("Impossible d'enregistrer l'annonce. Vérifie que tous les champs obligatoires sont remplis correctement.");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <a href="/" className="mb-4 inline-block text-sm text-brand-600 hover:underline">← Retour à la recherche</a>
      <h1 className="mb-2 text-2xl font-bold">Ajouter une annonce</h1>
      <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
        Colle ici les informations d'une annonce que tu as consultée sur une autre plateforme (LeBonCoin, SeLoger…).
        Cet outil ne republie pas automatiquement du contenu tiers — il sert à centraliser manuellement ce que tu as toi-même trouvé.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="text-sm font-medium sm:col-span-2">
            Titre *
            <input name="title" required className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 dark:border-gray-700 dark:bg-gray-900" />
          </label>

          <label className="text-sm font-medium sm:col-span-2">
            Description *
            <textarea name="description" required rows={4} className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 dark:border-gray-700 dark:bg-gray-900" />
          </label>

          <label className="text-sm font-medium">
            Type de logement *
            <select name="propertyType" required className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 dark:border-gray-700 dark:bg-gray-900">
              {PROPERTY_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </label>

          <label className="text-sm font-medium">
            Source d'origine
            <select name="originalSource" className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 dark:border-gray-700 dark:bg-gray-900">
              {SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>

          <label className="text-sm font-medium">
            Loyer total (€/mois) *
            <input name="totalRentEuros" type="number" required min={1} className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 dark:border-gray-700 dark:bg-gray-900" />
          </label>

          <label className="flex items-center gap-2 text-sm font-medium">
            <input name="chargesIncluded" type="checkbox" className="h-4 w-4 accent-brand-500" /> Charges comprises
          </label>

          <label className="text-sm font-medium">
            Surface (m²)
            <input name="surfaceM2" type="number" min={1} className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 dark:border-gray-700 dark:bg-gray-900" />
          </label>

          <label className="text-sm font-medium">
            Nombre de chambres *
            <input name="numberOfRooms" type="number" required min={1} max={10} defaultValue={4} className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 dark:border-gray-700 dark:bg-gray-900" />
          </label>

          <label className="text-sm font-medium">
            Salles de bain
            <input name="numberOfBathrooms" type="number" min={0} className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 dark:border-gray-700 dark:bg-gray-900" />
          </label>

          <label className="flex items-center gap-2 text-sm font-medium">
            <input name="furnished" type="checkbox" className="h-4 w-4 accent-brand-500" /> Meublé
          </label>

          <label className="text-sm font-medium">
            DPE
            <select name="dpeRating" className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 dark:border-gray-700 dark:bg-gray-900">
              <option value="">—</option>
              {["A", "B", "C", "D", "E", "F", "G"].map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </label>

          <label className="text-sm font-medium">
            Compatibilité 4 colocataires (si 3 chambres)
            <select name="fourthRoomStatus" className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 dark:border-gray-700 dark:bg-gray-900">
              <option value="UNKNOWN">❓ À vérifier</option>
              <option value="COMPATIBLE">✅ Compatible</option>
              <option value="NOT_COMPATIBLE">❌ Non compatible</option>
            </select>
          </label>

          <label className="text-sm font-medium sm:col-span-2">
            Note sur le 4e colocataire
            <input name="fourthRoomNote" placeholder="Ex: le salon de 18m² peut servir de 4e chambre, propriétaire à confirmer" className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 dark:border-gray-700 dark:bg-gray-900" />
          </label>

          <div className="sm:col-span-2 rounded-xl2 border border-gray-100 p-4 dark:border-gray-800">
            <p className="mb-3 text-sm font-semibold">📍 Localisation</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <label className="text-sm font-medium sm:col-span-2">
                Adresse *
                <input
                  value={address}
                  onChange={(e) => { setAddress(e.target.value); setGeocodeResult(null); }}
                  required
                  placeholder="12 rue de la Guillotière"
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 dark:border-gray-700 dark:bg-gray-900"
                />
              </label>
              <label className="text-sm font-medium">
                Code postal *
                <input
                  value={postalCode}
                  onChange={(e) => { setPostalCode(e.target.value); setGeocodeResult(null); }}
                  required
                  placeholder="69007"
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 dark:border-gray-700 dark:bg-gray-900"
                />
              </label>
            </div>

            <label className="mt-3 block text-sm font-medium">
              Ville *
              <select
                value={city}
                onChange={(e) => { setCity(e.target.value); setGeocodeResult(null); }}
                required
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 dark:border-gray-700 dark:bg-gray-900"
              >
                {LYON_METRO_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </label>

            <button
              type="button"
              onClick={handleGeocode}
              disabled={geocoding}
              className="btn-secondary mt-3 w-full disabled:opacity-60"
            >
              {geocoding ? "Recherche en cours…" : "📍 Localiser l'adresse"}
            </button>

            {geocodeError && <p className="mt-2 text-sm text-red-600">{geocodeError}</p>}

            {geocodeResult && (
              <div className={`mt-3 rounded-lg p-3 text-sm ${geocodeResult.confidence === "high" ? "badge-success" : "badge-warning"}`}>
                <p className="font-medium">
                  {geocodeResult.confidence === "high" ? "✅ Adresse localisée avec précision" : "⚠️ Adresse trouvée, à vérifier"}
                </p>
                <p className="mt-1 text-xs">{geocodeResult.formattedAddress}</p>
                <p className="mt-1 text-xs text-gray-500">
                  {geocodeResult.latitude.toFixed(5)}, {geocodeResult.longitude.toFixed(5)}
                </p>
              </div>
            )}
          </div>

          <label className="text-sm font-medium sm:col-span-2">
            Quartier
            <input name="neighborhood" placeholder="Ex : Guillotière" className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 dark:border-gray-700 dark:bg-gray-900" />
          </label>

          <label className="text-sm font-medium sm:col-span-2">
            Photos (une URL par ligne)
            <textarea name="photos" rows={3} className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 dark:border-gray-700 dark:bg-gray-900" />
          </label>

          <label className="text-sm font-medium">
            Nom du contact
            <input name="contactName" className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 dark:border-gray-700 dark:bg-gray-900" />
          </label>

          <label className="text-sm font-medium">
            Agence (si applicable)
            <input name="agencyName" className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 dark:border-gray-700 dark:bg-gray-900" />
          </label>

          <label className="text-sm font-medium">
            Téléphone
            <input name="contactPhone" className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 dark:border-gray-700 dark:bg-gray-900" />
          </label>

          <label className="text-sm font-medium">
            Email
            <input name="contactEmail" type="email" className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 dark:border-gray-700 dark:bg-gray-900" />
          </label>

          <label className="text-sm font-medium sm:col-span-2">
            Lien vers l'annonce originale *
            <input name="sourceUrl" type="url" required placeholder="https://..." className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 dark:border-gray-700 dark:bg-gray-900" />
          </label>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button type="submit" disabled={submitting || !geocodeResult} className="btn-primary w-full disabled:opacity-60">
          {submitting ? "Enregistrement…" : !geocodeResult ? "Localise d'abord l'adresse ↑" : "Ajouter l'annonce"}
        </button>
      </form>
    </main>
  );
}
