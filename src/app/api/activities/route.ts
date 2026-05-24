import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Parse query parameters
    const category = searchParams.get("category");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const search = searchParams.get("search");
    const featured = searchParams.get("featured");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Record<string, unknown> = {
      available: true,
    };

    if (category) {
      where.category = category;
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) {
        (where.price as Record<string, number>).gte = parseFloat(minPrice);
      }
      if (maxPrice) {
        (where.price as Record<string, number>).lte = parseFloat(maxPrice);
      }
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { tags: { contains: search, mode: "insensitive" } },
      ];
    }

    if (featured === "true") {
      where.featured = true;
    }

    // Get activities
    const activities = await prisma.activity.findMany({
      where,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            image: true,
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

    // Transform activities with parsed JSON fields
    const transformedActivities = activities.map((activity) => {
      let images: string[] = [];
      let tags: string[] = [];

      try {
        images = JSON.parse(activity.images);
      } catch {
        images = [];
      }

      try {
        tags = activity.tags ? JSON.parse(activity.tags) : [];
      } catch {
        tags = [];
      }

      return {
        id: activity.id,
        name: activity.name,
        description: activity.description,
        category: activity.category,
        address: activity.address,
        city: activity.city,
        country: activity.country,
        latitude: activity.latitude,
        longitude: activity.longitude,
        images,
        duration: activity.duration,
        price: activity.price,
        rating: activity.rating,
        reviewCount: activity.reviewCount,
        featured: activity.featured,
        available: activity.available,
        tags,
        createdAt: activity.createdAt,
        updatedAt: activity.updatedAt,
        owner: activity.owner,
      };
    });

    // Get total count for pagination
    const totalCount = await prisma.activity.count({ where });

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json({
      activities: transformedActivities,
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
    console.error("Error fetching activities:", error);
    return NextResponse.json(
      { error: "Failed to fetch activities" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    if (session.user.role !== "seller" && session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Only sellers and admins can create activities" },
        { status: 403 }
      );
    }

    const body = await request.json();

    const {
      name,
      description,
      category,
      address,
      city,
      country,
      latitude,
      longitude,
      images,
      duration,
      price,
      tags,
      featured,
    } = body;

    // Validate required fields
    if (!name || !description || !category || !address || !city || !duration || price === undefined) {
      return NextResponse.json(
        { error: "Missing required fields: name, description, category, address, city, duration, price" },
        { status: 400 }
      );
    }

    const activity = await prisma.activity.create({
      data: {
        name,
        description,
        category,
        address,
        city,
        country: country || "UAE",
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        images: JSON.stringify(images || []),
        duration,
        price: parseFloat(price),
        tags: tags ? JSON.stringify(tags) : null,
        featured: featured || false,
        ownerId: session.user.id,
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    // Parse JSON fields for response
    let parsedImages: string[] = [];
    let parsedTags: string[] = [];

    try {
      parsedImages = JSON.parse(activity.images);
    } catch {
      parsedImages = [];
    }

    try {
      parsedTags = activity.tags ? JSON.parse(activity.tags) : [];
    } catch {
      parsedTags = [];
    }

    return NextResponse.json(
      {
        ...activity,
        images: parsedImages,
        tags: parsedTags,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating activity:", error);
    return NextResponse.json(
      { error: "Failed to create activity" },
      { status: 500 }
    );
  }
}
