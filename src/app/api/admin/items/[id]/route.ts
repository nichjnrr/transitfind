// src/app/api/admin/items/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Guard: returns the session only if the caller is a signed-in admin.
async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: "Not authenticated", status: 401 as const };
  if (session.user.role !== "ADMIN") return { error: "Not authorised", status: 403 as const };
  return { session };
}

// DELETE /api/admin/items/[id]?type=lost|found
// Admin can delete ANY report, regardless of who owns it.
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const guard = await requireAdmin();
    if ("error" in guard) {
      return NextResponse.json({ error: guard.error }, { status: guard.status });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");

    if (type === "found") {
      await prisma.foundItem.delete({ where: { id: params.id } });
    } else if (type === "lost") {
      await prisma.lostItem.delete({ where: { id: params.id } });
    } else {
      return NextResponse.json({ error: "Invalid item type" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("admin delete error:", error);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}

// PATCH /api/admin/items/[id]?type=lost|found   body: { status }
// Admin can change the status of ANY report (e.g. close it).
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const guard = await requireAdmin();
    if ("error" in guard) {
      return NextResponse.json({ error: guard.error }, { status: guard.status });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const { status } = await req.json();

    const allowed = ["OPEN", "MATCHED", "CLOSED"];
    if (!status || !allowed.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    if (type === "found") {
      await prisma.foundItem.update({ where: { id: params.id }, data: { status } });
    } else if (type === "lost") {
      await prisma.lostItem.update({ where: { id: params.id }, data: { status } });
    } else {
      return NextResponse.json({ error: "Invalid item type" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("admin patch error:", error);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}
