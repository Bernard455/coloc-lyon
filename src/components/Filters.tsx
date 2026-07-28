"use client";

import { LYON_METRO_CITIES, type PropertyType, type SearchFilters, type SortOption } from "@/types/listing";

const PROPERTY_TYPE_OPTIONS: { value: PropertyType; label: string }[] = [
  { value: "APARTMENT", label: "Appartement" },
  { value: "HOUSE", label: "Maison" },
  { value: "EXISTING_ROOMMATE_SHARE", label: "Colocation constituée" },
  { value: "SINGLE_ROOM", label: "Chambre seule" }
];

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "price_asc", label: "Prix croissant" },
  { value: "price_desc", label: "Prix décroissant" },
  { value: "surface_desc", label: "Surface" },
  { value: "rooms_desc", label: "Nombre de chambres" },
  { value: "date_desc", label: "Date de publication" },
  { value: "distance_school_asc", label: "Distance d'une école" },
  { value: "commute_asc", label: "Temps en transports" }
];

export function Filters({ filters, onChange }: { filters: SearchFilters; onChange: (f: SearchFilters) => void }) {
  const toggleArrayValue = <T,>(arr: T[], value: T): T[] => (arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value]);

  return (
    <div className="card space-y-6 p-5">
      <div>
        <p className="mb-2 text-sm font-semibold">Budget maximum</p>
        <label className="mb-1 flex justify-between text-xs text-gray-500">
          <span>Total / mois</span>
          <span className="font-medium text-gray-800 dark:text-gray-200">{filters.maxTotalRentEuros} €</span>
        </label>
        <input
          type="range"
          min={800}
          max={3000}
          step={50}
          value={filters.maxTotalRentEuros}
          onChange={(e) => onChange({ ...filters, maxTotalRentEuros: Number(e.target.value) })}
          className="w-full accent-brand-500"
        />
        <label className="mb-1 mt-3 flex justify-between text-xs text-gray-500">
          <span>Par personne</span>
          <span className="font-medium text-gray-800 dark:text-gray-200">{filters.maxPricePerPersonEuros} €</span>
        </label>
        <input
          type="range"
          min={200}
          max={800}
          step={10}
          value={filters.maxPricePerPersonEuros}
          onChange={(e) => onChange({ ...filters, maxPricePerPersonEuros: Number(e.target.value) })}
          className="w-full accent-brand-500"
        />
      </div>

      <div>
        <p className="mb-2 text-sm font-semibold">Nombre de chambres</p>
        <div className="flex gap-2">
          {[4, 3].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => onChange({ ...filters, numberOfRooms: toggleArrayValue(filters.numberOfRooms, n as 3 | 4) })}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                filters.numberOfRooms.includes(n as 3 | 4)
                  ? "bg-brand-500 text-white"
                  : "border border-gray-200 text-gray-600 dark:border-gray-700 dark:text-gray-300"
              }`}
            >
              {n} chambres
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-semibold">Type de logement</p>
        <div className="flex flex-wrap gap-2">
          {PROPERTY_TYPE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange({ ...filters, propertyTypes: toggleArrayValue(filters.propertyTypes, opt.value) })}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                filters.propertyTypes.includes(opt.value)
                  ? "bg-brand-500 text-white"
                  : "border border-gray-200 text-gray-600 dark:border-gray-700 dark:text-gray-300"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-semibold">Villes</p>
        <div className="flex flex-wrap gap-2">
          {LYON_METRO_CITIES.map((city) => (
            <button
              key={city}
              type="button"
              onClick={() => onChange({ ...filters, cities: toggleArrayValue(filters.cities, city) })}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                filters.cities.includes(city)
                  ? "bg-brand-500 text-white"
                  : "border border-gray-200 text-gray-600 dark:border-gray-700 dark:text-gray-300"
              }`}
            >
              {city}
            </button>
          ))}
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={Boolean(filters.onlyFourCompatible)}
          onChange={(e) => onChange({ ...filters, onlyFourCompatible: e.target.checked })}
          className="h-4 w-4 accent-brand-500"
        />
        Uniquement les logements confirmés pour 4 colocataires
      </label>

      <div>
        <p className="mb-2 text-sm font-semibold">Trier par</p>
        <select
          value={filters.sort}
          onChange={(e) => onChange({ ...filters, sort: e.target.value as SortOption })}
          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
