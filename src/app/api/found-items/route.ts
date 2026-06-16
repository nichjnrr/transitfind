// src/app/api/found-items/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ItemCategory, TransportMode } from "@prisma/client";

// POST /api/found-items — submit a found item report (nic: as per the tutorials i found)
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
      dateTimeFound,
      contactEmail,
    } = body;

    if (!title || !description || !category || !transportMode || !location || !dateTimeFound || !contactEmail) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const foundItem = await prisma.foundItem.create({
      data: {
        title,
        description,
        category: category as ItemCategory,
        transportMode: transportMode as TransportMode,
        location,
        dateTimeFound: new Date(dateTimeFound),
        contactEmail,
        userId: session.user.id,
      },
    });

    return NextResponse.json(foundItem, { status: 201 });
  } catch (error) {
    console.error("POST found-items error:", error);
    return NextResponse.json({ error: "Failed to submit report" }, { status: 500 });
  }
}

// GET /api/found-items — fetch all found items (with optional filters)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") as ItemCategory | null;
    const transportMode = searchParams.get("transportMode") as TransportMode | null;
    const keyword = searchParams.get("keyword");

    const foundItems = await prisma.foundItem.findMany({
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
      include: { user: { select: { name: true } } },
    });

    return NextResponse.json(foundItems);
  } catch (error) {
    console.error("GET found-items error:", error);
    return NextResponse.json({ error: "Failed to fetch items" }, { status: 500 });
  }
}
