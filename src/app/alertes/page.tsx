"use client";

import { useEffect, useState } from "react";
import { LYON_METRO_CITIES } from "@/types/listing";

interface AlertItem {
  id: string;
  name: string;
  criteria: { maxTotalRentEuros: number; maxPricePerPersonEuros: number; numberOfRooms: number[]; cities: string[] };
  channels: string[];
  active: boolean;
  lastTriggeredAt: string | null;
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const [name, setName] = useState("");
  const [maxTotal, setMaxTotal] = useState(1600);
  const [maxPerPerson, setMaxPerPerson] = useState(400);
  const [rooms, setRooms] = useState<number[]>([4]);
  const [cities, setCities] = useState<string[]>(["Lyon"]);
  const [channels, setChannels] = useState<string[]>(["email"]);

  function loadAlerts() {
    fetch("/api/alerts")
      .then((r) => r.json())
      .then((data) => setAlerts(data.alerts ?? []))
      .finally(() => setLoading(false));
  }

  useEffect(loadAlerts, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    try {
      await fetch("/api/alerts", {
        method: "POST",
        body: JSON.stringify({
          name,
          criteria: { maxTotalRentEuros: maxTotal, maxPricePerPersonEuros: maxPerPerson, numberOfRooms: rooms, cities },
          channels
        })
      });
      setName("");
      loadAlerts();
    } finally {
      setCreating(false);
    }
  }

  const toggle = <T,>(arr: T[], v: T, setter: (a: T[]) => void) => setter(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <a href="/" className="mb-4 inline-block text-sm text-brand-600 hover:underline">← Retour à la recherche</a>
      <h1 className="mb-6 text-2xl font-bold">🔔 Mes alertes</h1>

      <form onSubmit={handleCreate} className="card mb-8 space-y-4 p-5">
        <p className="font-semibold">Créer une nouvelle alerte</p>
        <label className="block text-sm font-medium">
          Nom de l'alerte
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder='Ex : "Appartement 4 chambres à moins de 1600€"'
            className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 dark:border-gray-700 dark:bg-gray-900"
          />
        </label>

        <div className="grid grid-cols-2 gap-4">
          <label className="text-sm font-medium">
            Budget total max
            <input type="number" value={maxTotal} onChange={(e) => setMaxTotal(Number(e.target.value))} className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 dark:border-gray-700 dark:bg-gray-900" />
          </label>
          <label className="text-sm font-medium">
            Budget / personne max
            <input type="number" value={maxPerPerson} onChange={(e) => setMaxPerPerson(Number(e.target.value))} className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 dark:border-gray-700 dark:bg-gray-900" />
          </label>
        </div>

        <div>
          <p className="mb-1 text-sm font-medium">Chambres</p>
          <div className="flex gap-2">
            {[4, 3].map((n) => (
              <button key={n} type="button" onClick={() => toggle(rooms, n, setRooms)}
                className={`rounded-full px-3 py-1.5 text-sm ${rooms.includes(n) ? "bg-brand-500 text-white" : "border border-gray-200 dark:border-gray-700"}`}>
                {n} chambres
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-1 text-sm font-medium">Villes</p>
          <div className="flex flex-wrap gap-2">
            {LYON_METRO_CITIES.map((c) => (
              <button key={c} type="button" onClick={() => toggle(cities, c, setCities)}
                className={`rounded-full px-3 py-1.5 text-xs ${cities.includes(c) ? "bg-brand-500 text-white" : "border border-gray-200 dark:border-gray-700"}`}>
                {c}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-1 text-sm font-medium">Notification par</p>
          <div className="flex gap-2">
            {[{ v: "email", l: "📧 Email" }, { v: "browser", l: "🔔 Navigateur" }].map((opt) => (
              <button key={opt.v} type="button" onClick={() => toggle(channels, opt.v, setChannels)}
                className={`rounded-full px-3 py-1.5 text-sm ${channels.includes(opt.v) ? "bg-brand-500 text-white" : "border border-gray-200 dark:border-gray-700"}`}>
                {opt.l}
              </button>
            ))}
          </div>
        </div>

        <button type="submit" disabled={creating} className="btn-primary w-full disabled:opacity-60">
          {creating ? "Création…" : "Créer l'alerte"}
        </button>
      </form>

      <h2 className="mb-3 font-semibold">Alertes actives</h2>
      {loading && <p className="text-gray-500">Chargement…</p>}
      {!loading && alerts.length === 0 && <p className="text-gray-500">Aucune alerte pour l'instant.</p>}
      <div className="space-y-3">
        {alerts.map((a) => (
          <div key={a.id} className="card flex items-center justify-between p-4">
            <div>
              <p className="font-medium">{a.name}</p>
              <p className="text-xs text-gray-500">
                {a.criteria.numberOfRooms.join("/")} chambres · max {a.criteria.maxTotalRentEuros}€ total, {a.criteria.maxPricePerPersonEuros}€/pers · {a.criteria.cities.join(", ")}
              </p>
            </div>
            <span className={`badge ${a.active ? "badge-success" : "badge-warning"}`}>{a.active ? "Active" : "Suspendue"}</span>
          </div>
        ))}
      </div>
    </main>
  );
}
