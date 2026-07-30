"use client";

import { useEffect, useState } from "react";
import { ListingCard } from "@/components/ListingCard";
import { listingToDTO } from "@/lib/listingDTO";
import type { ListingDTO } from "@/types/listing";

interface GroupOption {
  id: string;
  name: string;
}

export default function FavoritesPage() {
  const [listings, setListings] = useState<ListingDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState<GroupOption[]>([]);
  const [shareTarget, setShareTarget] = useState<Record<string, string>>({});
  const [sharedMessage, setSharedMessage] = useState<string | null>(null);

  function loadFavorites() {
    fetch("/api/favorites")
      .then((r) => r.json())
      .then((data) => setListings((data.favorites ?? []).map((f: any) => listingToDTO(f.listing))))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadFavorites();
    fetch("/api/groups")
      .then((r) => r.json())
      .then((data) => setGroups((data.groups ?? []).map((g: any) => ({ id: g.id, name: g.name }))));
  }, []);

  async function shareToGroup(listingId: string) {
    const groupId = shareTarget[listingId];
    if (!groupId) return;
    await fetch("/api/favorites", { method: "POST", body: JSON.stringify({ listingId, groupId }) });
    setSharedMessage("Partagé dans le groupe ✅");
    setTimeout(() => setSharedMessage(null), 2500);
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <a href="/" className="mb-4 inline-block text-sm text-brand-600 hover:underline">← Retour à la recherche</a>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">❤️ Mes logements favoris</h1>
        <a href="/groupes" className="btn-secondary text-sm">👥 Mes groupes</a>
      </div>

      {sharedMessage && <p className="mb-4 text-sm text-emerald-600">{sharedMessage}</p>}

      {loading && <p className="text-gray-500">Chargement…</p>}
      {!loading && listings.length === 0 && (
        <p className="text-gray-500">
          Aucun favori pour l'instant. Connecte-toi et clique sur le cœur d'une annonce pour la sauvegarder ici.
        </p>
      )}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {listings.map((listing) => (
          <div key={listing.id} className="space-y-2">
            <ListingCard listing={listing} />
            {groups.length > 0 && (
              <div className="flex gap-2">
                <select
                  value={shareTarget[listing.id] || ""}
                  onChange={(e) => setShareTarget({ ...shareTarget, [listing.id]: e.target.value })}
                  className="flex-1 rounded-lg border border-gray-200 px-2 py-1.5 text-xs dark:border-gray-700 dark:bg-gray-900"
                >
                  <option value="">Partager dans un groupe…</option>
                  {groups.map((g) => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
                <button
                  onClick={() => shareToGroup(listing.id)}
                  disabled={!shareTarget[listing.id]}
                  className="btn-secondary px-3 py-1.5 text-xs disabled:opacity-50"
                >
                  Partager
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}
