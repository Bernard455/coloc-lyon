import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";

// Génère le sitemap dynamiquement à chaque requête plutôt qu'au moment du
// build, pour la même raison que le dashboard (voir sa page.tsx).
export const dynamic = "force-dynamic";

const SITE_URL = process.env.NEXTAUTH_URL || "https://coloc-lyon.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const listings = await prisma.listing.findMany({
    where: { status: "ACTIVE" },
    select: { id: true, updatedAt: true },
    take: 5000
  });

  const staticRoutes: MetadataRoute.Sitemap = [
    "", "/favoris", "/groupes", "/comparateur", "/dashboard", "/aide", "/contact", "/mentions-legales", "/confidentialite", "/cgu"
  ].map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: route === "" ? 1 : 0.5
  }));

  const listingRoutes: MetadataRoute.Sitemap = listings.map((l) => ({
    url: `${SITE_URL}/listing/${l.id}`,
    lastModified: l.updatedAt,
    changeFrequency: "daily",
    priority: 0.8
  }));

  return [...staticRoutes, ...listingRoutes];
}
