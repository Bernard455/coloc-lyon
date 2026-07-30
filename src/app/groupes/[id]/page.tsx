"use client";

import { useEffect, useState } from "react";
import { ListingCard } from "@/components/ListingCard";
import { listingToDTO } from "@/lib/listingDTO";
import type { ListingDTO } from "@/types/listing";

interface GroupMember {
  id: string;
  user: { id: string; name: string | null; email: string; image: string | null };
}

interface SharedFavorite {
  id: string;
  note: string | null;
  listing: any; // shape brut de Prisma (photos incluses) — converti localement pour ListingCard
  user: { id: string; name: string | null; email: string };
}

interface GroupDetail {
  id: string;
  name: string;
  inviteCode: string;
  members: GroupMember[];
  favorites: SharedFavorite[];
}

export default function GroupDetailPage({ params }: { params: { id: string } }) {
  const [group, setGroup] = useState<GroupDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  function load() {
    fetch(`/api/groups/${params.id}`)
      .then(async (r) => {
        if (!r.ok) throw new Error((await r.json()).error || "Erreur");
        return r.json();
      })
      .then((data) => setGroup(data.group))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(load, [params.id]);

  function copyInvite() {
    if (!group) return;
    navigator.clipboard.writeText(group.inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function unshare(listingId: string) {
    await fetch("/api/favorites", { method: "POST", body: JSON.stringify({ listingId, groupId: params.id }) });
    load();
  }

  if (loading) return <main className="mx-auto max-w-6xl px-4 py-8"><p className="text-gray-500">Chargement…</p></main>;
  if (error || !group) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-8">
        <a href="/groupes" className="mb-4 inline-block text-sm text-brand-600 hover:underline">← Retour aux groupes</a>
        <p className="text-red-600">{error ?? "Groupe introuvable"}</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <a href="/groupes" className="mb-4 inline-block text-sm text-brand-600 hover:underline">← Retour aux groupes</a>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">👥 {group.name}</h1>
        <button onClick={copyInvite} className="btn-secondary text-sm">
          {copied ? "Copié !" : `🔗 Code d'invitation : ${group.inviteCode}`}
        </button>
      </div>

      <div className="mb-8 flex flex-wrap gap-2">
        {group.members.map((m) => (
          <span key={m.id} className="badge bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
            {m.user.name || m.user.email}
          </span>
        ))}
      </div>

      <h2 className="mb-4 font-semibold">Favoris partagés par le groupe</h2>
      {group.favorites.length === 0 ? (
        <p className="text-gray-500">
          Aucun favori partagé pour l'instant. Depuis les résultats de recherche, ajoute un logement en favori puis
          partage-le dans ce groupe.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {group.favorites.map((f) => (
            <div key={f.id} className="space-y-2">
              <ListingCard listing={listingToDTO(f.listing)} />
              <div className="rounded-lg border border-gray-100 p-3 text-xs dark:border-gray-800">
                <p className="text-gray-500">
                  Ajouté par <span className="font-medium">{f.user.name || f.user.email}</span>
                </p>
                {f.note && <p className="mt-1 italic text-gray-600 dark:text-gray-300">"{f.note}"</p>}
                <button onClick={() => unshare(f.listing.id)} className="mt-2 text-red-500 hover:underline">
                  Retirer du groupe
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
