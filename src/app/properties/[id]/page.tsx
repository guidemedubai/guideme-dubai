import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { StarRating } from "@/components/reviews/star-rating";
import {
  MapPin,
  Users,
  Wifi,
  Car,
  Waves,
  Utensils,
  Dumbbell,
  Sparkles,
  Star,
} from "lucide-react";

const amenityIcons: Record<string, React.ReactNode> = {
  wifi: <Wifi className="h-5 w-5" />,
  parking: <Car className="h-5 w-5" />,
  pool: <Waves className="h-5 w-5" />,
  restaurant: <Utensils className="h-5 w-5" />,
  gym: <Dumbbell className="h-5 w-5" />,
  spa: <Sparkles className="h-5 w-5" />,
};

async function getProperty(id: string) {
  const property = await prisma.property.findUnique({
    where: { id },
    include: {
      rooms: { orderBy: { price: "asc" } },
      reviews: {
        include: {
          user: { select: { id: true, name: true, image: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      },
    },
  });

  if (!property) return null;

  return {
    ...property,
    images: JSON.parse(property.images) as string[],
    amenities: JSON.parse(property.amenities) as string[],
    rooms: property.rooms.map((room) => ({
      ...room,
      images: JSON.parse(room.images) as string[],
      amenities: JSON.parse(room.amenities) as string[],
    })),
  };
}

export default async function PropertyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const property = await getProperty(id);

  if (!property) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Image Gallery */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="relative aspect-[4/3] rounded-lg overflow-hidden">
          <Image
            src={property.images[0] || "/placeholder-hotel.jpg"}
            alt={property.name}
            fill
            className="object-cover"
            priority
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          {property.images.slice(1, 5).map((image, index) => (
            <div
              key={index}
              className="relative aspect-[4/3] rounded-lg overflow-hidden"
            >
              <Image
                src={image}
                alt={`${property.name} ${index + 2}`}
                fill
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Header */}
          <div>
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">{property.name}</h1>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>
                    {property.address}, {property.city}, {property.country}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                <span className="text-xl font-semibold">{property.rating}</span>
                <span className="text-muted-foreground">
                  ({property.reviewCount} reviews)
                </span>
              </div>
            </div>
            {property.featured && (
              <Badge className="mb-4">Featured Property</Badge>
            )}
          </div>

          <Separator />

          {/* Description */}
          <div>
            <h2 className="text-xl font-semibold mb-4">About this property</h2>
            <p className="text-muted-foreground leading-relaxed">
              {property.description}
            </p>
          </div>

          <Separator />

          {/* Amenities */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Amenities</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {property.amenities.map((amenity) => (
                <div key={amenity} className="flex items-center gap-3">
                  {amenityIcons[amenity.toLowerCase()] || (
                    <Sparkles className="h-5 w-5" />
                  )}
                  <span>{amenity}</span>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Rooms */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Available Rooms</h2>
            <div className="space-y-4">
              {property.rooms.map((room) => (
                <Card key={room.id}>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="relative w-full md:w-48 aspect-[4/3] rounded-lg overflow-hidden shrink-0">
                        <Image
                          src={room.images[0] || "/placeholder-room.jpg"}
                          alt={room.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div>
                            <h3 className="text-lg font-semibold">
                              {room.name}
                            </h3>
                            <Badge variant="secondary" className="mt-1">
                              {room.type}
                            </Badge>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold">
                              AED {room.price}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              per night
                            </p>
                          </div>
                        </div>
                        <p className="text-muted-foreground text-sm mb-3">
                          {room.description}
                        </p>
                        <div className="flex items-center gap-4 mb-4">
                          <div className="flex items-center gap-1 text-sm">
                            <Users className="h-4 w-4" />
                            <span>Up to {room.capacity} guests</span>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {room.amenities.slice(0, 4).map((amenity) => (
                            <Badge key={amenity} variant="outline">
                              {amenity}
                            </Badge>
                          ))}
                        </div>
                        <Button asChild>
                          <Link href={`/book/${room.id}`}>Book Now</Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <Separator />

          {/* Reviews */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Guest Reviews</h2>
            {property.reviews.length === 0 ? (
              <p className="text-muted-foreground">No reviews yet.</p>
            ) : (
              <div className="space-y-4">
                {property.reviews.map((review) => (
                  <Card key={review.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-medium">
                            {review.user.name?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">
                              {review.user.name}
                            </span>
                            <StarRating rating={review.rating} size="sm" />
                          </div>
                          <h4 className="font-medium mb-1">{review.title}</h4>
                          <p className="text-muted-foreground text-sm">
                            {review.comment}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Book Your Stay</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Starting from</p>
                  <p className="text-3xl font-bold">
                    AED{" "}
                    {property.rooms.length > 0
                      ? Math.min(...property.rooms.map((r) => r.price))
                      : "N/A"}
                    <span className="text-base font-normal text-muted-foreground">
                      /night
                    </span>
                  </p>
                </div>
                <Separator />
                <div className="space-y-2">
                  <p className="text-sm font-medium">Quick facts:</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• {property.rooms.length} room types available</li>
                    <li>• {property.amenities.length} amenities</li>
                    <li>• {property.reviewCount} guest reviews</li>
                  </ul>
                </div>
                <Button asChild className="w-full" size="lg">
                  <a href="#rooms">View Rooms</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
