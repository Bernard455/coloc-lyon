"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { SearchBar } from "@/components/SearchBar";
import { Filters } from "@/components/Filters";
import { ListingCard } from "@/components/ListingCard";
import { AuthButton } from "@/components/AuthButton";
import { Toast, type ToastState } from "@/components/Toast";
import { parseSearchQuery, mergeIntentIntoFilters } from "@/lib/nlpSearch";
import { DEFAULT_FILTERS, type ListingDTO, type SearchFilters } from "@/types/listing";

// La carte utilise `window` (Leaflet) → chargement client uniquement
const MapView = dynamic(() => import("@/components/MapView").then((m) => m.MapView), { ssr: false });

export default function HomePage() {
  const [filters, setFilters] = useState<SearchFilters>(DEFAULT_FILTERS);
  const [listings, setListings] = useState<ListingDTO[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"list" | "map">("list");
  const [stats, setStats] = useState<{ total: number } | null>(null);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("cities", filters.cities.join(","));
    params.set("groupSize", String(filters.groupSize));
    params.set("maxTotalRentEuros", String(filters.maxTotalRentEuros));
    params.set("maxPricePerPersonEuros", String(filters.maxPricePerPersonEuros));
    params.set("numberOfRooms", filters.numberOfRooms.join(","));
    params.set("propertyTypes", filters.propertyTypes.join(","));
    params.set("sort", filters.sort);
    params.set("page", String(filters.page));
    params.set("pageSize", String(filters.pageSize));
    if (filters.onlyFourCompatible) params.set("onlyFourCompatible", "true");

    fetch(`/api/listings?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => {
        setListings(data.listings);
        setStats({ total: data.total });
      })
      .finally(() => setLoading(false));
  }, [filters]);

  const handleNaturalSearch = (query: string) => {
    const intent = parseSearchQuery(query);
    setFilters((prev) => mergeIntentIntoFilters({ ...prev, query, page: 1 }, intent));
  };

  const [toast, setToast] = useState<ToastState | null>(null);

  const toggleFavorite = (id: string) => {
    const willBeFavorited = !favorites.has(id);
    setFavorites((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
    fetch("/api/favorites", { method: "POST", body: JSON.stringify({ listingId: id }) }).catch(() => {});
    if (willBeFavorited) {
      setToast({ message: "Ajouté aux favoris", href: "/favoris", linkLabel: "Voir mes favoris →" });
    }
  };

  const resultsLabel = useMemo(() => {
    if (loading) return "Recherche en cours…";
    if (!stats) return "";
    return `${stats.total} logement${stats.total > 1 ? "s" : ""} trouvé${stats.total > 1 ? "s" : ""}`;
  }, [loading, stats]);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <header className="mb-8 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">Comparo</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Compare et partage les logements trouvés pour ton groupe</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <nav className="flex flex-wrap gap-3 text-sm font-medium">
              <a href="/favoris" className="btn-secondary">❤️ Favoris</a>
              <a href="/groupes" className="btn-secondary">👥 Groupes</a>
              <a href="/comparateur" className="btn-secondary">⚖️ Comparateur</a>
              <a href="/alertes" className="btn-secondary">🔔 Alertes</a>
              <a href="/dashboard" className="btn-secondary">📊 Tableau de bord</a>
              <a href="/admin/ajouter-annonce" className="btn-secondary">➕ Ajouter une annonce</a>
              <a href="/admin/synchronisation" className="btn-secondary">⚙️ Synchronisation</a>
              <a href="/admin/messages" className="btn-secondary">📬 Messages</a>
            </nav>
            <AuthButton />
          </div>
        </div>
        <SearchBar onSearch={handleNaturalSearch} initialValue={filters.query} />
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[300px_1fr]">
        <aside>
          <Filters filters={filters} onChange={(f) => setFilters({ ...f, page: 1 })} />
        </aside>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-gray-500 dark:text-gray-400">{resultsLabel}</p>
            <div className="flex overflow-hidden rounded-full border border-gray-200 text-sm dark:border-gray-700">
              <button
                onClick={() => setView("list")}
                className={`px-4 py-1.5 ${view === "list" ? "bg-brand-500 text-white" : ""}`}
              >
                Liste
              </button>
              <button
                onClick={() => setView("map")}
                className={`px-4 py-1.5 ${view === "map" ? "bg-brand-500 text-white" : ""}`}
              >
                Carte
              </button>
            </div>
          </div>

          {view === "list" ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {listings.map((listing) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  groupSize={filters.groupSize}
                  onToggleFavorite={toggleFavorite}
                  isFavorite={favorites.has(listing.id)}
                />
              ))}
              {!loading && listings.length === 0 && (
                <p className="col-span-full py-16 text-center text-gray-500">
                  Aucun logement ne correspond à ces critères pour l'instant. Élargis le budget ou les villes, ou crée une alerte pour être prévenu dès qu'une annonce correspond.
                </p>
              )}
            </div>
          ) : (
            <div className="h-[70vh]">
              <MapView listings={listings} />
            </div>
          )}
        </section>
      </div>

      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </main>
  );
}
