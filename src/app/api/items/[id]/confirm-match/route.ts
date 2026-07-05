// src/app/api/items/[id]/confirm-match/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST /api/items/[id]/confirm-match
// Confirms that a found item matches this lost item:
// records a Match and moves both items to MATCHED.
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

    // Load both items.
    const lostItem = await prisma.lostItem.findUnique({ where: { id: lostItemId } });
    const foundItem = await prisma.foundItem.findUnique({ where: { id: foundItemId } });

    if (!lostItem || !foundItem) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    // Only the owner of the lost report may confirm its match.
    if (lostItem.userId !== session.user.id) {
      return NextResponse.json({ error: "Not authorised" }, { status: 403 });
    }

    // Do the three writes together so we never end up half done, abit sketch i dunno if it works
    const [match] = await prisma.$transaction([
      prisma.match.create({
        data: {
          lostItemId,
          foundItemId,
          score: typeof score === "number" ? score : 0,
          confirmedBy: session.user.id,
        },
      }),
      prisma.lostItem.update({ where: { id: lostItemId }, data: { status: "MATCHED" } }),
      prisma.foundItem.update({ where: { id: foundItemId }, data: { status: "MATCHED" } }),
    ]);

    return NextResponse.json(match, { status: 201 });
  } catch (error: any) {
    // A duplicate confirmation trips the unique constraint; treat it gently.
    if (error?.code === "P2002") {
      return NextResponse.json({ error: "This match is already confirmed" }, { status: 409 });
    }
    console.error("confirm-match error:", error);
    return NextResponse.json({ error: "Failed to confirm match" }, { status: 500 });
  }
}
