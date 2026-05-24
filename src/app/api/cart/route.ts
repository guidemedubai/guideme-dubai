import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET: List cart items with room/activity/property details
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const cartItems = await prisma.cartItem.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        room: {
          include: {
            property: true,
          },
        },
        activity: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Transform JSON fields
    const transformedItems = cartItems.map((item) => {
      const result: Record<string, unknown> = {
        id: item.id,
        type: item.type,
        quantity: item.quantity,
        checkIn: item.checkIn,
        checkOut: item.checkOut,
        guests: item.guests,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      };

      if (item.room) {
        let roomImages: string[] = [];
        let roomAmenities: string[] = [];
        let propertyImages: string[] = [];
        try {
          roomImages = JSON.parse(item.room.images);
        } catch {
          roomImages = [];
        }
        try {
          roomAmenities = JSON.parse(item.room.amenities);
        } catch {
          roomAmenities = [];
        }
        try {
          propertyImages = JSON.parse(item.room.property.images);
        } catch {
          propertyImages = [];
        }

        result.room = {
          id: item.room.id,
          name: item.room.name,
          description: item.room.description,
          type: item.room.type,
          capacity: item.room.capacity,
          price: item.room.price,
          images: roomImages,
          amenities: roomAmenities,
          property: {
            id: item.room.property.id,
            name: item.room.property.name,
            city: item.room.property.city,
            country: item.room.property.country,
            images: propertyImages,
          },
        };
      }

      if (item.activity) {
        let activityImages: string[] = [];
        let tags: string[] = [];
        try {
          activityImages = JSON.parse(item.activity.images);
        } catch {
          activityImages = [];
        }
        try {
          tags = item.activity.tags ? JSON.parse(item.activity.tags) : [];
        } catch {
          tags = [];
        }

        result.activity = {
          id: item.activity.id,
          name: item.activity.name,
          description: item.activity.description,
          category: item.activity.category,
          city: item.activity.city,
          country: item.activity.country,
          images: activityImages,
          duration: item.activity.duration,
          price: item.activity.price,
          rating: item.activity.rating,
          tags,
        };
      }

      return result;
    });

    return NextResponse.json({ cartItems: transformedItems });
  } catch (error) {
    console.error("Error fetching cart:", error);
    return NextResponse.json(
      { error: "Failed to fetch cart" },
      { status: 500 }
    );
  }
}

// POST: Add item to cart
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
    const { type, roomId, activityId, checkIn, checkOut, guests, quantity } = body;

    if (!type || !["room", "activity"].includes(type)) {
      return NextResponse.json(
        { error: "Invalid type. Must be 'room' or 'activity'" },
        { status: 400 }
      );
    }

    if (type === "room" && !roomId) {
      return NextResponse.json(
        { error: "roomId is required for room items" },
        { status: 400 }
      );
    }

    if (type === "activity" && !activityId) {
      return NextResponse.json(
        { error: "activityId is required for activity items" },
        { status: 400 }
      );
    }

    // Validate room exists
    if (type === "room") {
      const room = await prisma.room.findUnique({ where: { id: roomId } });
      if (!room) {
        return NextResponse.json(
          { error: "Room not found" },
          { status: 404 }
        );
      }
      if (!room.available) {
        return NextResponse.json(
          { error: "Room is not available" },
          { status: 400 }
        );
      }
    }

    // Validate activity exists
    if (type === "activity") {
      const activity = await prisma.activity.findUnique({ where: { id: activityId } });
      if (!activity) {
        return NextResponse.json(
          { error: "Activity not found" },
          { status: 404 }
        );
      }
      if (!activity.available) {
        return NextResponse.json(
          { error: "Activity is not available" },
          { status: 400 }
        );
      }
    }

    // Check for duplicate
    const existingItem = await prisma.cartItem.findFirst({
      where: {
        userId: session.user.id,
        ...(type === "room" ? { roomId } : { activityId }),
      },
    });

    if (existingItem) {
      // Update quantity instead of creating duplicate
      const updated = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: existingItem.quantity + (quantity || 1),
          ...(checkIn ? { checkIn: new Date(checkIn) } : {}),
          ...(checkOut ? { checkOut: new Date(checkOut) } : {}),
          ...(guests ? { guests } : {}),
        },
        include: {
          room: { include: { property: true } },
          activity: true,
        },
      });

      return NextResponse.json({ cartItem: updated });
    }

    const cartItem = await prisma.cartItem.create({
      data: {
        type,
        quantity: quantity || 1,
        checkIn: checkIn ? new Date(checkIn) : null,
        checkOut: checkOut ? new Date(checkOut) : null,
        guests: guests || null,
        userId: session.user.id,
        roomId: type === "room" ? roomId : null,
        activityId: type === "activity" ? activityId : null,
      },
      include: {
        room: { include: { property: true } },
        activity: true,
      },
    });

    return NextResponse.json({ cartItem }, { status: 201 });
  } catch (error) {
    console.error("Error adding to cart:", error);
    return NextResponse.json(
      { error: "Failed to add to cart" },
      { status: 500 }
    );
  }
}

// DELETE: Remove item from cart by id
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
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Cart item id is required" },
        { status: 400 }
      );
    }

    const cartItem = await prisma.cartItem.findUnique({
      where: { id },
    });

    if (!cartItem) {
      return NextResponse.json(
        { error: "Cart item not found" },
        { status: 404 }
      );
    }

    if (cartItem.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    await prisma.cartItem.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Item removed from cart" });
  } catch (error) {
    console.error("Error removing from cart:", error);
    return NextResponse.json(
      { error: "Failed to remove from cart" },
      { status: 500 }
    );
  }
}
