import { NextResponse } from "next/server";
import { isCurrentUserAdmin } from "@/lib/admin-guard";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ isAdmin: await isCurrentUserAdmin() });
}
