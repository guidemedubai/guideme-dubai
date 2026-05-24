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

    if (session.user.role !== "seller" && session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Fetch seller's properties with rooms and bookings
    const properties = await prisma.property.findMany({
      where: {
        ownerId: session.user.id,
      },
      include: {
        rooms: {
          include: {
            bookings: true,
          },
        },
      },
    });

    // Collect all bookings across all properties
    const allBookings: {
      checkIn: Date;
      checkOut: Date;
      totalPrice: number;
      status: string;
      paymentStatus: string;
      createdAt: Date;
      propertyId: string;
    }[] = [];

    properties.forEach((property) => {
      property.rooms.forEach((room) => {
        room.bookings.forEach((booking) => {
          allBookings.push({
            checkIn: booking.checkIn,
            checkOut: booking.checkOut,
            totalPrice: booking.totalPrice,
            status: booking.status,
            paymentStatus: booking.paymentStatus,
            createdAt: booking.createdAt,
            propertyId: property.id,
          });
        });
      });
    });

    // Calculate monthly revenue for the last 12 months
    const now = new Date();
    const monthlyRevenue: { month: string; revenue: number }[] = [];
    const bookingTrends: { month: string; bookings: number }[] = [];

    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      const monthLabel = date.toLocaleDateString("en-US", {
        month: "short",
        year: "2-digit",
      });

      let monthRevenue = 0;
      let monthBookings = 0;

      allBookings.forEach((booking) => {
        const bookingDate = new Date(booking.createdAt);
        if (bookingDate >= date && bookingDate <= monthEnd) {
          monthBookings++;
          if (
            booking.status !== "cancelled" &&
            booking.paymentStatus === "paid"
          ) {
            monthRevenue += booking.totalPrice;
          }
        }
      });

      monthlyRevenue.push({ month: monthLabel, revenue: monthRevenue });
      bookingTrends.push({ month: monthLabel, bookings: monthBookings });
    }

    // Calculate occupancy rates per property (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const occupancyRates = properties.map((property) => {
      const totalRooms = property.rooms.length;
      const totalRoomDays = totalRooms * 30;

      let bookedDays = 0;
      property.rooms.forEach((room) => {
        room.bookings.forEach((booking) => {
          if (
            booking.status !== "cancelled" &&
            booking.checkIn <= now &&
            booking.checkOut >= thirtyDaysAgo
          ) {
            const start =
              booking.checkIn > thirtyDaysAgo
                ? booking.checkIn
                : thirtyDaysAgo;
            const end = booking.checkOut < now ? booking.checkOut : now;
            const days = Math.ceil(
              (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
            );
            bookedDays += Math.max(0, days);
          }
        });
      });

      const occupancyRate =
        totalRoomDays > 0 ? (bookedDays / totalRoomDays) * 100 : 0;

      return {
        propertyId: property.id,
        propertyName: property.name,
        occupancyRate: Math.min(occupancyRate, 100),
      };
    });

    // Top performing properties by revenue
    const propertyRevenueMap: Record<
      string,
      { id: string; name: string; revenue: number; bookingsCount: number }
    > = {};

    properties.forEach((property) => {
      propertyRevenueMap[property.id] = {
        id: property.id,
        name: property.name,
        revenue: 0,
        bookingsCount: 0,
      };
    });

    allBookings.forEach((booking) => {
      if (propertyRevenueMap[booking.propertyId]) {
        propertyRevenueMap[booking.propertyId].bookingsCount++;
        if (
          booking.status !== "cancelled" &&
          booking.paymentStatus === "paid"
        ) {
          propertyRevenueMap[booking.propertyId].revenue +=
            booking.totalPrice;
        }
      }
    });

    const topProperties = Object.values(propertyRevenueMap)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    return NextResponse.json({
      monthlyRevenue,
      bookingTrends,
      occupancyRates,
      topProperties,
    });
  } catch (error) {
    console.error("Error fetching seller analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
