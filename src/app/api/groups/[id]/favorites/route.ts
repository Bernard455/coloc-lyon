import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth-helpers";

export const dynamic = "force-dynamic";

const shareSchema = z.object({ listingId: z.string(), note: z.string().optional() });
const unshareSchema = z.object({ listingId: z.string() });

async function requireMembership(groupId: string, userId: string) {
  return prisma.groupMember.findUnique({ where: { groupId_userId: { groupId, userId } } });
}

/**
 * POST /api/groups/[id]/favorites — partage un logement dans le groupe.
 * Idempotent au niveau du GROUPE (pas de l'utilisateur) : si ce logement a
 * déjà été partagé par n'importe quel membre, on ne crée pas de doublon et
 * on renvoie alreadyShared: true plutôt que de "toggler" quoi que ce soit.
 */
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const membership = await requireMembership(params.id, userId);
  if (!membership) return NextResponse.json({ error: "Tu n'es pas membre de ce groupe" }, { status: 403 });

  const { listingId, note } = shareSchema.parse(await req.json());

  const existing = await prisma.favorite.findFirst({ where: { groupId: params.id, listingId } });
  if (existing) {
    return NextResponse.json({ alreadyShared: true, addedBy: existing.userId });
  }

  await prisma.favorite.create({ data: { userId, listingId, groupId: params.id, note } });
  return NextResponse.json({ alreadyShared: false, shared: true });
}

/**
 * DELETE /api/groups/[id]/favorites — retire un logement du groupe.
 * N'importe quel membre peut retirer, pas seulement celui qui l'a ajouté
 * (c'est une ressource du groupe, pas une possession individuelle).
 */
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const membership = await requireMembership(params.id, userId);
  if (!membership) return NextResponse.json({ error: "Tu n'es pas membre de ce groupe" }, { status: 403 });

  const { listingId } = unshareSchema.parse(await req.json());

  await prisma.favorite.deleteMany({ where: { groupId: params.id, listingId } });
  return NextResponse.json({ removed: true });
}
