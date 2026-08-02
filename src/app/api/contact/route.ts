import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { sendContactNotification } from "@/lib/email";

export const dynamic = "force-dynamic";

const contactSchema = z.object({
  firstName: z.string().min(1).max(80),
  lastName: z.string().min(1).max(80),
  email: z.string().email(),
  subject: z.string().min(1),
  message: z.string().min(10).max(5000)
});

/**
 * POST /api/contact — enregistre le message en base. Pas d'envoi d'email
 * réel tant qu'un provider (Resend, SMTP…) n'est pas configuré — voir
 * RESEND_API_KEY dans .env.example. En attendant, consulter les messages
 * directement en base (Prisma Studio : npm run db:studio) ou via une future
 * boîte de réception admin.
 */
export async function POST(req: NextRequest) {
  const data = contactSchema.parse(await req.json());
  const created = await prisma.contactMessage.create({ data });
  await sendContactNotification(data);
  return NextResponse.json({ id: created.id }, { status: 201 });
}
