"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Heart,
  MapPin,
  Star,
  Clock,
  Loader2,
  Search,
} from "lucide-react";
import { toast } from "sonner";

interface FavoriteProperty {
  id: string;
  name: string;
  description: string;
  city: string;
  country: string;
  images: string[];
  amenities: string[];
  rating: number;
  reviewCount: number;
  featured: boolean;
  minPrice: number | null;
}

interface FavoriteActivity {
  id: string;
  name: string;
  description: string;
  category: string;
  city: string;
  country: string;
  images: string[];
  duration: string;
  price: number;
  rating: number;
  reviewCount: number;
  featured: boolean;
  tags: string[];
}

interface Favorite {
  id: string;
  type: string;
  createdAt: string;
  property?: FavoriteProperty;
  activity?: FavoriteActivity;
}

export default function FavoritesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/favorites");
    }
  }, [status, router]);

  useEffect(() => {
    async function fetchFavorites() {
      try {
        const response = await fetch("/api/favorites");
        const data = await response.json();
        setFavorites(data.favorites || []);
      } catch {
        toast.error("Failed to load favorites");
      } finally {
        setIsLoading(false);
      }
    }

    if (session) {
      fetchFavorites();
    }
  }, [session]);

  const handleRemoveFavorite = async (favorite: Favorite) => {
    setRemovingId(favorite.id);
    try {
      const body = favorite.type === "property"
        ? { propertyId: favorite.property?.id }
        : { activityId: favorite.activity?.id };

      const response = await fetch("/api/favorites", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) throw new Error("Failed to remove");

      setFavorites((prev) => prev.filter((f) => f.id !== favorite.id));
      toast.success("Removed from favorites");
    } catch {
      toast.error("Failed to remove from favorites");
    } finally {
      setRemovingId(null);
    }
  };

  const propertyFavorites = favorites.filter((f) => f.type === "property");
  const activityFavorites = favorites.filter((f) => f.type === "activity");

  if (status === "loading" || isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">My Favorites</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="aspect-[4/3] w-full rounded-lg" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const renderPropertyCard = (favorite: Favorite) => {
    const property = favorite.property;
    if (!property) return null;

    const mainImage = property.images[0] || "/placeholder-hotel.jpg";

    return (
      <Card
        key={favorite.id}
        className="group overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300"
      >
        <div className="relative aspect-[4/3] overflow-hidden">
          <Link href={`/properties/${property.id}`}>
            <Image
              src={mainImage}
              alt={property.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </Link>
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent pointer-events-none" />
          {property.featured && (
            <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground">
              Featured
            </Badge>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-3 right-3 bg-white/80 hover:bg-white text-red-500 hover:text-red-600 rounded-full h-9 w-9"
            onClick={() => handleRemoveFavorite(favorite)}
            disabled={removingId === favorite.id}
          >
            {removingId === favorite.id ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Heart className="h-4 w-4 fill-current" />
            )}
          </Button>
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
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="font-medium">{property.rating}</span>
              <span className="text-sm text-muted-foreground">
                ({property.reviewCount} reviews)
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              {property.minPrice ? (
                <>
                  <p className="text-sm text-muted-foreground">From</p>
                  <p className="text-lg font-bold text-primary">
                    USD {property.minPrice.toLocaleString()}
                    <span className="text-sm font-normal text-muted-foreground">
                      /night
                    </span>
                  </p>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">Price on request</p>
              )}
            </div>
            <Button size="sm" asChild>
              <Link href={`/properties/${property.id}`}>View Details</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderActivityCard = (favorite: Favorite) => {
    const activity = favorite.activity;
    if (!activity) return null;

    const mainImage = activity.images[0] || "/placeholder-hotel.jpg";

    return (
      <Card
        key={favorite.id}
        className="group overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300"
      >
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image
            src={mainImage}
            alt={activity.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent pointer-events-none" />
          <Badge className="absolute top-3 left-3 bg-primary/90 text-primary-foreground capitalize">
            {activity.category}
          </Badge>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-3 right-3 bg-white/80 hover:bg-white text-red-500 hover:text-red-600 rounded-full h-9 w-9"
            onClick={() => handleRemoveFavorite(favorite)}
            disabled={removingId === favorite.id}
          >
            {removingId === favorite.id ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Heart className="h-4 w-4 fill-current" />
            )}
          </Button>
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
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="font-medium">{activity.rating}</span>
              <span className="text-sm text-muted-foreground">
                ({activity.reviewCount} reviews)
              </span>
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              <span>{activity.duration}</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-lg font-bold text-primary">
              USD {activity.price.toLocaleString()}
              <span className="text-sm font-normal text-muted-foreground">
                /person
              </span>
            </p>
            <Button size="sm" variant="outline">
              View Details
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderFavoriteCard = (favorite: Favorite) => {
    if (favorite.type === "property") return renderPropertyCard(favorite);
    return renderActivityCard(favorite);
  };

  const EmptyState = ({ message }: { message: string }) => (
    <div className="text-center py-16">
      <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
        <Heart className="h-10 w-10 text-muted-foreground" />
      </div>
      <h2 className="text-xl font-semibold mb-2">{message}</h2>
      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
        Start exploring properties and activities to add them to your favorites.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button asChild>
          <Link href="/properties">
            <Search className="mr-2 h-4 w-4" />
            Explore Properties
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/activities">Discover Activities</Link>
        </Button>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Favorites</h1>
        <p className="text-muted-foreground">
          Your saved properties and activities
        </p>
      </div>

      <Tabs defaultValue="all">
        <TabsList className="mb-6">
          <TabsTrigger value="all">
            All ({favorites.length})
          </TabsTrigger>
          <TabsTrigger value="properties">
            Properties ({propertyFavorites.length})
          </TabsTrigger>
          <TabsTrigger value="activities">
            Activities ({activityFavorites.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          {favorites.length === 0 ? (
            <EmptyState message="No favorites yet" />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favorites.map(renderFavoriteCard)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="properties">
          {propertyFavorites.length === 0 ? (
            <EmptyState message="No favorite properties yet" />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {propertyFavorites.map(renderPropertyCard)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="activities">
          {activityFavorites.length === 0 ? (
            <EmptyState message="No favorite activities yet" />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activityFavorites.map(renderActivityCard)}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
