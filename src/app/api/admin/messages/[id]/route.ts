import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { isCurrentUserAdmin } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

const patchSchema = z.object({
  read: z.boolean().optional(),
  archived: z.boolean().optional()
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await isCurrentUserAdmin())) {
    return NextResponse.json({ error: "Accès réservé aux administrateurs" }, { status: 403 });
  }

  const data = patchSchema.parse(await req.json());
  const message = await prisma.contactMessage.update({ where: { id: params.id }, data });
  return NextResponse.json({ message });
}
