import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { isCurrentUserAdmin } from "@/lib/adminAuth";

// GET() ne prend aucun paramètre de requête — sans ceci, Next.js pourrait
// tenter de le pré-rendre au moment du build (même souci que dashboard/
// sitemap/cron : la base peut ne pas être migrée à ce moment-là).
export const dynamic = "force-dynamic";

const SETTINGS_ID = "default";

const updateSchema = z.object({
  enabled: z.boolean().optional(),
  frequency: z.enum(["hourly", "every6h", "daily"]).optional()
});

export async function GET() {
  if (!(await isCurrentUserAdmin())) {
    return NextResponse.json({ error: "Accès réservé aux administrateurs" }, { status: 403 });
  }
  const settings = await prisma.syncSettings.upsert({
    where: { id: SETTINGS_ID },
    create: { id: SETTINGS_ID },
    update: {}
  });
  return NextResponse.json({ settings });
}

export async function POST(req: NextRequest) {
  if (!(await isCurrentUserAdmin())) {
    return NextResponse.json({ error: "Accès réservé aux administrateurs" }, { status: 403 });
  }
  const data = updateSchema.parse(await req.json());
  const settings = await prisma.syncSettings.upsert({
    where: { id: SETTINGS_ID },
    create: { id: SETTINGS_ID, ...data },
    update: data
  });
  return NextResponse.json({ settings });
}
