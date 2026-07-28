"use client";

import { useEffect, useState } from "react";
import type { ListingDTO } from "@/types/listing";

const ROWS: { label: string; get: (l: ListingDTO) => React.ReactNode }[] = [
  { label: "Prix total", get: (l) => `${l.totalRentEuros} €/mois` },
  { label: "Prix / personne", get: (l) => `${l.pricePerPersonEuros} €` },
  { label: "Surface", get: (l) => (l.surfaceM2 ? `${l.surfaceM2} m²` : "—") },
  { label: "Chambres", get: (l) => l.numberOfRooms },
  { label: "4e coloc", get: (l) => (l.fourthRoomStatus === "COMPATIBLE" ? "✅" : l.fourthRoomStatus === "NOT_COMPATIBLE" ? "❌" : "❓") },
  { label: "DPE", get: (l) => l.dpeRating ?? "—" },
  { label: "Métro", get: (l) => (l.distanceMetroM !== null ? `${l.distanceMetroM} m` : "—") },
  { label: "Quartier", get: (l) => l.neighborhood ?? "—" },
  { label: "Score qualité", get: (l) => (l.qualityScore !== null ? `${l.qualityScore}/100` : "—") }
];

export default function ComparatorPage() {
  const [listings, setListings] = useState<ListingDTO[]>([]);

  useEffect(() => {
    // Dans une vraie implémentation, cette page lit les IDs sélectionnés
    // (query string ou état partagé) puis fetch /api/listings?ids=...
    const params = new URLSearchParams(window.location.search);
    const ids = params.get("ids")?.split(",") ?? [];
    if (ids.length === 0) return;
    Promise.all(ids.map((id) => fetch(`/api/listings/${id}`).then((r) => r.json())))
      .then((results) => setListings(results.map((r) => r.listing).filter(Boolean)));
  }, []);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <a href="/" className="mb-4 inline-block text-sm text-brand-600 hover:underline">← Retour à la recherche</a>
      <h1 className="mb-6 text-2xl font-bold">⚖️ Comparateur de logements</h1>

      {listings.length === 0 ? (
        <p className="text-gray-500">
          Sélectionne des logements depuis les résultats de recherche pour les comparer ici côte à côte.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl2 border border-gray-100 dark:border-gray-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <th className="p-3 text-left text-gray-400"></th>
                {listings.map((l) => (
                  <th key={l.id} className="p-3 text-left font-semibold">{l.title}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row) => (
                <tr key={row.label} className="border-b border-gray-50 dark:border-gray-900">
                  <td className="p-3 font-medium text-gray-500">{row.label}</td>
                  {listings.map((l) => (
                    <td key={l.id} className="p-3">{row.get(l)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
