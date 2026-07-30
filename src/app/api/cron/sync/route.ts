import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { runIngestion } from "@/scrapers/runIngestion";
import { isSyncDue, minutesUntilDue, type SyncFrequency } from "@/lib/syncSchedule";

// Cette route interroge/écrit en base à chaque appel (par le cron ou
// manuellement) — jamais de rendu statique au moment du build, pour la
// même raison que /dashboard et /sitemap.xml.
export const dynamic = "force-dynamic";

const SETTINGS_ID = "default";

/**
 * GET /api/cron/sync — appelé par le scheduler (Vercel Cron ou GitHub
 * Actions, voir DEPLOIEMENT.md). Ne relance une synchronisation que si la
 * fréquence configurée dans /admin/synchronisation est atteinte, pour
 * qu'un déclenchement plus fréquent que nécessaire (ex: cron horaire mais
 * fréquence réglée sur "1 fois par jour") ne fasse rien la plupart du temps.
 *
 * Protégé par CRON_SECRET si défini (recommandé) : Vercel Cron envoie
 * automatiquement `Authorization: Bearer <CRON_SECRET>` quand cette
 * variable d'environnement est configurée sur le projet.
 */
export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
  }

  const settings = await prisma.syncSettings.upsert({
    where: { id: SETTINGS_ID },
    create: { id: SETTINGS_ID },
    update: {}
  });

  if (!settings.enabled) {
    return NextResponse.json({ skipped: true, reason: "Synchronisation désactivée" });
  }

  const intervalDue = isSyncDue(settings.frequency as SyncFrequency, settings.lastRunAt);

  if (!intervalDue) {
    return NextResponse.json({
      skipped: true,
      reason: `Prochaine synchronisation dans ${minutesUntilDue(settings.frequency as SyncFrequency, settings.lastRunAt)} min`
    });
  }

  await prisma.syncSettings.update({
    where: { id: SETTINGS_ID },
    data: { lastRunStatus: "running", lastRunAt: new Date() }
  });

  try {
    const summary = await runIngestion();
    await prisma.syncSettings.update({
      where: { id: SETTINGS_ID },
      data: { lastRunStatus: "success", lastRunAt: new Date() }
    });
    return NextResponse.json({ skipped: false, summary });
  } catch (err) {
    await prisma.syncSettings.update({
      where: { id: SETTINGS_ID },
      data: { lastRunStatus: "failed", lastRunAt: new Date() }
    });
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
