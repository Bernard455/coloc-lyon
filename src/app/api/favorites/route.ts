import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
// NOTE: dans une vraie exécution, remplacer par la session Auth.js (getServerSession)
// plutôt qu'un userId placeholder.
import { getCurrentUserId } from "@/lib/auth-helpers";

const bodySchema = z.object({ listingId: z.string(), note: z.string().optional() });

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ favorites: [] });

  const favorites = await prisma.favorite.findMany({
    where: { userId },
    include: { listing: { include: { photos: true } } },
    orderBy: { createdAt: "desc" }
  });
  return NextResponse.json({ favorites });
}

export async function POST(req: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { listingId, note } = bodySchema.parse(await req.json());

  const existing = await prisma.favorite.findUnique({ where: { userId_listingId: { userId, listingId } } });
  if (existing) {
    await prisma.favorite.delete({ where: { id: existing.id } });
    return NextResponse.json({ favorited: false });
  }

  await prisma.favorite.create({ data: { userId, listingId, note } });
  return NextResponse.json({ favorited: true });
}
