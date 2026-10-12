import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isCurrentUserAdmin } from "@/lib/adminAuth";
import { getCurrentUserId } from "@/lib/auth-helpers";
import { isEmailInAdminList, parseRole } from "@/lib/roles";

export const dynamic = "force-dynamic";

// Liste des comptes et de leur rôle — réservé aux administrateurs.
export async function GET() {
  if (!(await isCurrentUserAdmin())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const [users, currentUserId] = await Promise.all([
    prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, createdAt: true },
      orderBy: { createdAt: "desc" },
      take: 500
    }),
    getCurrentUserId()
  ]);

  return NextResponse.json({
    currentUserId,
    users: users.map((u) => ({
      ...u,
      isEnvAdmin: isEmailInAdminList(u.email, process.env.ADMIN_EMAILS)
    }))
  });
}

// Change le rôle d'un compte — réservé aux administrateurs.
export async function PATCH(req: NextRequest) {
  if (!(await isCurrentUserAdmin())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const userId = typeof body?.userId === "string" ? body.userId : null;
  const role = parseRole(body?.role);
  if (!userId || !role) {
    return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
  }

  const currentUserId = await getCurrentUserId();
  if (userId === currentUserId) {
    return NextResponse.json({ error: "Tu ne peux pas modifier ton propre rôle." }, { status: 400 });
  }

  const target = await prisma.user.findUnique({ where: { id: userId }, select: { email: true } });
  if (!target) {
    return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
  }
  if (isEmailInAdminList(target.email, process.env.ADMIN_EMAILS)) {
    return NextResponse.json(
      { error: "Ce compte est administrateur via ADMIN_EMAILS : son rôle ne peut pas être modifié ici." },
      { status: 400 }
    );
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: { role },
    select: { id: true, role: true }
  });

  return NextResponse.json({ user });
}