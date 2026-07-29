/**
 * Logique pure de planification — extraite de l'API route cron pour être
 * testable unitairement sans base de données.
 */

export type SyncFrequency = "hourly" | "every6h" | "daily";

export const FREQUENCY_MS: Record<SyncFrequency, number> = {
  hourly: 60 * 60 * 1000,
  every6h: 6 * 60 * 60 * 1000,
  daily: 24 * 60 * 60 * 1000
};

/**
 * Détermine si une nouvelle synchronisation doit être lancée, en fonction
 * de la fréquence configurée et de la dernière exécution.
 */
export function isSyncDue(frequency: SyncFrequency, lastRunAt: Date | null, now: Date = new Date()): boolean {
  if (!lastRunAt) return true;
  const intervalMs = FREQUENCY_MS[frequency] ?? FREQUENCY_MS.hourly;
  return now.getTime() - lastRunAt.getTime() >= intervalMs;
}

/** Minutes restantes avant la prochaine synchronisation due (0 si déjà due). */
export function minutesUntilDue(frequency: SyncFrequency, lastRunAt: Date | null, now: Date = new Date()): number {
  if (!lastRunAt) return 0;
  const intervalMs = FREQUENCY_MS[frequency] ?? FREQUENCY_MS.hourly;
  const remaining = intervalMs - (now.getTime() - lastRunAt.getTime());
  return remaining > 0 ? Math.round(remaining / 60000) : 0;
}
