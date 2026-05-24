import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  MapPin,
  Clock,
  Star,
  Heart,
  ShoppingCart,
  Tag,
  ArrowLeft,
  Share2,
} from "lucide-react";

const categoryColors: Record<string, string> = {
  adventure: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  cultural: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  dining: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  nightlife: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
  shopping: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
  wellness: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  "water-sports": "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200",
  desert: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
};

const categoryLabels: Record<string, string> = {
  adventure: "Adventure",
  cultural: "Cultural",
  dining: "Dining",
  nightlife: "Nightlife",
  shopping: "Shopping",
  wellness: "Wellness",
  "water-sports": "Water Sports",
  desert: "Desert",
};

async function getActivity(id: string) {
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

  if (!activity) return null;

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
    ...activity,
    images,
    tags,
  };
}

export default async function ActivityDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const activity = await getActivity(id);

  if (!activity) {
    notFound();
  }

  const categoryColor = categoryColors[activity.category] || "bg-gray-100 text-gray-800";
  const categoryLabel = categoryLabels[activity.category] || activity.category;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/activities" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Activities
          </Link>
        </Button>
      </div>

      {/* Image Gallery */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="relative aspect-[4/3] rounded-lg overflow-hidden">
          <Image
            src={activity.images[0] || "/placeholder-activity.jpg"}
            alt={activity.name}
            fill
            className="object-cover"
            priority
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          {activity.images.slice(1, 5).map((image, index) => (
            <div
              key={index}
              className="relative aspect-[4/3] rounded-lg overflow-hidden"
            >
              <Image
                src={image}
                alt={`${activity.name} ${index + 2}`}
                fill
                className="object-cover"
              />
            </div>
          ))}
          {/* Fill empty slots with placeholder */}
          {activity.images.length < 5 &&
            Array.from({ length: Math.max(0, 4 - (activity.images.length - 1)) }).map(
              (_, index) => (
                <div
                  key={`placeholder-${index}`}
                  className="relative aspect-[4/3] rounded-lg overflow-hidden bg-muted flex items-center justify-center"
                >
                  <span className="text-muted-foreground text-sm">No image</span>
                </div>
              )
            )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Header */}
          <div>
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Badge className={categoryColor} variant="secondary">
                    {categoryLabel}
                  </Badge>
                  {activity.featured && (
                    <Badge className="bg-primary text-primary-foreground">
                      Featured
                    </Badge>
                  )}
                </div>
                <h1 className="text-3xl font-bold mb-2">{activity.name}</h1>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>
                    {activity.address}, {activity.city}, {activity.country}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                <span className="text-xl font-semibold">
                  {activity.rating.toFixed(1)}
                </span>
                <span className="text-muted-foreground">
                  ({activity.reviewCount} {activity.reviewCount === 1 ? "review" : "reviews"})
                </span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Description */}
          <div>
            <h2 className="text-xl font-semibold mb-4">About this activity</h2>
            <p className="text-muted-foreground leading-relaxed">
              {activity.description}
            </p>
          </div>

          <Separator />

          {/* Details */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Activity Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-4 rounded-lg border">
                <Clock className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Duration</p>
                  <p className="font-medium">{activity.duration}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-lg border">
                <Tag className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Price per person</p>
                  <p className="font-medium">USD {activity.price.toLocaleString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-lg border">
                <MapPin className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="font-medium">{activity.city}, {activity.country}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-lg border">
                <Star className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Rating</p>
                  <p className="font-medium">
                    {activity.rating.toFixed(1)} / 5.0 ({activity.reviewCount} reviews)
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Tags */}
          {activity.tags.length > 0 && (
            <>
              <Separator />
              <div>
                <h2 className="text-xl font-semibold mb-4">Tags</h2>
                <div className="flex flex-wrap gap-2">
                  {activity.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Host Info */}
          {activity.owner && (
            <>
              <Separator />
              <div>
                <h2 className="text-xl font-semibold mb-4">Hosted by</h2>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    {activity.owner.image ? (
                      <Image
                        src={activity.owner.image}
                        alt={activity.owner.name || "Host"}
                        width={48}
                        height={48}
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-lg font-medium">
                        {activity.owner.name?.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{activity.owner.name}</p>
                    <p className="text-sm text-muted-foreground">Activity Provider</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Sidebar - Booking Card */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Book This Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Price per person</p>
                  <p className="text-3xl font-bold">
                    USD {activity.price.toLocaleString()}
                  </p>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Duration: {activity.duration}</span>
                </div>

                <Separator />

                <div className="space-y-2">
                  <p className="text-sm font-medium">Quick facts:</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>
                      • Category:{" "}
                      <span className="capitalize">
                        {activity.category.replace("-", " ")}
                      </span>
                    </li>
                    <li>• Location: {activity.city}</li>
                    <li>• {activity.reviewCount} guest reviews</li>
                    {activity.tags.length > 0 && (
                      <li>• {activity.tags.length} tags</li>
                    )}
                  </ul>
                </div>

                <div className="space-y-3 pt-2">
                  <Button className="w-full gap-2" size="lg">
                    <ShoppingCart className="h-4 w-4" />
                    Add to Cart
                  </Button>
                  <Button variant="outline" className="w-full gap-2" size="lg">
                    <Heart className="h-4 w-4" />
                    Add to Favorites
                  </Button>
                  <Button variant="ghost" className="w-full gap-2" size="sm">
                    <Share2 className="h-4 w-4" />
                    Share Activity
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
