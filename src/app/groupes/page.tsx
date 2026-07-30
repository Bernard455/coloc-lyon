"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface GroupSummary {
  id: string;
  name: string;
  inviteCode: string;
  _count: { members: number; favorites: number };
}

export default function GroupsPage() {
  const [groups, setGroups] = useState<GroupSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [newGroupName, setNewGroupName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function loadGroups() {
    fetch("/api/groups")
      .then((r) => r.json())
      .then((data) => setGroups(data.groups ?? []))
      .finally(() => setLoading(false));
  }

  useEffect(loadGroups, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/groups", { method: "POST", body: JSON.stringify({ name: newGroupName }) });
      if (!res.ok) throw new Error((await res.json()).error || "Erreur");
      setNewGroupName("");
      loadGroups();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible de créer le groupe");
    } finally {
      setBusy(false);
    }
  }

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/groups/join", { method: "POST", body: JSON.stringify({ inviteCode: joinCode }) });
      if (!res.ok) throw new Error((await res.json()).error || "Code invalide");
      setJoinCode("");
      loadGroups();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible de rejoindre ce groupe");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <a href="/" className="mb-4 inline-block text-sm text-brand-600 hover:underline">← Retour à la recherche</a>
      <h1 className="mb-2 text-2xl font-bold">👥 Mes groupes</h1>
      <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
        Un groupe privé pour partager des favoris annotés avec tes futurs colocataires — chacun peut ajouter des
        logements, laisser une note, et vous comparez ensemble.
      </p>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <form onSubmit={handleCreate} className="card space-y-3 p-5">
          <p className="font-semibold">Créer un groupe</p>
          <input
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            required
            placeholder="Ex : Coloc 2026"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
          />
          <button type="submit" disabled={busy} className="btn-primary w-full disabled:opacity-60">Créer</button>
        </form>

        <form onSubmit={handleJoin} className="card space-y-3 p-5">
          <p className="font-semibold">Rejoindre avec un code</p>
          <input
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value)}
            required
            placeholder="Code d'invitation"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
          />
          <button type="submit" disabled={busy} className="btn-secondary w-full disabled:opacity-60">Rejoindre</button>
        </form>
      </div>

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      {loading && <p className="text-gray-500">Chargement…</p>}
      {!loading && groups.length === 0 && (
        <p className="text-gray-500">
          Aucun groupe pour l'instant — connecte-toi puis crée-en un, ou demande à un ami de te partager son code
          d'invitation.
        </p>
      )}

      <div className="space-y-3">
        {groups.map((g) => (
          <Link key={g.id} href={`/groupes/${g.id}`} className="card flex items-center justify-between p-4">
            <div>
              <p className="font-medium">{g.name}</p>
              <p className="text-xs text-gray-500">
                {g._count.members} membre{g._count.members > 1 ? "s" : ""} · {g._count.favorites} favori
                {g._count.favorites > 1 ? "s" : ""} partagé{g._count.favorites > 1 ? "s" : ""}
              </p>
            </div>
            <span className="text-gray-400">→</span>
          </Link>
        ))}
      </div>
    </main>
  );
}
