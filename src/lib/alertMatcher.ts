/**
 * Vérifie les nouvelles annonces contre les alertes actives et déclenche
 * les notifications. Appelé depuis scrapers/run.ts après chaque ingestion.
 */
import { prisma } from "@/lib/db";

interface AlertCriteria {
  maxTotalRentEuros: number;
  maxPricePerPersonEuros: number;
  numberOfRooms: number[];
  cities: string[];
  groupSize?: number; // absent sur les alertes créées avant cette fonctionnalité — repli sur 4
}

export async function matchNewListingsToAlerts(newListingIds: string[]) {
  if (newListingIds.length === 0) return;

  const [alerts, listings] = await Promise.all([
    prisma.alert.findMany({ where: { active: true } }),
    prisma.listing.findMany({ where: { id: { in: newListingIds } } })
  ]);

  for (const alert of alerts) {
    const criteria = alert.criteria as unknown as AlertCriteria;
    const groupSize = criteria.groupSize ?? 4;
    const matches = listings.filter((l) => {
      const pricePerPerson = l.totalRent / 100 / Math.max(groupSize, 1);
      return (
        l.totalRent / 100 <= criteria.maxTotalRentEuros &&
        pricePerPerson <= criteria.maxPricePerPersonEuros &&
        criteria.numberOfRooms.includes(l.numberOfRooms) &&
        criteria.cities.includes(l.city)
      );
    });

    if (matches.length === 0) continue;

    console.log(`[alerts] "${alert.name}" — ${matches.length} nouvelle(s) annonce(s) correspondante(s)`);

    // Email : brancher un provider (Resend, SMTP…) ici.
    // if (alert.channels.includes("email")) await sendAlertEmail(alert, matches);

    // Notification navigateur : nécessite Web Push (service worker + clés VAPID) côté client.
    // if (alert.channels.includes("browser")) await sendBrowserPush(alert, matches);

    await prisma.alert.update({ where: { id: alert.id }, data: { lastTriggeredAt: new Date() } });
  }
}
