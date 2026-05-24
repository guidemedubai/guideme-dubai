import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const q = searchParams.get("q") || "";
    const type = searchParams.get("type") || "all";
    const area = searchParams.get("area") || "";
    const category = searchParams.get("category") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const skip = (page - 1) * limit;

    let properties: unknown[] = [];
    let activities: unknown[] = [];
    let propertyCount = 0;
    let activityCount = 0;

    // Search properties
    if (type === "all" || type === "property") {
      const propertyWhere: Record<string, unknown> = {};

      if (q) {
        propertyWhere.OR = [
          { name: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
          { city: { contains: q, mode: "insensitive" } },
        ];
      }

      if (area) {
        propertyWhere.city = {
          contains: area,
          mode: "insensitive",
        };
      }

      const rawProperties = await prisma.property.findMany({
        where: propertyWhere,
        include: {
          rooms: {
            select: { price: true },
            orderBy: { price: "asc" },
            take: 1,
          },
          _count: {
            select: { rooms: true },
          },
        },
        orderBy: [{ featured: "desc" }, { rating: "desc" }],
        skip: type === "property" ? skip : 0,
        take: type === "property" ? limit : 6,
      });

      properties = rawProperties.map((p) => {
        let images: string[] = [];
        let amenities: string[] = [];

        try {
          images = JSON.parse(p.images);
        } catch {
          images = [];
        }

        try {
          amenities = JSON.parse(p.amenities);
        } catch {
          amenities = [];
        }

        return {
          id: p.id,
          type: "property" as const,
          name: p.name,
          description: p.description,
          city: p.city,
          country: p.country,
          images,
          amenities,
          rating: p.rating,
          reviewCount: p.reviewCount,
          featured: p.featured,
          roomCount: p._count.rooms,
          minPrice: p.rooms[0]?.price || null,
          createdAt: p.createdAt,
        };
      });

      propertyCount = await prisma.property.count({ where: propertyWhere });
    }

    // Search activities
    if (type === "all" || type === "activity") {
      const activityWhere: Record<string, unknown> = {
        available: true,
      };

      if (q) {
        activityWhere.OR = [
          { name: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
          { category: { contains: q, mode: "insensitive" } },
        ];
      }

      if (area) {
        activityWhere.city = {
          contains: area,
          mode: "insensitive",
        };
      }

      if (category && category !== "hotels" && category !== "activities") {
        activityWhere.category = {
          contains: category,
          mode: "insensitive",
        };
      }

      const rawActivities = await prisma.activity.findMany({
        where: activityWhere,
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
        orderBy: [{ featured: "desc" }, { rating: "desc" }],
        skip: type === "activity" ? skip : 0,
        take: type === "activity" ? limit : 6,
      });

      activities = rawActivities.map((a) => {
        let images: string[] = [];
        let tags: string[] = [];

        try {
          images = JSON.parse(a.images);
        } catch {
          images = [];
        }

        try {
          tags = a.tags ? JSON.parse(a.tags) : [];
        } catch {
          tags = [];
        }

        return {
          id: a.id,
          type: "activity" as const,
          name: a.name,
          description: a.description,
          category: a.category,
          city: a.city,
          country: a.country,
          images,
          duration: a.duration,
          price: a.price,
          rating: a.rating,
          reviewCount: a.reviewCount,
          featured: a.featured,
          tags,
          owner: a.owner,
          createdAt: a.createdAt,
        };
      });

      activityCount = await prisma.activity.count({ where: activityWhere });
    }

    const total = propertyCount + activityCount;
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      properties,
      activities,
      total,
      pagination: {
        page,
        limit,
        totalCount: total,
        totalPages,
        propertyCount,
        activityCount,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error("Error in search:", error);
    return NextResponse.json(
      { error: "Failed to perform search" },
      { status: 500 }
    );
  }
}
