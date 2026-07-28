import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { geocodeAddress } from "@/lib/geocoding";

const querySchema = z.object({
  address: z.string().min(3),
  postalCode: z.string().optional(),
  city: z.string().optional()
});

/**
 * GET /api/geocode?address=...&postalCode=...&city=...
 * Utilisé par le formulaire admin pour convertir une adresse en
 * latitude/longitude sans que l'utilisateur ait à les saisir à la main.
 */
export async function GET(req: NextRequest) {
  const parsed = querySchema.safeParse({
    address: req.nextUrl.searchParams.get("address") ?? "",
    postalCode: req.nextUrl.searchParams.get("postalCode") ?? undefined,
    city: req.nextUrl.searchParams.get("city") ?? undefined
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Adresse manquante ou trop courte" }, { status: 400 });
  }

  const result = await geocodeAddress(parsed.data);

  if (!result) {
    return NextResponse.json(
      { error: "Adresse introuvable — vérifie l'orthographe ou saisis les coordonnées manuellement" },
      { status: 404 }
    );
  }

  return NextResponse.json(result);
}
