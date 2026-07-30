import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth-helpers";

export const dynamic = "force-dynamic";

const joinSchema = z.object({ inviteCode: z.string().min(1) });

/** POST /api/groups/join — rejoint un groupe existant via son code d'invitation. */
export async function POST(req: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { inviteCode } = joinSchema.parse(await req.json());

  const group = await prisma.group.findUnique({ where: { inviteCode } });
  if (!group) return NextResponse.json({ error: "Code d'invitation invalide" }, { status: 404 });

  await prisma.groupMember.upsert({
    where: { groupId_userId: { groupId: group.id, userId } },
    create: { groupId: group.id, userId },
    update: {}
  });

  return NextResponse.json({ group });
}
