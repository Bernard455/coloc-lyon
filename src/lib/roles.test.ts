import { describe, it, expect } from "vitest";
import { isAdminRole, isEmailInAdminList, isStaffRole, parseRole } from "./roles";

describe("parseRole", () => {
  it("accepte les trois rôles valides", () => {
    expect(parseRole("USER")).toBe("USER");
    expect(parseRole("MODERATOR")).toBe("MODERATOR");
    expect(parseRole("ADMIN")).toBe("ADMIN");
  });

  it("rejette toute valeur inconnue ou non textuelle", () => {
    expect(parseRole("SUPERADMIN")).toBeNull();
    expect(parseRole(undefined)).toBeNull();
    expect(parseRole(3)).toBeNull();
  });
});

describe("isAdminRole / isStaffRole", () => {
  it("seul ADMIN est admin", () => {
    expect(isAdminRole("ADMIN")).toBe(true);
    expect(isAdminRole("MODERATOR")).toBe(false);
    expect(isAdminRole("USER")).toBe(false);
  });

  it("ADMIN et MODERATOR font partie de l'équipe, pas USER", () => {
    expect(isStaffRole("ADMIN")).toBe(true);
    expect(isStaffRole("MODERATOR")).toBe(true);
    expect(isStaffRole("USER")).toBe(false);
  });
});

describe("isEmailInAdminList", () => {
  it("ignore la casse et les espaces", () => {
    expect(isEmailInAdminList("  Bernard@Example.com ", "bernard@example.com")).toBe(true);
  });

  it("gère plusieurs emails séparés par des virgules", () => {
    expect(isEmailInAdminList("b@x.fr", "a@x.fr, b@x.fr ,c@x.fr")).toBe(true);
    expect(isEmailInAdminList("d@x.fr", "a@x.fr, b@x.fr ,c@x.fr")).toBe(false);
  });

  it("retourne false si la liste est vide ou absente", () => {
    expect(isEmailInAdminList("a@x.fr", "")).toBe(false);
    expect(isEmailInAdminList("a@x.fr", undefined)).toBe(false);
  });
});