"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin, Clock, Star } from "lucide-react";

import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface ActivityCardProps {
  activity: {
    id: string;
    name: string;
    description?: string;
    category: string;
    city: string;
    country: string;
    images: string[];
    duration: string;
    price: number;
    rating: number;
    reviewCount: number;
    featured: boolean;
  };
  className?: string;
}

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

export function ActivityCard({ activity, className }: ActivityCardProps) {
  const mainImage = activity.images[0] || "/placeholder-activity.jpg";
  const categoryColor = categoryColors[activity.category] || "bg-gray-100 text-gray-800";
  const categoryLabel = categoryLabels[activity.category] || activity.category;

  return (
    <Link href={`/activities/${activity.id}`}>
      <Card
        className={cn(
          "group overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer",
          className
        )}
      >
        {/* Image Container */}
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image
            src={mainImage}
            alt={activity.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

          {/* Featured Badge */}
          {activity.featured && (
            <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground">
              Featured
            </Badge>
          )}

          {/* Category Badge */}
          <Badge
            className={cn("absolute top-3 right-3", categoryColor)}
            variant="secondary"
          >
            {categoryLabel}
          </Badge>

          {/* Activity Info Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
            <h3 className="text-lg font-semibold line-clamp-1">{activity.name}</h3>
            <div className="flex items-center gap-1 text-sm text-white/90 mt-1">
              <MapPin className="h-3.5 w-3.5" />
              <span>
                {activity.city}, {activity.country}
              </span>
            </div>
          </div>
        </div>

        {/* Card Content */}
        <CardContent className="p-4">
          {/* Rating and Duration */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium">{activity.rating.toFixed(1)}</span>
              </div>
              <span className="text-sm text-muted-foreground">
                ({activity.reviewCount} {activity.reviewCount === 1 ? "review" : "reviews"})
              </span>
            </div>
            <Badge variant="outline" className="gap-1">
              <Clock className="h-3 w-3" />
              {activity.duration}
            </Badge>
          </div>

          {/* Price and Action */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">From</p>
              <p className="text-lg font-bold text-primary">
                USD {activity.price.toLocaleString()}
                <span className="text-sm font-normal text-muted-foreground">
                  /person
                </span>
              </p>
            </div>
            <Button size="sm">View Details</Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export function ActivityCardSkeleton({ className }: { className?: string }) {
  return (
    <Card className={cn("overflow-hidden border-0 shadow-md", className)}>
      <div className="relative aspect-[4/3]">
        <Skeleton className="h-full w-full" />
      </div>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-4 w-16" />
          </div>
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Skeleton className="h-3 w-8" />
            <Skeleton className="h-6 w-24" />
          </div>
          <Skeleton className="h-9 w-24" />
        </div>
      </CardContent>
    </Card>
  );
}
