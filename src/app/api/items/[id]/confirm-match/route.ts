// src/app/api/items/[id]/confirm-match/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { matchConfirmedEmail } from "@/lib/emails/matchConfirmed";

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

    // Send email notification to the lost item owner
    try {
      const template = matchConfirmedEmail({
        recipientName: lostItem.user?.name ?? "there",
        lostItemTitle: lostItem.title,
        foundItemTitle: foundItem.title,
        matchPercentage: match.score,
        contactEmail: foundItem.contactEmail,
        itemUrl: `${process.env.NEXT_PUBLIC_APP_URL}/items/${lostItem.id}`,
      });

      await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/email/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: lostItem.contactEmail,
          ...template,
        }),
      });

      console.log(`[email] Sent match-confirmed to ${lostItem.contactEmail}`);
    } catch (emailErr) {
      // Don't fail the whole request if email fails
      console.error("Email send failed:", emailErr);
    }

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
