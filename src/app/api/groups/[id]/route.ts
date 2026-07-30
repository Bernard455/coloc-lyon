import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth-helpers";

export const dynamic = "force-dynamic";

/** GET /api/groups/[id] — détails d'un groupe : membres + favoris partagés. Vérifie l'appartenance. */
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const membership = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId: params.id, userId } }
  });
  if (!membership) return NextResponse.json({ error: "Tu n'es pas membre de ce groupe" }, { status: 403 });

  const group = await prisma.group.findUnique({
    where: { id: params.id },
    include: {
      members: { include: { user: { select: { id: true, name: true, email: true, image: true } } } },
      favorites: {
        include: {
          listing: { include: { photos: { orderBy: { position: "asc" } } } },
          user: { select: { id: true, name: true, email: true } }
        },
        orderBy: { createdAt: "desc" }
      }
    }
  });

  if (!group) return NextResponse.json({ error: "Groupe introuvable" }, { status: 404 });

  return NextResponse.json({ group });
}
