"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Search,
  Hotel,
  Compass,
  UtensilsCrossed,
  Mountain,
  Landmark,
  Heart,
  ShoppingBag,
  PartyPopper,
  Star,
  MapPin,
  Clock,
  ArrowRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

interface Property {
  id: string;
  name: string;
  description: string;
  city: string;
  country: string;
  images: string[];
  rating: number;
  reviewCount: number;
  featured: boolean;
  minPrice: number | null;
}

interface Activity {
  id: string;
  name: string;
  description: string;
  category: string;
  city: string;
  images: string[];
  duration: string;
  price: number;
  rating: number;
  reviewCount: number;
  featured: boolean;
}

const categories = [
  { name: "Guesthouses", icon: Hotel, count: 120, href: "/search?category=guesthouses", color: "bg-blue-500/10 text-blue-600" },
  { name: "Resorts", icon: Landmark, count: 85, href: "/search?category=resorts", color: "bg-green-500/10 text-green-600" },
  { name: "Diving", icon: Compass, count: 64, href: "/search?category=diving", color: "bg-orange-500/10 text-orange-600" },
  { name: "Snorkeling", icon: Mountain, count: 42, href: "/search?category=snorkeling", color: "bg-red-500/10 text-red-600" },
  { name: "Island Hopping", icon: ShoppingBag, count: 38, href: "/search?category=island-hopping", color: "bg-purple-500/10 text-purple-600" },
  { name: "Water Sports", icon: PartyPopper, count: 29, href: "/search?category=water-sports", color: "bg-pink-500/10 text-pink-600" },
  { name: "Dining", icon: UtensilsCrossed, count: 53, href: "/search?category=dining", color: "bg-amber-500/10 text-amber-600" },
  { name: "Wellness", icon: Heart, count: 31, href: "/search?category=wellness", color: "bg-indigo-500/10 text-indigo-600" },
];

const destinations = [
  {
    name: "Malé Atoll",
    image: "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=800",
    description: "The capital atoll with vibrant culture and resorts",
  },
  {
    name: "Ari Atoll",
    image: "https://images.unsplash.com/photo-1540202404-a2f29016b523?w=800",
    description: "World-class diving with whale sharks and mantas",
  },
  {
    name: "Baa Atoll",
    image: "https://images.unsplash.com/photo-1551918120-9739cb430c6d?w=800",
    description: "UNESCO Biosphere Reserve with pristine reefs",
  },
  {
    name: "Maafushi",
    image: "https://images.unsplash.com/photo-1544550581-5f7ceaf7f992?w=800",
    description: "Popular local island with budget-friendly guesthouses",
  },
  {
    name: "Thulusdhoo",
    image: "https://images.unsplash.com/photo-1559628233-100c798642d4?w=800",
    description: "Surf paradise with legendary waves and local charm",
  },
  {
    name: "Fuvahmulah",
    image: "https://images.unsplash.com/photo-1586861203927-800a5acdcc4d?w=800",
    description: "Remote island famous for tiger shark diving",
  },
];

export default function ExplorePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([]);
  const [featuredActivities, setFeaturedActivities] = useState<Activity[]>([]);
  const [loadingProperties, setLoadingProperties] = useState(true);
  const [loadingActivities, setLoadingActivities] = useState(true);

  useEffect(() => {
    async function fetchFeaturedProperties() {
      try {
        const res = await fetch("/api/properties?featured=true&limit=4");
        const data = await res.json();
        setFeaturedProperties(data.properties || []);
      } catch (error) {
        console.error("Error fetching featured properties:", error);
      } finally {
        setLoadingProperties(false);
      }
    }

    async function fetchFeaturedActivities() {
      try {
        const res = await fetch("/api/activities?featured=true&limit=4");
        const data = await res.json();
        setFeaturedActivities(data.activities || []);
      } catch (error) {
        console.error("Error fetching featured activities:", error);
      } finally {
        setLoadingActivities(false);
      }
    }

    fetchFeaturedProperties();
    fetchFeaturedActivities();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[500px] flex items-center justify-center">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=1920"
            alt="Maldives Aerial View"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/50" />
        </div>

        <div className="relative z-10 container mx-auto px-4 text-center text-white">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Explore Maldives
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto text-white/90">
            Discover islands, resorts, diving, and everything the Maldives has to offer
          </p>

          <form
            onSubmit={handleSearch}
            className="max-w-2xl mx-auto flex gap-2"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search islands, guesthouses, activities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 bg-white text-foreground text-base"
              />
            </div>
            <Button type="submit" size="lg" className="h-12 px-8">
              Search
            </Button>
          </form>
        </div>
      </section>

      {/* Category Cards Grid */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Browse by Category</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Find exactly what you&apos;re looking for in the Maldives
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <Link key={category.name} href={category.href}>
                  <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer h-full">
                    <CardContent className="p-6 flex flex-col items-center text-center">
                      <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 ${category.color}`}>
                        <Icon className="h-7 w-7" />
                      </div>
                      <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">
                        {category.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {category.count} listings
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Featured Properties</h2>
              <p className="text-muted-foreground">
                Hand-picked hotels for an exceptional stay
              </p>
            </div>
            <Button asChild variant="outline">
              <Link href="/properties">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {loadingProperties
              ? Array.from({ length: 4 }).map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <Skeleton className="aspect-[4/3] w-full" />
                    <CardContent className="p-4 space-y-3">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-4 w-2/3" />
                    </CardContent>
                  </Card>
                ))
              : featuredProperties.map((property) => (
                  <Link key={property.id} href={`/properties/${property.id}`}>
                    <Card className="group overflow-hidden h-full hover:shadow-lg transition-shadow">
                      <div className="relative aspect-[4/3] overflow-hidden">
                        <Image
                          src={property.images[0] || "/placeholder-hotel.jpg"}
                          alt={property.name}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <Badge className="absolute top-3 left-3">Featured</Badge>
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-lg mb-1 line-clamp-1">
                          {property.name}
                        </h3>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                          <MapPin className="h-4 w-4" />
                          <span>
                            {property.city}, {property.country}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-medium">{property.rating}</span>
                            <span className="text-sm text-muted-foreground">
                              ({property.reviewCount})
                            </span>
                          </div>
                          {property.minPrice && (
                            <div className="text-right">
                              <span className="text-sm text-muted-foreground">
                                From
                              </span>
                              <p className="font-semibold">
                                USD {property.minPrice.toLocaleString()}
                              </p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
          </div>
        </div>
      </section>

      {/* Featured Activities */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Featured Activities</h2>
              <p className="text-muted-foreground">
                Unforgettable experiences across the Maldives
              </p>
            </div>
            <Button asChild variant="outline">
              <Link href="/search?category=activities">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {loadingActivities
              ? Array.from({ length: 4 }).map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <Skeleton className="aspect-[4/3] w-full" />
                    <CardContent className="p-4 space-y-3">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-4 w-2/3" />
                    </CardContent>
                  </Card>
                ))
              : featuredActivities.map((activity) => (
                  <Link key={activity.id} href={`/search?q=${encodeURIComponent(activity.name)}`}>
                    <Card className="group overflow-hidden h-full hover:shadow-lg transition-shadow">
                      <div className="relative aspect-[4/3] overflow-hidden">
                        <Image
                          src={activity.images[0] || "/placeholder-hotel.jpg"}
                          alt={activity.name}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <Badge className="absolute top-3 left-3 capitalize">
                          {activity.category}
                        </Badge>
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-lg mb-1 line-clamp-1">
                          {activity.name}
                        </h3>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground mb-2">
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {activity.duration}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {activity.city}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-medium">{activity.rating}</span>
                            <span className="text-sm text-muted-foreground">
                              ({activity.reviewCount})
                            </span>
                          </div>
                          <p className="font-semibold">
                            USD {activity.price.toLocaleString()}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
          </div>
        </div>
      </section>

      {/* Popular Destinations */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Popular Destinations</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Explore the most sought-after atolls and islands in the Maldives
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {destinations.map((destination) => (
              <Link
                key={destination.name}
                href={`/search?area=${encodeURIComponent(destination.name)}`}
              >
                <Card className="group overflow-hidden cursor-pointer">
                  <div className="relative aspect-[16/9] overflow-hidden">
                    <Image
                      src={destination.image}
                      alt={destination.name}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-4 left-4 text-white">
                      <h3 className="text-xl font-semibold">
                        {destination.name}
                      </h3>
                      <p className="text-sm text-white/80">
                        {destination.description}
                      </p>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
