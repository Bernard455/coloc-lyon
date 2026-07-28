import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const listings = await prisma.listing.findMany({
    where: { status: "ACTIVE" },
    select: { id: true, updatedAt: true },
    take: 5000
  });

  const staticRoutes: MetadataRoute.Sitemap = ["", "/favoris", "/comparateur", "/dashboard"].map((route) => ({
    url: `https://coloc-lyon.fr${route}`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: route === "" ? 1 : 0.5
  }));

  const listingRoutes: MetadataRoute.Sitemap = listings.map((l) => ({
    url: `https://coloc-lyon.fr/listing/${l.id}`,
    lastModified: l.updatedAt,
    changeFrequency: "daily",
    priority: 0.8
  }));

  return [...staticRoutes, ...listingRoutes];
}
