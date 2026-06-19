// src/app/api/items/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ItemCategory, TransportMode } from "@prisma/client";

// GET /api/items — fetch all lost items (with optional filters)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") as ItemCategory | null;
    const transportMode = searchParams.get("transportMode") as TransportMode | null;
    const keyword = searchParams.get("keyword");

    const items = await prisma.lostItem.findMany({
      where: {
        ...(category && { category }),
        ...(transportMode && { transportMode }),
        ...(keyword && {
          OR: [
            { title: { contains: keyword, mode: "insensitive" } },
            { description: { contains: keyword, mode: "insensitive" } },
            { location: { contains: keyword, mode: "insensitive" } },
          ],
        }),
      },
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true } },
      },
    });

    return NextResponse.json(items);
  } catch (error) {
    console.error("GET items error:", error);
    return NextResponse.json({ error: "Failed to fetch items" }, { status: 500 });
  }
}

// POST /api/items — submit a lost item report
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await req.json();
    const {
      title,
      description,
      category,
      transportMode,
      location,
      dateTimeOfLoss,
      imageUrl,
      contactEmail,
    } = body;

    if (
      !title?.trim() ||
      !description?.trim() ||
      !category ||
      !transportMode ||
      !location?.trim() ||
      !dateTimeOfLoss ||
      !contactEmail?.trim()
    ) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const lossDate = new Date(dateTimeOfLoss);
    if (lossDate > new Date()) {
      return NextResponse.json({ error: "Date of loss cannot be in the future" }, { status: 400 });
    }

    const item = await prisma.lostItem.create({
      data: {
        title,
        description,
        category,
        transportMode,
        location,
        dateTimeOfLoss: new Date(dateTimeOfLoss),
        imageUrl: imageUrl || null,
        contactEmail,
        userId: session.user.id,
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error("POST items error:", error);
    return NextResponse.json({ error: "Failed to submit report" }, { status: 500 });
  }
}
