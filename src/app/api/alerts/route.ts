import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth-helpers";

export const dynamic = "force-dynamic";

const alertSchema = z.object({
  name: z.string().min(1),
  criteria: z.object({
    maxTotalRentEuros: z.number(),
    maxPricePerPersonEuros: z.number(),
    numberOfRooms: z.array(z.number()),
    cities: z.array(z.string()),
    groupSize: z.number().optional()
  }),
  channels: z.array(z.enum(["email", "browser"])).min(1)
});

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ alerts: [] });
  const alerts = await prisma.alert.findMany({ where: { userId }, orderBy: { createdAt: "desc" } });
  return NextResponse.json({ alerts });
}

export async function POST(req: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const data = alertSchema.parse(await req.json());
  const alert = await prisma.alert.create({
    data: { userId, name: data.name, criteria: data.criteria, channels: data.channels }
  });
  return NextResponse.json({ alert });
}
