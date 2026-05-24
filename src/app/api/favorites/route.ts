import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET: List user's favorites with property/activity details
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const favorites = await prisma.favorite.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        property: {
          include: {
            rooms: {
              select: { price: true },
              orderBy: { price: "asc" },
              take: 1,
            },
          },
        },
        activity: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Transform JSON fields
    const transformedFavorites = favorites.map((fav) => {
      const result: Record<string, unknown> = {
        id: fav.id,
        type: fav.type,
        createdAt: fav.createdAt,
      };

      if (fav.property) {
        let images: string[] = [];
        let amenities: string[] = [];
        try {
          images = JSON.parse(fav.property.images);
        } catch {
          images = [];
        }
        try {
          amenities = JSON.parse(fav.property.amenities);
        } catch {
          amenities = [];
        }

        result.property = {
          id: fav.property.id,
          name: fav.property.name,
          description: fav.property.description,
          city: fav.property.city,
          country: fav.property.country,
          images,
          amenities,
          rating: fav.property.rating,
          reviewCount: fav.property.reviewCount,
          featured: fav.property.featured,
          minPrice: fav.property.rooms[0]?.price || null,
        };
      }

      if (fav.activity) {
        let images: string[] = [];
        let tags: string[] = [];
        try {
          images = JSON.parse(fav.activity.images);
        } catch {
          images = [];
        }
        try {
          tags = fav.activity.tags ? JSON.parse(fav.activity.tags) : [];
        } catch {
          tags = [];
        }

        result.activity = {
          id: fav.activity.id,
          name: fav.activity.name,
          description: fav.activity.description,
          category: fav.activity.category,
          city: fav.activity.city,
          country: fav.activity.country,
          images,
          duration: fav.activity.duration,
          price: fav.activity.price,
          rating: fav.activity.rating,
          reviewCount: fav.activity.reviewCount,
          featured: fav.activity.featured,
          tags,
        };
      }

      return result;
    });

    return NextResponse.json({ favorites: transformedFavorites });
  } catch (error) {
    console.error("Error fetching favorites:", error);
    return NextResponse.json(
      { error: "Failed to fetch favorites" },
      { status: 500 }
    );
  }
}

// POST: Add a favorite
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { type, propertyId, activityId } = body;

    if (!type || !["property", "activity"].includes(type)) {
      return NextResponse.json(
        { error: "Invalid type. Must be 'property' or 'activity'" },
        { status: 400 }
      );
    }

    if (type === "property" && !propertyId) {
      return NextResponse.json(
        { error: "propertyId is required for property favorites" },
        { status: 400 }
      );
    }

    if (type === "activity" && !activityId) {
      return NextResponse.json(
        { error: "activityId is required for activity favorites" },
        { status: 400 }
      );
    }

    // Check if already favorited
    const existing = await prisma.favorite.findFirst({
      where: {
        userId: session.user.id,
        ...(type === "property" ? { propertyId } : { activityId }),
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Already in favorites" },
        { status: 409 }
      );
    }

    const favorite = await prisma.favorite.create({
      data: {
        type,
        userId: session.user.id,
        propertyId: type === "property" ? propertyId : null,
        activityId: type === "activity" ? activityId : null,
      },
    });

    return NextResponse.json({ favorite }, { status: 201 });
  } catch (error) {
    console.error("Error adding favorite:", error);
    return NextResponse.json(
      { error: "Failed to add favorite" },
      { status: 500 }
    );
  }
}

// DELETE: Remove a favorite
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { propertyId, activityId } = body;

    if (!propertyId && !activityId) {
      return NextResponse.json(
        { error: "propertyId or activityId is required" },
        { status: 400 }
      );
    }

    const where: Record<string, unknown> = {
      userId: session.user.id,
    };

    if (propertyId) {
      where.propertyId = propertyId;
    } else {
      where.activityId = activityId;
    }

    const favorite = await prisma.favorite.findFirst({ where });

    if (!favorite) {
      return NextResponse.json(
        { error: "Favorite not found" },
        { status: 404 }
      );
    }

    await prisma.favorite.delete({
      where: { id: favorite.id },
    });

    return NextResponse.json({ message: "Favorite removed" });
  } catch (error) {
    console.error("Error removing favorite:", error);
    return NextResponse.json(
      { error: "Failed to remove favorite" },
      { status: 500 }
    );
  }
}
