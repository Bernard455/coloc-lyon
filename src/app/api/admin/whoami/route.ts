import { NextResponse } from "next/server";
import { getCurrentRole } from "@/lib/adminAuth";
import { isAdminRole, isStaffRole } from "@/lib/roles";

export const dynamic = "force-dynamic";

export async function GET() {
  const role = await getCurrentRole();
  return NextResponse.json({ role, isAdmin: isAdminRole(role), isStaff: isStaffRole(role) });
}