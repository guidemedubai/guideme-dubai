import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET: List user's itineraries
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const itineraries = await prisma.itinerary.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        items: {
          include: {
            activity: true,
            property: true,
          },
          orderBy: [
            { day: 'asc' },
            { order: 'asc' },
          ],
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ itineraries });
  } catch (error) {
    console.error('Error fetching itineraries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch itineraries' },
      { status: 500 }
    );
  }
}

// POST: Create a new itinerary with items
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, startDate, endDate, budget, notes, items } = body;

    // Validate required fields
    if (!name || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Name, start date, and end date are required' },
        { status: 400 }
      );
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) {
      return NextResponse.json(
        { error: 'End date must be after start date' },
        { status: 400 }
      );
    }

    // Create the itinerary with items in a transaction
    const itinerary = await prisma.itinerary.create({
      data: {
        name,
        startDate: start,
        endDate: end,
        budget: budget ? parseFloat(budget) : null,
        notes: notes || null,
        userId: session.user.id,
        items: {
          create: (items || []).map(
            (item: {
              day: number;
              timeSlot: string;
              notes?: string;
              order: number;
              activityId?: string;
              propertyId?: string;
            }) => ({
              day: item.day,
              timeSlot: item.timeSlot || null,
              notes: item.notes || null,
              order: item.order,
              activityId: item.activityId || null,
              propertyId: item.propertyId || null,
            })
          ),
        },
      },
      include: {
        items: {
          include: {
            activity: true,
            property: true,
          },
          orderBy: [
            { day: 'asc' },
            { order: 'asc' },
          ],
        },
      },
    });

    return NextResponse.json({ itinerary }, { status: 201 });
  } catch (error) {
    console.error('Error creating itinerary:', error);
    return NextResponse.json(
      { error: 'Failed to create itinerary' },
      { status: 500 }
    );
  }
}
