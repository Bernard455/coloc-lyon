import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isCurrentUserAdmin } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

export async function GET() {
  const isAdmin = await isCurrentUserAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const content = await prisma.siteContent.findUnique({ where: { id: "default" } });
  return NextResponse.json({
    content: content ?? {
      ownerName: "",
      ownerAddress: "",
      ownerEmail: "",
      ownerPhone: "",
      tagline: "Compare et partage les logements trouvés pour ton groupe",
      brandName: "Comparo"
    }
  });
}

export async function POST(req: NextRequest) {
  const isAdmin = await isCurrentUserAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const body = await req.json();
  const { ownerName, ownerAddress, ownerEmail, ownerPhone, tagline, brandName } = body;

  const content = await prisma.siteContent.upsert({
    where: { id: "default" },
    update: { ownerName, ownerAddress, ownerEmail, ownerPhone, tagline, brandName },
    create: { id: "default", ownerName, ownerAddress, ownerEmail, ownerPhone, tagline, brandName }
  });

  return NextResponse.json({ content });
}