import { NextResponse } from "next/server";
import { getSiteContent } from "@/lib/siteContent";

export const dynamic = "force-dynamic";

// Route publique en lecture seule (pas de vérification admin) : sert la
// tagline d'accueil et autres textes publics du site aux pages client.
export async function GET() {
  const content = await getSiteContent();
  return NextResponse.json({ content });
}