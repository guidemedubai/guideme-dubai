import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

  const [
    totalBookings,
    totalRevenue,
    totalUsers,
    totalProperties,
    thisMonthBookings,
    lastMonthBookings,
    thisMonthRevenue,
    lastMonthRevenue,
    thisMonthUsers,
    lastMonthUsers,
    thisMonthProperties,
    lastMonthProperties,
    recentBookings,
    topPropertiesRaw,
  ] = await Promise.all([
    prisma.booking.count(),
    prisma.booking.aggregate({ _sum: { totalPrice: true } }),
    prisma.user.count(),
    prisma.property.count(),
    prisma.booking.count({ where: { createdAt: { gte: thisMonthStart } } }),
    prisma.booking.count({ where: { createdAt: { gte: lastMonthStart, lte: lastMonthEnd } } }),
    prisma.booking.aggregate({ _sum: { totalPrice: true }, where: { createdAt: { gte: thisMonthStart } } }),
    prisma.booking.aggregate({ _sum: { totalPrice: true }, where: { createdAt: { gte: lastMonthStart, lte: lastMonthEnd } } }),
    prisma.user.count({ where: { createdAt: { gte: thisMonthStart } } }),
    prisma.user.count({ where: { createdAt: { gte: lastMonthStart, lte: lastMonthEnd } } }),
    prisma.property.count({ where: { createdAt: { gte: thisMonthStart } } }),
    prisma.property.count({ where: { createdAt: { gte: lastMonthStart, lte: lastMonthEnd } } }),
    prisma.booking.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true } },
        room: { include: { property: { select: { name: true } } } },
      },
    }),
    prisma.property.findMany({
      take: 5,
      include: {
        rooms: {
          include: {
            bookings: { select: { totalPrice: true } },
          },
        },
        reviews: { select: { rating: true } },
      },
    }),
  ]);

  function calcChange(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  }

  const months = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      start: d,
      end: new Date(d.getFullYear(), d.getMonth() + 1, 0),
      label: d.toLocaleString("en-US", { month: "short" }),
    });
  }

  const monthlyBookings = await Promise.all(
    months.map((m) =>
      prisma.booking.aggregate({
        _sum: { totalPrice: true },
        where: { createdAt: { gte: m.start, lte: m.end } },
      })
    )
  );

  const monthlyRevenue = months.map((m, i) => ({
    month: m.label,
    revenue: monthlyBookings[i]._sum.totalPrice || 0,
  }));

  const topProperties = topPropertiesRaw
    .map((p) => {
      const allBookings = p.rooms.flatMap((r) => r.bookings);
      const revenue = allBookings.reduce((sum, b) => sum + b.totalPrice, 0);
      const avgRating =
        p.reviews.length > 0
          ? Math.round((p.reviews.reduce((s, r) => s + r.rating, 0) / p.reviews.length) * 10) / 10
          : 0;
      return {
        id: p.id,
        name: p.name,
        city: p.city,
        bookingsCount: allBookings.length,
        revenue,
        rating: avgRating,
      };
    })
    .sort((a, b) => b.bookingsCount - a.bookingsCount)
    .slice(0, 5);

  return NextResponse.json({
    totalBookings,
    totalRevenue: totalRevenue._sum.totalPrice || 0,
    totalUsers,
    totalProperties,
    bookingChange: calcChange(thisMonthBookings, lastMonthBookings),
    revenueChange: calcChange(
      thisMonthRevenue._sum.totalPrice || 0,
      lastMonthRevenue._sum.totalPrice || 0
    ),
    userChange: calcChange(thisMonthUsers, lastMonthUsers),
    propertyChange: calcChange(thisMonthProperties, lastMonthProperties),
    monthlyRevenue,
    recentBookings: recentBookings.map((b) => ({
      id: b.id,
      guestName: b.user.name,
      propertyName: b.room.property.name,
      roomName: b.room.name,
      checkIn: b.checkIn.toISOString(),
      checkOut: b.checkOut.toISOString(),
      totalPrice: b.totalPrice,
      status: b.status,
      paymentStatus: b.paymentStatus,
    })),
    topProperties,
  });
}
