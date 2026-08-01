import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { getCurrentUserId } from "@/lib/auth-helpers";

export const dynamic = "force-dynamic";

const bodySchema = z.object({ listingId: z.string(), note: z.string().optional() });

/**
 * Favoris strictement personnels (groupId toujours null). Le partage vers
 * un groupe est géré par une route dédiée : /api/groups/[id]/favorites —
 * volontairement séparée pour ne pas mélanger deux logiques différentes
 * ("mon toggle perso" vs "ressource partagée par le groupe entier").
 */
export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ favorites: [] });

  const favorites = await prisma.favorite.findMany({
    where: { userId, groupId: null },
    include: { listing: { include: { photos: true } } },
    orderBy: { createdAt: "desc" }
  });
  return NextResponse.json({ favorites });
}

export async function POST(req: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { listingId, note } = bodySchema.parse(await req.json());

  const existing = await prisma.favorite.findFirst({ where: { userId, listingId, groupId: null } });
  if (existing) {
    await prisma.favorite.delete({ where: { id: existing.id } });
    return NextResponse.json({ favorited: false });
  }

  await prisma.favorite.create({ data: { userId, listingId, note } });
  return NextResponse.json({ favorited: true });
}
