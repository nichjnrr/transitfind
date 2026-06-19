// src/app/api/items/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ItemStatus } from "@prisma/client";

// DELETE /api/items/[id] — delete one of the user's own lost reports
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const item = await prisma.lostItem.findUnique({ where: { id: params.id } });
    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }
    if (item.userId !== session.user.id) {
      return NextResponse.json({ error: "Not authorised" }, { status: 403 });
    }

    await prisma.lostItem.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE item error:", error);
    return NextResponse.json({ error: "Failed to delete report" }, { status: 500 });
  }
}

// PATCH /api/items/[id] — update status (e.g. mark as CLOSED)
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const item = await prisma.lostItem.findUnique({ where: { id: params.id } });
    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }
    if (item.userId !== session.user.id) {
      return NextResponse.json({ error: "Not authorised" }, { status: 403 });
    }

    const body = await req.json();
    const { status, title, description, category, transportMode, location, dateTimeOfLoss, contactEmail } = body;

    // status validity check 
    const allowed: ItemStatus[] = ["OPEN", "MATCHED", "CLOSED"];
    if (status && !allowed.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    // to help users with prefilling da item fields
    const data: Record<string, unknown> = {};
    if (status !== undefined) data.status = status;
    if (title !== undefined) data.title = title;
    if (description !== undefined) data.description = description;
    if (category !== undefined) data.category = category;
    if (transportMode !== undefined) data.transportMode = transportMode;
    if (location !== undefined) data.location = location;
    if (dateTimeOfLoss !== undefined) data.dateTimeOfLoss = new Date(dateTimeOfLoss);
    if (contactEmail !== undefined) data.contactEmail = contactEmail;

    const updated = await prisma.lostItem.update({
      where: { id: params.id },
      data,
    });
    
    return NextResponse.json(updated);
  } catch (error) {
    console.error("PATCH item error:", error);
    return NextResponse.json({ error: "Failed to update report" }, { status: 500 });
  }
}
