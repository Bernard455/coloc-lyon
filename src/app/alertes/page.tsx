"use client";

import { useEffect, useState } from "react";
import { LYON_METRO_CITIES, MIN_GROUP_SIZE, MAX_GROUP_SIZE, defaultRoomsForGroupSize } from "@/types/listing";

interface AlertItem {
  id: string;
  name: string;
  criteria: { maxTotalRentEuros: number; maxPricePerPersonEuros: number; numberOfRooms: number[]; cities: string[]; groupSize?: number };
  channels: string[];
  active: boolean;
  lastTriggeredAt: string | null;
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const [name, setName] = useState("");
  const [groupSize, setGroupSize] = useState(4);
  const [maxTotal, setMaxTotal] = useState(1600);
  const [maxPerPerson, setMaxPerPerson] = useState(400);
  const [rooms, setRooms] = useState<number[]>(defaultRoomsForGroupSize(4));
  const [cities, setCities] = useState<string[]>(["Lyon"]);
  const [newCity, setNewCity] = useState("");
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
          criteria: { maxTotalRentEuros: maxTotal, maxPricePerPersonEuros: maxPerPerson, numberOfRooms: rooms, cities, groupSize },
          channels
        })
      });
      setName("");
      loadAlerts();
    } finally {
      setCreating(false);
    }
  }

  function addCity() {
    const trimmed = newCity.trim();
    if (trimmed && !cities.includes(trimmed)) setCities([...cities, trimmed]);
    setNewCity("");
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
            placeholder='Ex : "Appartement pour mon groupe à moins de 1600€"'
            className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 dark:border-gray-700 dark:bg-gray-900"
          />
        </label>

        <div>
          <p className="mb-1 text-sm font-medium">Taille du groupe</p>
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: MAX_GROUP_SIZE - MIN_GROUP_SIZE + 1 }, (_, i) => MIN_GROUP_SIZE + i).map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => { setGroupSize(n); setRooms(defaultRoomsForGroupSize(n)); }}
                className={`h-9 w-9 rounded-full text-sm ${groupSize === n ? "bg-brand-500 text-white" : "border border-gray-200 dark:border-gray-700"}`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

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
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: MAX_GROUP_SIZE - 1 }, (_, i) => i + 1).map((n) => (
              <button key={n} type="button" onClick={() => toggle(rooms, n, setRooms)}
                className={`rounded-full px-3 py-1.5 text-sm ${rooms.includes(n) ? "bg-brand-500 text-white" : "border border-gray-200 dark:border-gray-700"}`}>
                {n}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-1 text-sm font-medium">Villes</p>
          <div className="mb-2 flex flex-wrap gap-2">
            {cities.map((c) => (
              <button key={c} type="button" onClick={() => setCities(cities.filter((x) => x !== c))}
                className="rounded-full bg-brand-500 px-3 py-1.5 text-xs text-white">
                {c} ✕
              </button>
            ))}
          </div>
          <div className="mb-2 flex flex-wrap gap-2">
            {LYON_METRO_CITIES.filter((c) => !cities.includes(c)).map((c) => (
              <button key={c} type="button" onClick={() => setCities([...cities, c])}
                className="rounded-full border border-gray-200 px-3 py-1.5 text-xs text-gray-600 dark:border-gray-700 dark:text-gray-300">
                + {c}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newCity}
              onChange={(e) => setNewCity(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCity())}
              placeholder="Ajouter une autre ville"
              className="flex-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs dark:border-gray-700 dark:bg-gray-900"
            />
            <button type="button" onClick={addCity} className="btn-secondary px-3 py-1.5 text-xs">Ajouter</button>
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
