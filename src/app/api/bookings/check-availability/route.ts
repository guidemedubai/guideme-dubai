import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// POST: Check room availability
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { roomId, checkIn, checkOut } = body;

    // Validate required fields
    if (!roomId || !checkIn || !checkOut) {
      return NextResponse.json(
        { error: 'Missing required fields: roomId, checkIn, checkOut' },
        { status: 400 }
      );
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    // Validate dates
    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date format' },
        { status: 400 }
      );
    }

    if (checkInDate >= checkOutDate) {
      return NextResponse.json(
        { error: 'Check-out date must be after check-in date' },
        { status: 400 }
      );
    }

    // Fetch room to verify it exists
    const room = await prisma.room.findUnique({
      where: { id: roomId },
    });

    if (!room) {
      return NextResponse.json(
        { error: 'Room not found' },
        { status: 404 }
      );
    }

    if (!room.available) {
      return NextResponse.json({
        available: false,
        reason: 'Room is currently not available for booking',
      });
    }

    // Check for overlapping confirmed or pending bookings
    const overlappingBooking = await prisma.booking.findFirst({
      where: {
        roomId,
        status: {
          in: ['pending', 'confirmed'],
        },
        OR: [
          // New booking starts during an existing booking
          {
            AND: [
              { checkIn: { lte: checkInDate } },
              { checkOut: { gt: checkInDate } },
            ],
          },
          // New booking ends during an existing booking
          {
            AND: [
              { checkIn: { lt: checkOutDate } },
              { checkOut: { gte: checkOutDate } },
            ],
          },
          // New booking completely contains an existing booking
          {
            AND: [
              { checkIn: { gte: checkInDate } },
              { checkOut: { lte: checkOutDate } },
            ],
          },
        ],
      },
      select: {
        id: true,
        checkIn: true,
        checkOut: true,
      },
    });

    if (overlappingBooking) {
      return NextResponse.json({
        available: false,
        reason: 'Room is already booked for the selected dates',
        conflictingDates: {
          checkIn: overlappingBooking.checkIn,
          checkOut: overlappingBooking.checkOut,
        },
      });
    }

    // Calculate price information
    const nights = Math.ceil(
      (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const totalPrice = nights * room.price;

    return NextResponse.json({
      available: true,
      pricePerNight: room.price,
      nights,
      totalPrice,
    });
  } catch (error) {
    console.error('Error checking availability:', error);
    return NextResponse.json(
      { error: 'Failed to check availability' },
      { status: 500 }
    );
  }
}
