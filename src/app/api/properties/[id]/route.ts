import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Fetch property with all related data
    const property = await prisma.property.findUnique({
      where: { id },
      include: {
        rooms: {
          orderBy: { price: "asc" },
        },
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        owner: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    if (!property) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      );
    }

    // Calculate average rating from reviews
    const averageRating =
      property.reviews.length > 0
        ? property.reviews.reduce((sum, review) => sum + review.rating, 0) /
          property.reviews.length
        : 0;

    // Parse JSON fields
    let images: string[] = [];
    let amenities: string[] = [];

    try {
      images = JSON.parse(property.images);
    } catch {
      images = [];
    }

    try {
      amenities = JSON.parse(property.amenities);
    } catch {
      amenities = [];
    }

    // Transform rooms with parsed JSON fields
    const transformedRooms = property.rooms.map((room) => {
      let roomImages: string[] = [];
      let roomAmenities: string[] = [];

      try {
        roomImages = JSON.parse(room.images);
      } catch {
        roomImages = [];
      }

      try {
        roomAmenities = JSON.parse(room.amenities);
      } catch {
        roomAmenities = [];
      }

      return {
        id: room.id,
        name: room.name,
        description: room.description,
        type: room.type,
        capacity: room.capacity,
        price: room.price,
        images: roomImages,
        amenities: roomAmenities,
        available: room.available,
      };
    });

    // Transform reviews with user info
    const transformedReviews = property.reviews.map((review) => ({
      id: review.id,
      rating: review.rating,
      title: review.title,
      comment: review.comment,
      createdAt: review.createdAt,
      user: {
        id: review.user.id,
        name: review.user.name,
        image: review.user.image,
      },
    }));

    // Get min and max price from rooms
    const prices = property.rooms.map((r) => r.price);
    const minPrice = prices.length > 0 ? Math.min(...prices) : null;
    const maxPrice = prices.length > 0 ? Math.max(...prices) : null;

    const transformedProperty = {
      id: property.id,
      name: property.name,
      description: property.description,
      address: property.address,
      city: property.city,
      country: property.country,
      latitude: property.latitude,
      longitude: property.longitude,
      images,
      amenities,
      rating: property.rating,
      reviewCount: property.reviewCount,
      featured: property.featured,
      createdAt: property.createdAt,
      updatedAt: property.updatedAt,
      owner: property.owner,
      rooms: transformedRooms,
      reviews: transformedReviews,
      calculatedRating: Math.round(averageRating * 10) / 10,
      minPrice,
      maxPrice,
      roomCount: property.rooms.length,
    };

    return NextResponse.json(transformedProperty);
  } catch (error) {
    console.error("Error fetching property:", error);
    return NextResponse.json(
      { error: "Failed to fetch property" },
      { status: 500 }
    );
  }
}
