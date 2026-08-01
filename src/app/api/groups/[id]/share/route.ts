import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth-helpers";

export const dynamic = "force-dynamic";

const bodySchema = z.object({ listingId: z.string(), note: z.string().optional() });

async function requireMembership(groupId: string, userId: string) {
  return prisma.groupMember.findUnique({ where: { groupId_userId: { groupId, userId } } });
}

/**
 * POST /api/groups/[id]/share — partage une annonce dans le groupe.
 * Idempotent et collaboratif : si CE logement est déjà partagé dans CE
 * groupe (par toi ou par n'importe quel autre membre), ne crée pas de
 * doublon et le signale plutôt que de "dé-partager" silencieusement.
 */
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const membership = await requireMembership(params.id, userId);
  if (!membership) return NextResponse.json({ error: "Tu n'es pas membre de ce groupe" }, { status: 403 });

  const { listingId, note } = bodySchema.parse(await req.json());

  const existing = await prisma.favorite.findFirst({
    where: { groupId: params.id, listingId },
    include: { user: { select: { name: true, email: true } } }
  });

  if (existing) {
    return NextResponse.json({
      shared: false,
      alreadyShared: true,
      sharedBy: existing.user.name || existing.user.email
    });
  }

  await prisma.favorite.create({ data: { userId, listingId, groupId: params.id, note } });
  return NextResponse.json({ shared: true, alreadyShared: false });
}

/**
 * DELETE /api/groups/[id]/share — retire une annonce du groupe. N'importe
 * quel membre peut retirer un favori partagé, pas seulement celui qui
 * l'a ajouté (esprit collaboratif du groupe).
 */
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const membership = await requireMembership(params.id, userId);
  if (!membership) return NextResponse.json({ error: "Tu n'es pas membre de ce groupe" }, { status: 403 });

  const { listingId } = z.object({ listingId: z.string() }).parse(await req.json());

  await prisma.favorite.deleteMany({ where: { groupId: params.id, listingId } });
  return NextResponse.json({ removed: true });
}
