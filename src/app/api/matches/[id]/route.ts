// src/app/api/matches/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PATCH /api/matches/[id]  body: { decision: "APPROVE" | "REJECT" }
// The found reporter responds to a pending claim on their found item.
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { decision } = await req.json();
    if (decision !== "APPROVE" && decision !== "REJECT") {
      return NextResponse.json({ error: "Invalid decision" }, { status: 400 });
    }

    // Load the match together with its found item so we can check ownership.
    const match = await prisma.match.findUnique({
      where: { id: params.id },
      include: {
        foundItem: {
          include: { user: { select: { name: true } } },
        },
      },
    });

    if (!match) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 });
    }

    // Only the owner of the FOUND item may approve or reject the claim.
    if (match.foundItem.userId !== session.user.id) {
      return NextResponse.json({ error: "Not authorised" }, { status: 403 });
    }

    if (match.status !== "PENDING") {
      return NextResponse.json(
        { error: "This claim has already been handled" },
        { status: 409 }
      );
    }

    if (decision === "REJECT") {
      const updated = await prisma.match.update({
        where: { id: match.id },
        data: { status: "REJECTED" },
      });
      return NextResponse.json(updated);
    }

    // APPROVE: finalise the match and mark both items MATCHED, all or nothing.
    const [updated] = await prisma.$transaction([
      prisma.match.update({ where: { id: match.id }, data: { status: "APPROVED" } }),
      prisma.lostItem.update({ where: { id: match.lostItemId }, data: { status: "MATCHED" } }),
      prisma.foundItem.update({ where: { id: match.foundItemId }, data: { status: "MATCHED" } }),
    ]);

    return NextResponse.json(updated);
  } catch (error) {
    console.error("match decision error:", error);
    return NextResponse.json({ error: "Failed to update match" }, { status: 500 });
  }
}
