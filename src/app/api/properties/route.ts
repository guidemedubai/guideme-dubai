import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Parse query parameters
    const city = searchParams.get("city");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const guests = searchParams.get("guests");
    const amenities = searchParams.get("amenities");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const skip = (page - 1) * limit;

    // Build property where clause
    const propertyWhere: Record<string, unknown> = {};

    if (city) {
      propertyWhere.city = {
        contains: city,
        mode: "insensitive",
      };
    }

    // Build room filters for price and capacity
    const roomWhere: Record<string, unknown> = {};

    if (minPrice || maxPrice) {
      roomWhere.price = {};
      if (minPrice) {
        (roomWhere.price as Record<string, number>).gte = parseFloat(minPrice);
      }
      if (maxPrice) {
        (roomWhere.price as Record<string, number>).lte = parseFloat(maxPrice);
      }
    }

    if (guests) {
      roomWhere.capacity = {
        gte: parseInt(guests),
      };
    }

    // Parse amenities filter
    const amenitiesList = amenities ? amenities.split(",").map(a => a.trim()) : [];

    // Get properties with room aggregations
    const properties = await prisma.property.findMany({
      where: {
        ...propertyWhere,
        // Only include properties that have matching rooms
        ...(Object.keys(roomWhere).length > 0 && {
          rooms: {
            some: roomWhere,
          },
        }),
      },
      include: {
        rooms: {
          select: {
            id: true,
            price: true,
            capacity: true,
          },
          where: Object.keys(roomWhere).length > 0 ? roomWhere : undefined,
        },
        _count: {
          select: {
            rooms: true,
            reviews: true,
          },
        },
      },
      orderBy: [
        { featured: "desc" },
        { rating: "desc" },
      ],
      skip,
      take: limit,
    });

    // Filter by amenities in application layer (JSON field)
    let filteredProperties = properties;
    if (amenitiesList.length > 0) {
      filteredProperties = properties.filter((property) => {
        try {
          const propertyAmenities: string[] = JSON.parse(property.amenities);
          return amenitiesList.every((amenity) =>
            propertyAmenities.some(
              (pa) => pa.toLowerCase() === amenity.toLowerCase()
            )
          );
        } catch {
          return false;
        }
      });
    }

    // Transform properties with computed fields
    const transformedProperties = filteredProperties.map((property) => {
      const minRoomPrice = property.rooms.length > 0
        ? Math.min(...property.rooms.map((r) => r.price))
        : null;

      let images: string[] = [];
      let propertyAmenities: string[] = [];

      try {
        images = JSON.parse(property.images);
      } catch {
        images = [];
      }

      try {
        propertyAmenities = JSON.parse(property.amenities);
      } catch {
        propertyAmenities = [];
      }

      return {
        id: property.id,
        name: property.name,
        description: property.description,
        address: property.address,
        city: property.city,
        country: property.country,
        latitude: property.latitude,
        longitude: property.longitude,
        images,
        amenities: propertyAmenities,
        rating: property.rating,
        reviewCount: property.reviewCount,
        featured: property.featured,
        roomCount: property._count.rooms,
        minPrice: minRoomPrice,
        createdAt: property.createdAt,
        updatedAt: property.updatedAt,
      };
    });

    // Get total count for pagination
    const totalCount = await prisma.property.count({
      where: {
        ...propertyWhere,
        ...(Object.keys(roomWhere).length > 0 && {
          rooms: {
            some: roomWhere,
          },
        }),
      },
    });

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json({
      properties: transformedProperties,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage,
        hasPrevPage,
      },
    });
  } catch (error) {
    console.error("Error fetching properties:", error);
    return NextResponse.json(
      { error: "Failed to fetch properties" },
      { status: 500 }
    );
  }
}
