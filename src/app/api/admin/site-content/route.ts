import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isCurrentUserAdmin } from "@/lib/adminAuth";
import { getSiteContent } from "@/lib/siteContent";

export const dynamic = "force-dynamic";

export async function GET() {
  const isAdmin = await isCurrentUserAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const content = await getSiteContent();
  return NextResponse.json({ content });
}

export async function POST(req: NextRequest) {
  const isAdmin = await isCurrentUserAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const body = await req.json();
  const { ownerName, ownerAddress, ownerEmail, ownerPhone, tagline, brandName, faqItems, legalUpdatedAt } = body;

  const content = await prisma.siteContent.upsert({
    where: { id: "default" },
    update: { ownerName, ownerAddress, ownerEmail, ownerPhone, tagline, brandName, faqItems, legalUpdatedAt },
    create: { id: "default", ownerName, ownerAddress, ownerEmail, ownerPhone, tagline, brandName, faqItems, legalUpdatedAt }
  });

  return NextResponse.json({ content });
}