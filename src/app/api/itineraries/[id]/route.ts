import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET: Get a single itinerary by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;

    const itinerary = await prisma.itinerary.findUnique({
      where: { id },
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
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!itinerary) {
      return NextResponse.json(
        { error: 'Itinerary not found' },
        { status: 404 }
      );
    }

    // Verify user owns the itinerary or is admin
    if (itinerary.userId !== session.user.id && session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    return NextResponse.json({ itinerary });
  } catch (error) {
    console.error('Error fetching itinerary:', error);
    return NextResponse.json(
      { error: 'Failed to fetch itinerary' },
      { status: 500 }
    );
  }
}

// PATCH: Update an itinerary
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { name, startDate, endDate, budget, notes, items } = body;

    // Fetch existing itinerary
    const existing = await prisma.itinerary.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Itinerary not found' },
        { status: 404 }
      );
    }

    // Verify user owns the itinerary or is admin
    if (existing.userId !== session.user.id && session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Build update data
    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (startDate !== undefined) updateData.startDate = new Date(startDate);
    if (endDate !== undefined) updateData.endDate = new Date(endDate);
    if (budget !== undefined) updateData.budget = budget ? parseFloat(budget) : null;
    if (notes !== undefined) updateData.notes = notes || null;

    // If items are provided, replace all items in a transaction
    if (items !== undefined) {
      const itinerary = await prisma.$transaction(async (tx) => {
        // Delete existing items
        await tx.itineraryItem.deleteMany({
          where: { itineraryId: id },
        });

        // Update itinerary and create new items
        return tx.itinerary.update({
          where: { id },
          data: {
            ...updateData,
            items: {
              create: items.map(
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
      });

      return NextResponse.json({ itinerary });
    }

    // Simple update without items
    const itinerary = await prisma.itinerary.update({
      where: { id },
      data: updateData,
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

    return NextResponse.json({ itinerary });
  } catch (error) {
    console.error('Error updating itinerary:', error);
    return NextResponse.json(
      { error: 'Failed to update itinerary' },
      { status: 500 }
    );
  }
}

// DELETE: Delete an itinerary
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Fetch existing itinerary
    const existing = await prisma.itinerary.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Itinerary not found' },
        { status: 404 }
      );
    }

    // Verify user owns the itinerary or is admin
    if (existing.userId !== session.user.id && session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    await prisma.itinerary.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Itinerary deleted successfully' });
  } catch (error) {
    console.error('Error deleting itinerary:', error);
    return NextResponse.json(
      { error: 'Failed to delete itinerary' },
      { status: 500 }
    );
  }
}
