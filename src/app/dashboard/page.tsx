import { prisma } from "@/lib/db";
import { startOfDay } from "date-fns";

async function getStats() {
  const [total, wholeHomes, sharedRoommate, priceAgg, surfaceAgg, todayCount] = await Promise.all([
    prisma.listing.count({ where: { status: "ACTIVE" } }),
    prisma.listing.count({ where: { status: "ACTIVE", propertyType: { in: ["APARTMENT", "HOUSE"] } } }),
    prisma.listing.count({ where: { status: "ACTIVE", propertyType: "EXISTING_ROOMMATE_SHARE" } }),
    prisma.listing.aggregate({ where: { status: "ACTIVE" }, _avg: { totalRent: true }, _min: { totalRent: true }, _max: { totalRent: true } }),
    prisma.listing.aggregate({ where: { status: "ACTIVE" }, _avg: { surfaceM2: true } }),
    prisma.listing.count({ where: { status: "ACTIVE", createdAt: { gte: startOfDay(new Date()) } } })
  ]);

  return {
    total,
    wholeHomes,
    sharedRoommate,
    avgPrice: priceAgg._avg.totalRent ? Math.round(priceAgg._avg.totalRent / 100) : 0,
    minPrice: priceAgg._min.totalRent ? Math.round(priceAgg._min.totalRent / 100) : 0,
    maxPrice: priceAgg._max.totalRent ? Math.round(priceAgg._max.totalRent / 100) : 0,
    avgSurface: surfaceAgg._avg.surfaceM2 ? Math.round(surfaceAgg._avg.surfaceM2) : 0,
    todayCount
  };
}

export default async function DashboardPage() {
  const stats = await getStats();

  const cards = [
    { label: "Annonces trouvées", value: stats.total },
    { label: "Logements entiers", value: stats.wholeHomes },
    { label: "Colocations constituées", value: stats.sharedRoommate },
    { label: "Prix moyen", value: `${stats.avgPrice} €` },
    { label: "Prix minimum", value: `${stats.minPrice} €` },
    { label: "Prix maximum", value: `${stats.maxPrice} €` },
    { label: "Surface moyenne", value: `${stats.avgSurface} m²` },
    { label: "Nouvelles annonces aujourd'hui", value: stats.todayCount }
  ];

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <a href="/" className="mb-4 inline-block text-sm text-brand-600 hover:underline">← Retour à la recherche</a>
      <h1 className="mb-6 text-2xl font-bold">📊 Tableau de bord</h1>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="card p-5">
            <p className="text-xs text-gray-400">{c.label}</p>
            <p className="mt-1 text-2xl font-bold">{c.value}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
