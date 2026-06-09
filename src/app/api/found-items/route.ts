// src/app/api/found-items/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ItemCategory, TransportMode } from '@prisma/client';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
  }

  const body = await req.json();
  const { title, description, category, transportMode, location, dateTimeFound, contactEmail } = body;

  if (!title || !description || !category || !transportMode || !location || !dateTimeFound || !contactEmail) {
    return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
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
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const keyword = searchParams.get('keyword') || '';
  const category = searchParams.get('category') || '';
  const transportMode = searchParams.get('transportMode') || '';

  const foundItems = await prisma.foundItem.findMany({
    where: {
      ...(keyword && {
        OR: [
          { title: { contains: keyword, mode: 'insensitive' } },
          { description: { contains: keyword, mode: 'insensitive' } },
          { location: { contains: keyword, mode: 'insensitive' } },
        ],
      }),
      ...(category && { category: category as ItemCategory }),
      ...(transportMode && { transportMode: transportMode as TransportMode }),
    },
    orderBy: { createdAt: 'desc' },
    include: { user: { select: { name: true } } },
  });

  return NextResponse.json(foundItems);
}