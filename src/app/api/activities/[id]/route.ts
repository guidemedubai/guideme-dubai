import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const activity = await prisma.activity.findUnique({
      where: { id },
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

    if (!activity) {
      return NextResponse.json(
        { error: "Activity not found" },
        { status: 404 }
      );
    }

    // Parse JSON fields
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

    return NextResponse.json({
      ...activity,
      images,
      tags,
    });
  } catch (error) {
    console.error("Error fetching activity:", error);
    return NextResponse.json(
      { error: "Failed to fetch activity" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Check if activity exists and user is authorized
    const existingActivity = await prisma.activity.findUnique({
      where: { id },
    });

    if (!existingActivity) {
      return NextResponse.json(
        { error: "Activity not found" },
        { status: 404 }
      );
    }

    if (
      existingActivity.ownerId !== session.user.id &&
      session.user.role !== "admin"
    ) {
      return NextResponse.json(
        { error: "Not authorized to update this activity" },
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
      available,
    } = body;

    // Build update data with only provided fields
    const updateData: Record<string, unknown> = {};

    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (category !== undefined) updateData.category = category;
    if (address !== undefined) updateData.address = address;
    if (city !== undefined) updateData.city = city;
    if (country !== undefined) updateData.country = country;
    if (latitude !== undefined) updateData.latitude = latitude ? parseFloat(latitude) : null;
    if (longitude !== undefined) updateData.longitude = longitude ? parseFloat(longitude) : null;
    if (images !== undefined) updateData.images = JSON.stringify(images);
    if (duration !== undefined) updateData.duration = duration;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (tags !== undefined) updateData.tags = tags ? JSON.stringify(tags) : null;
    if (featured !== undefined) updateData.featured = featured;
    if (available !== undefined) updateData.available = available;

    const activity = await prisma.activity.update({
      where: { id },
      data: updateData,
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

    return NextResponse.json({
      ...activity,
      images: parsedImages,
      tags: parsedTags,
    });
  } catch (error) {
    console.error("Error updating activity:", error);
    return NextResponse.json(
      { error: "Failed to update activity" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Check if activity exists and user is authorized
    const existingActivity = await prisma.activity.findUnique({
      where: { id },
    });

    if (!existingActivity) {
      return NextResponse.json(
        { error: "Activity not found" },
        { status: 404 }
      );
    }

    if (
      existingActivity.ownerId !== session.user.id &&
      session.user.role !== "admin"
    ) {
      return NextResponse.json(
        { error: "Not authorized to delete this activity" },
        { status: 403 }
      );
    }

    await prisma.activity.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Activity deleted successfully" });
  } catch (error) {
    console.error("Error deleting activity:", error);
    return NextResponse.json(
      { error: "Failed to delete activity" },
      { status: 500 }
    );
  }
}
