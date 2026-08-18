"use client";

import { useEffect, useState } from "react";

interface SiteContentData {
  ownerName: string;
  ownerAddress: string;
  ownerEmail: string;
  ownerPhone: string;
  tagline: string;
}

export default function AdminContenuPage() {
  const [content, setContent] = useState<SiteContentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/admin/site-content")
      .then((r) => r.json())
      .then((data) => setContent(data.content))
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!content) return;
    setSaving(true);
    setSaved(false);
    const res = await fetch("/api/admin/site-content", {
      method: "POST",
      body: JSON.stringify(content)
    });
    const data = await res.json();
    setContent(data.content);
    setSaving(false);
    setSaved(true);
  }

  if (loading || !content) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-8">
        <p className="text-gray-500">Chargement…</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <a href="/" className="mb-4 inline-block text-sm text-brand-600 hover:underline">← Retour à la recherche</a>
      <h1 className="mb-2 text-2xl font-bold">📝 Coordonnées légales</h1>
      <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
        Ces informations remplacent automatiquement les mentions <code className="rounded bg-gray-100 px-1 dark:bg-gray-800">[À compléter]</code> sur la page /mentions-legales.
      </p>

            <form onSubmit={handleSubmit} className="card space-y-4 p-5">
        <label className="block text-sm font-medium">
          Tagline affichée sur la page d'accueil
          <input
            value={content.tagline}
            onChange={(e) => setContent({ ...content, tagline: e.target.value })}
            className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 dark:border-gray-700 dark:bg-gray-900"
          />
        </label>
        <label className="block text-sm font-medium">
          Nom / raison sociale
          <input
            value={content.ownerName}
            onChange={(e) => setContent({ ...content, ownerName: e.target.value })}
            className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 dark:border-gray-700 dark:bg-gray-900"
          />
        </label>
        <label className="block text-sm font-medium">
          Adresse
          <input
            value={content.ownerAddress}
            onChange={(e) => setContent({ ...content, ownerAddress: e.target.value })}
            className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 dark:border-gray-700 dark:bg-gray-900"
          />
        </label>
        <label className="block text-sm font-medium">
          Email de contact légal
          <input
            type="email"
            value={content.ownerEmail}
            onChange={(e) => setContent({ ...content, ownerEmail: e.target.value })}
            className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 dark:border-gray-700 dark:bg-gray-900"
          />
        </label>
        <label className="block text-sm font-medium">
          Téléphone (optionnel)
          <input
            value={content.ownerPhone}
            onChange={(e) => setContent({ ...content, ownerPhone: e.target.value })}
            className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 dark:border-gray-700 dark:bg-gray-900"
          />
        </label>

        <button type="submit" disabled={saving} className="btn-primary w-full disabled:opacity-60">
          {saving ? "Enregistrement…" : "💾 Enregistrer"}
        </button>
        {saved && <p className="text-sm text-emerald-600">Enregistré avec succès.</p>}
      </form>
    </main>
  );
}