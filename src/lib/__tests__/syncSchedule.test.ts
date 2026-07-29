import { describe, it, expect } from "vitest";
import { isSyncDue, minutesUntilDue } from "../syncSchedule";

describe("isSyncDue", () => {
  it("est toujours due si aucune synchronisation n'a jamais eu lieu", () => {
    expect(isSyncDue("daily", null)).toBe(true);
  });

  it("n'est pas due si l'intervalle horaire n'est pas écoulé", () => {
    const now = new Date("2026-07-29T12:00:00Z");
    const lastRun = new Date("2026-07-29T11:30:00Z"); // il y a 30 min
    expect(isSyncDue("hourly", lastRun, now)).toBe(false);
  });

  it("est due si l'intervalle horaire est écoulé", () => {
    const now = new Date("2026-07-29T12:00:00Z");
    const lastRun = new Date("2026-07-29T10:00:00Z"); // il y a 2h
    expect(isSyncDue("hourly", lastRun, now)).toBe(true);
  });

  it("respecte l'intervalle de 6h", () => {
    const now = new Date("2026-07-29T12:00:00Z");
    const lastRun = new Date("2026-07-29T07:00:00Z"); // il y a 5h
    expect(isSyncDue("every6h", lastRun, now)).toBe(false);
  });

  it("respecte l'intervalle quotidien", () => {
    const now = new Date("2026-07-29T12:00:00Z");
    const lastRun = new Date("2026-07-28T12:00:00Z"); // il y a exactement 24h
    expect(isSyncDue("daily", lastRun, now)).toBe(true);
  });
});

describe("minutesUntilDue", () => {
  it("retourne 0 si déjà due", () => {
    const now = new Date("2026-07-29T12:00:00Z");
    const lastRun = new Date("2026-07-29T10:00:00Z");
    expect(minutesUntilDue("hourly", lastRun, now)).toBe(0);
  });

  it("calcule les minutes restantes correctement", () => {
    const now = new Date("2026-07-29T12:00:00Z");
    const lastRun = new Date("2026-07-29T11:45:00Z"); // il y a 15 min, interval 60 min
    expect(minutesUntilDue("hourly", lastRun, now)).toBe(45);
  });

  it("retourne 0 si jamais synchronisé", () => {
    expect(minutesUntilDue("daily", null)).toBe(0);
  });
});
