import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "agent" && session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Fetch agent's own bookings (acting as client bookings for now)
    const bookings = await prisma.booking.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        user: {
          select: {
            name: true,
          },
        },
        room: {
          include: {
            property: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Calculate stats
    const totalClients = bookings.length;
    const activeBookings = bookings.filter(
      (b) => b.status === "pending" || b.status === "confirmed"
    ).length;

    // Commission: 10% of paid booking revenue
    const totalPaidRevenue = bookings
      .filter((b) => b.status !== "cancelled" && b.paymentStatus === "paid")
      .reduce((sum, b) => sum + b.totalPrice, 0);
    const commissionEarned = totalPaidRevenue * 0.1;

    const formattedBookings = bookings.map((booking) => ({
      id: booking.id,
      guestName: booking.user.name,
      propertyName: booking.room.property.name,
      roomName: booking.room.name,
      checkIn: booking.checkIn.toISOString(),
      checkOut: booking.checkOut.toISOString(),
      totalPrice: booking.totalPrice,
      status: booking.status,
      paymentStatus: booking.paymentStatus,
    }));

    return NextResponse.json({
      totalClients,
      commissionEarned,
      activeBookings,
      bookings: formattedBookings,
    });
  } catch (error) {
    console.error("Error fetching agent stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch agent stats" },
      { status: 500 }
    );
  }
}
