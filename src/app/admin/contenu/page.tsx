"use client";

import { useEffect, useState } from "react";

interface FaqItem {
  q: string;
  a: string;
}

interface SiteContentData {
  ownerName: string;
  ownerAddress: string;
  ownerEmail: string;
  ownerPhone: string;
  tagline: string;
  brandName: string;
  faqItems: FaqItem[];
  legalUpdatedAt: string;
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

  function updateFaqItem(index: number, field: "q" | "a", value: string) {
    if (!content) return;
    const faqItems = content.faqItems.map((item, i) => (i === index ? { ...item, [field]: value } : item));
    setContent({ ...content, faqItems });
  }

  function addFaqItem() {
    if (!content) return;
    setContent({ ...content, faqItems: [...content.faqItems, { q: "", a: "" }] });
  }

  function removeFaqItem(index: number) {
    if (!content) return;
    setContent({ ...content, faqItems: content.faqItems.filter((_, i) => i !== index) });
  }

  function moveFaqItem(index: number, direction: -1 | 1) {
    if (!content) return;
    const target = index + direction;
    if (target < 0 || target >= content.faqItems.length) return;
    const faqItems = [...content.faqItems];
    [faqItems[index], faqItems[target]] = [faqItems[target], faqItems[index]];
    setContent({ ...content, faqItems });
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
      <h1 className="mb-2 text-2xl font-bold">📝 Contenu du site</h1>
      <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
        Coordonnées légales (remplacent les <code className="rounded bg-gray-100 px-1 dark:bg-gray-800">[À compléter]</code> sur /mentions-legales) et questions fréquentes affichées sur /aide.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card space-y-4 p-5">
          <label className="block text-sm font-medium">
            Nom affiché publiquement (footer, etc.)
            <input
              value={content.brandName}
              onChange={(e) => setContent({ ...content, brandName: e.target.value })}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 dark:border-gray-700 dark:bg-gray-900"
            />
          </label>
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
        </div>

        <div className="card space-y-4 p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">❓ Questions fréquentes (page Aide &amp; FAQ)</h2>
            <button type="button" onClick={addFaqItem} className="btn-secondary text-sm">
              + Ajouter une question
            </button>
          </div>

          {content.faqItems.length === 0 && (
            <p className="text-sm text-gray-400">Aucune question pour l'instant.</p>
          )}

          {content.faqItems.map((item, index) => (
            <div key={index} className="space-y-2 rounded-xl2 border border-gray-100 p-4 dark:border-gray-800">
              <div className="flex items-start justify-between gap-2">
                <label className="block flex-1 text-sm font-medium">
                  Question
                  <input
                    value={item.q}
                    onChange={(e) => updateFaqItem(index, "q", e.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 dark:border-gray-700 dark:bg-gray-900"
                  />
                </label>
                <div className="mt-6 flex gap-1">
                  <button type="button" onClick={() => moveFaqItem(index, -1)} disabled={index === 0} className="rounded px-2 py-1 text-sm disabled:opacity-30" title="Monter">↑</button>
                  <button type="button" onClick={() => moveFaqItem(index, 1)} disabled={index === content.faqItems.length - 1} className="rounded px-2 py-1 text-sm disabled:opacity-30" title="Descendre">↓</button>
                  <button type="button" onClick={() => removeFaqItem(index)} className="rounded px-2 py-1 text-sm text-red-600" title="Supprimer">🗑</button>
                </div>
              </div>
                        <label className="block text-sm font-medium">
            Téléphone (optionnel)
            <input
              value={content.ownerPhone}
              onChange={(e) => setContent({ ...content, ownerPhone: e.target.value })}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 dark:border-gray-700 dark:bg-gray-900"
            />
          </label>
          <label className="block text-sm font-medium">
            Date de dernière mise à jour légale (Confidentialité &amp; CGU)
            <input
              type="date"
              value={content.legalUpdatedAt}
              onChange={(e) => setContent({ ...content, legalUpdatedAt: e.target.value })}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 dark:border-gray-700 dark:bg-gray-900"
            />
          </label>
        </div>

        <button type="submit" disabled={saving} className="btn-primary w-full disabled:opacity-60">
          {saving ? "Enregistrement…" : "💾 Enregistrer"}
        </button>
        {saved && <p className="text-sm text-emerald-600">Enregistré avec succès.</p>}
      </form>
    </main>
  );
}