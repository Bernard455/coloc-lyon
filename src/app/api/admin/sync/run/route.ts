import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { runIngestion } from "@/scrapers/runIngestion";

const SETTINGS_ID = "default";

/**
 * POST /api/admin/sync/run — déclenché par le bouton "Lancer une
 * synchronisation maintenant" dans /admin/synchronisation. Réutilise
 * exactement le même pipeline que `npm run ingest` et le cron automatique.
 */
export async function POST() {
  await prisma.syncSettings.upsert({
    where: { id: SETTINGS_ID },
    create: { id: SETTINGS_ID, lastRunStatus: "running", lastRunAt: new Date() },
    update: { lastRunStatus: "running", lastRunAt: new Date() }
  });

  try {
    const summary = await runIngestion();
    await prisma.syncSettings.update({
      where: { id: SETTINGS_ID },
      data: { lastRunStatus: "success", lastRunAt: new Date() }
    });
    return NextResponse.json({ summary });
  } catch (err) {
    await prisma.syncSettings.update({
      where: { id: SETTINGS_ID },
      data: { lastRunStatus: "failed", lastRunAt: new Date() }
    });
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
