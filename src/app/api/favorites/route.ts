import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { getCurrentUserId } from "@/lib/auth-helpers";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  listingId: z.string(),
  note: z.string().optional(),
  // Absent = favori personnel (comportement historique inchangé).
  // Renseigné = partage ce favori dans le groupe donné (voir /groupes/[id]).
  groupId: z.string().optional()
});

/** GET /api/favorites — favoris strictement personnels (groupId absent), comme avant. */
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

  const { listingId, note, groupId } = bodySchema.parse(await req.json());

  if (groupId) {
    const membership = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId } }
    });
    if (!membership) return NextResponse.json({ error: "Tu n'es pas membre de ce groupe" }, { status: 403 });
  }

  const existing = await prisma.favorite.findFirst({
    where: { userId, listingId, groupId: groupId ?? null }
  });
  if (existing) {
    await prisma.favorite.delete({ where: { id: existing.id } });
    return NextResponse.json({ favorited: false });
  }

  await prisma.favorite.create({ data: { userId, listingId, note, groupId } });
  return NextResponse.json({ favorited: true });
}
