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

    // Fetch seller's properties with their rooms and bookings
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
        reviews: true,
      },
    });

    // Calculate stats
    let totalBookings = 0;
    let totalRevenue = 0;
    let totalRating = 0;
    let ratedProperties = 0;

    const propertyStats = properties.map((property) => {
      let propertyBookings = 0;
      let propertyRevenue = 0;

      property.rooms.forEach((room) => {
        room.bookings.forEach((booking) => {
          propertyBookings++;
          if (
            booking.status !== "cancelled" &&
            booking.paymentStatus === "paid"
          ) {
            propertyRevenue += booking.totalPrice;
          }
        });
      });

      totalBookings += propertyBookings;
      totalRevenue += propertyRevenue;

      if (property.rating > 0) {
        totalRating += property.rating;
        ratedProperties++;
      }

      return {
        id: property.id,
        name: property.name,
        city: property.city,
        rating: property.rating,
        reviewCount: property.reviewCount,
        bookingsCount: propertyBookings,
        revenue: propertyRevenue,
      };
    });

    const avgRating = ratedProperties > 0 ? totalRating / ratedProperties : 0;

    return NextResponse.json({
      totalProperties: properties.length,
      totalBookings,
      totalRevenue,
      avgRating,
      properties: propertyStats,
    });
  } catch (error) {
    console.error("Error fetching seller stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch seller stats" },
      { status: 500 }
    );
  }
}
