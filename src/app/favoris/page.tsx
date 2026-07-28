"use client";

import { useEffect, useState } from "react";
import { ListingCard } from "@/components/ListingCard";
import type { ListingDTO } from "@/types/listing";

export default function FavoritesPage() {
  const [listings, setListings] = useState<ListingDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/favorites")
      .then((r) => r.json())
      .then((data) => setListings((data.favorites ?? []).map((f: any) => f.listing)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <a href="/" className="mb-4 inline-block text-sm text-brand-600 hover:underline">← Retour à la recherche</a>
      <h1 className="mb-6 text-2xl font-bold">❤️ Mes logements favoris</h1>

      {loading && <p className="text-gray-500">Chargement…</p>}
      {!loading && listings.length === 0 && (
        <p className="text-gray-500">
          Aucun favori pour l'instant. Connecte-toi et clique sur le cœur d'une annonce pour la sauvegarder ici.
        </p>
      )}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {listings.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>
    </main>
  );
}
