// src/app/api/items/[id]/confirm-match/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST /api/items/[id]/confirm-match
// The lost reporter claims a found item. This creates a PENDING match request.
// Nothing is finalised until the found reporter approves it.
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const lostItemId = params.id;
    const body = await req.json();
    const { foundItemId, score } = body;

    if (!foundItemId) {
      return NextResponse.json({ error: "Missing foundItemId" }, { status: 400 });
    }

    const lostItem = await prisma.lostItem.findUnique({
      where: { id: lostItemId },
      include: { user: { select: { name: true } } },
    });
    const foundItem = await prisma.foundItem.findUnique({
      where: { id: foundItemId },
    });

    if (!lostItem || !foundItem) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    // Only the owner of the lost report may claim a match for it.
    if (lostItem.userId !== session.user.id) {
      return NextResponse.json({ error: "Not authorised" }, { status: 403 });
    }

    // You cannot claim your own found item as a match for your own lost item.
    if (foundItem.userId === session.user.id) {
      return NextResponse.json(
        { error: "You cannot claim your own found report" },
        { status: 400 }
      );
    }

    const match = await prisma.match.create({
      data: {
        lostItemId,
        foundItemId,
        score: typeof score === "number" ? score : 0,
        confirmedBy: session.user.id,
        status: "PENDING",
      },
    });

    return NextResponse.json(match, { status: 201 });
  } catch (error: any) {
    if (error?.code === "P2002") {
      return NextResponse.json(
        { error: "You have already claimed this item" },
        { status: 409 }
      );
    }
    console.error("confirm-match error:", error);
    return NextResponse.json({ error: "Failed to submit claim" }, { status: 500 });
  }
}
