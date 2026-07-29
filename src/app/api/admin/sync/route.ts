import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

const SETTINGS_ID = "default";

const updateSchema = z.object({
  enabled: z.boolean().optional(),
  frequency: z.enum(["hourly", "every6h", "daily"]).optional()
});

export async function GET() {
  const settings = await prisma.syncSettings.upsert({
    where: { id: SETTINGS_ID },
    create: { id: SETTINGS_ID },
    update: {}
  });
  return NextResponse.json({ settings });
}

export async function POST(req: NextRequest) {
  const data = updateSchema.parse(await req.json());
  const settings = await prisma.syncSettings.upsert({
    where: { id: SETTINGS_ID },
    create: { id: SETTINGS_ID, ...data },
    update: data
  });
  return NextResponse.json({ settings });
}
