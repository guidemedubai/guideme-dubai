"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin, Bed, Wifi, Car, Waves, Dumbbell, UtensilsCrossed, Sparkles, ParkingCircle } from "lucide-react";

import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StarRating } from "@/components/reviews/star-rating";

interface PropertyCardProps {
  property: {
    id: string;
    name: string;
    description?: string;
    city: string;
    country: string;
    images: string[];
    amenities: string[];
    rating: number;
    reviewCount: number;
    featured: boolean;
    roomCount: number;
    minPrice: number | null;
  };
  className?: string;
}

const amenityIcons: Record<string, React.ReactNode> = {
  wifi: <Wifi className="h-3 w-3" />,
  parking: <ParkingCircle className="h-3 w-3" />,
  pool: <Waves className="h-3 w-3" />,
  gym: <Dumbbell className="h-3 w-3" />,
  restaurant: <UtensilsCrossed className="h-3 w-3" />,
  spa: <Sparkles className="h-3 w-3" />,
};

export function PropertyCard({ property, className }: PropertyCardProps) {
  const mainImage = property.images[0] || "/placeholder-hotel.jpg";
  const displayAmenities = property.amenities.slice(0, 3);

  return (
    <Link href={`/properties/${property.id}`}>
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
            alt={property.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

          {/* Featured Badge */}
          {property.featured && (
            <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground">
              Featured
            </Badge>
          )}

          {/* Property Info Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
            <h3 className="text-lg font-semibold line-clamp-1">{property.name}</h3>
            <div className="flex items-center gap-1 text-sm text-white/90 mt-1">
              <MapPin className="h-3.5 w-3.5" />
              <span>
                {property.city}, {property.country}
              </span>
            </div>
          </div>
        </div>

        {/* Card Content */}
        <CardContent className="p-4">
          {/* Rating and Room Count */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <StarRating rating={property.rating} size="sm" />
              <span className="text-sm text-muted-foreground">
                ({property.reviewCount} reviews)
              </span>
            </div>
            <Badge variant="outline" className="gap-1">
              <Bed className="h-3 w-3" />
              {property.roomCount} {property.roomCount === 1 ? "Room" : "Rooms"}
            </Badge>
          </div>

          {/* Amenities */}
          <div className="flex items-center gap-2 flex-wrap mb-4">
            {displayAmenities.map((amenity) => (
              <Badge key={amenity} variant="secondary" className="gap-1 text-xs">
                {amenityIcons[amenity.toLowerCase()] || null}
                {amenity}
              </Badge>
            ))}
            {property.amenities.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{property.amenities.length - 3} more
              </Badge>
            )}
          </div>

          {/* Price and Action */}
          <div className="flex items-center justify-between">
            <div>
              {property.minPrice ? (
                <>
                  <p className="text-sm text-muted-foreground">From</p>
                  <p className="text-lg font-bold text-primary">
                    AED {property.minPrice.toLocaleString()}
                    <span className="text-sm font-normal text-muted-foreground">
                      /night
                    </span>
                  </p>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">Price on request</p>
              )}
            </div>
            <Button size="sm">View Details</Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export function PropertyCardSkeleton({ className }: { className?: string }) {
  return (
    <Card className={cn("overflow-hidden border-0 shadow-md", className)}>
      <div className="relative aspect-[4/3]">
        <Skeleton className="h-full w-full" />
      </div>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-4 rounded-full" />
            ))}
          </div>
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-5 w-14 rounded-full" />
          <Skeleton className="h-5 w-14 rounded-full" />
          <Skeleton className="h-5 w-14 rounded-full" />
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
