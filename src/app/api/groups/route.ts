import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth-helpers";

export const dynamic = "force-dynamic";

const createSchema = z.object({ name: z.string().min(1).max(80) });

/** GET /api/groups — liste les groupes dont l'utilisateur connecté est membre. */
export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ groups: [] });

  const memberships = await prisma.groupMember.findMany({
    where: { userId },
    include: {
      group: {
        include: {
          _count: { select: { members: true, favorites: true } }
        }
      }
    },
    orderBy: { joinedAt: "desc" }
  });

  return NextResponse.json({ groups: memberships.map((m) => m.group) });
}

/** POST /api/groups — crée un nouveau groupe, avec l'utilisateur comme propriétaire + premier membre. */
export async function POST(req: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { name } = createSchema.parse(await req.json());

  const group = await prisma.group.create({
    data: {
      name,
      ownerId: userId,
      members: { create: { userId } }
    }
  });

  return NextResponse.json({ group });
}
