"use client";

import { useEffect, useState } from "react";

interface SyncSettings {
  enabled: boolean;
  frequency: "hourly" | "every6h" | "daily";
  lastRunAt: string | null;
  lastRunStatus: string | null;
}

const FREQUENCY_LABELS: Record<SyncSettings["frequency"], string> = {
  hourly: "Toutes les heures",
  every6h: "Toutes les 6 heures",
  daily: "Une fois par jour"
};

export default function SynchronisationPage() {
  const [settings, setSettings] = useState<SyncSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [lastResult, setLastResult] = useState<string | null>(null);

  function loadSettings() {
    fetch("/api/admin/sync")
      .then((r) => r.json())
      .then((data) => setSettings(data.settings))
      .finally(() => setLoading(false));
  }

  useEffect(loadSettings, []);

  async function updateSettings(patch: Partial<SyncSettings>) {
    const res = await fetch("/api/admin/sync", { method: "POST", body: JSON.stringify(patch) });
    const data = await res.json();
    setSettings(data.settings);
  }

  async function runNow() {
    setRunning(true);
    setLastResult(null);
    try {
      const res = await fetch("/api/admin/sync/run", { method: "POST" });
      const data = await res.json();
      if (data.error) {
        setLastResult(`Erreur : ${data.error}`);
      } else {
        const total = data.summary.perSource.reduce((sum: number, s: any) => sum + s.created, 0);
        const expired = data.summary.perSource.reduce((sum: number, s: any) => sum + s.expired, 0);
        setLastResult(`${total} annonce(s) traitée(s), ${expired} expirée(s), ${data.summary.duplicateClusters} doublon(s) détecté(s).`);
      }
      loadSettings();
    } catch (err) {
      setLastResult("Erreur réseau pendant la synchronisation.");
    } finally {
      setRunning(false);
    }
  }

  if (loading || !settings) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-8">
        <p className="text-gray-500">Chargement…</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <a href="/" className="mb-4 inline-block text-sm text-brand-600 hover:underline">← Retour à la recherche</a>
      <h1 className="mb-2 text-2xl font-bold">⚙️ Synchronisation automatique</h1>
      <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
        Récupère, dédoublonne, géocode et note automatiquement les annonces des sources connectées (voir{" "}
        <code className="rounded bg-gray-100 px-1 dark:bg-gray-800">src/scrapers/README.md</code> pour le détail légal de
        chaque source). Sans partenariat API actif, seules les annonces saisies manuellement sont traitées.
      </p>

      <div className="card mb-6 space-y-5 p-5">
        <label className="flex items-center justify-between">
          <span className="text-sm font-medium">Synchronisation activée</span>
          <input
            type="checkbox"
            checked={settings.enabled}
            onChange={(e) => updateSettings({ enabled: e.target.checked })}
            className="h-5 w-5 accent-brand-500"
          />
        </label>

        <div>
          <p className="mb-2 text-sm font-medium">Fréquence</p>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(FREQUENCY_LABELS) as SyncSettings["frequency"][]).map((freq) => (
              <button
                key={freq}
                type="button"
                onClick={() => updateSettings({ frequency: freq })}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                  settings.frequency === freq
                    ? "bg-brand-500 text-white"
                    : "border border-gray-200 text-gray-600 dark:border-gray-700 dark:text-gray-300"
                }`}
              >
                {FREQUENCY_LABELS[freq]}
              </button>
            ))}
          </div>
        </div>

        <div className="border-t border-gray-100 pt-4 text-sm dark:border-gray-800">
          <p className="text-gray-500">
            Dernière synchronisation :{" "}
            {settings.lastRunAt ? new Date(settings.lastRunAt).toLocaleString("fr-FR") : "jamais"}
            {settings.lastRunStatus && (
              <span
                className={`ml-2 badge ${
                  settings.lastRunStatus === "success"
                    ? "badge-success"
                    : settings.lastRunStatus === "failed"
                      ? "badge-danger"
                      : "badge-warning"
                }`}
              >
                {settings.lastRunStatus}
              </span>
            )}
          </p>
        </div>

        <button onClick={runNow} disabled={running} className="btn-primary w-full disabled:opacity-60">
          {running ? "Synchronisation en cours…" : "🔄 Lancer une synchronisation maintenant"}
        </button>

        {lastResult && <p className="text-sm text-gray-600 dark:text-gray-300">{lastResult}</p>}
      </div>

      <div className="rounded-xl2 border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-900/20 dark:text-amber-400">
        Le cron automatique (planifié dans <code>vercel.json</code>) appelle{" "}
        <code>/api/cron/sync</code> une fois par jour sur le plan gratuit Vercel — c'est la limite du plan Hobby, pas de
        ce projet. Pour une fréquence plus élevée (toutes les heures ou 6h), utilise un déclencheur externe comme un
        GitHub Actions planifié qui appelle cette même route (détail dans <code>DEPLOIEMENT.md</code>).
      </div>
    </main>
  );
}
