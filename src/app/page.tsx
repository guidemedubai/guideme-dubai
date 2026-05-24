import Link from "next/link";
import Image from "next/image";
import prisma from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SearchBar } from "@/components/properties/search-bar";
import {
  Star,
  MapPin,
  Shield,
  Clock,
  CreditCard,
  Headphones,
  Compass,
  Map,
  Wallet,
  CalendarDays,
  Hotel,
  Building,
  Waves,
  Fish,
  Ship,
  Anchor,
  UtensilsCrossed,
  Heart,
} from "lucide-react";

export const dynamic = "force-dynamic";

async function getFeaturedProperties() {
  try {
    const properties = await prisma.property.findMany({
      where: { featured: true },
      include: {
        rooms: { select: { price: true }, orderBy: { price: "asc" }, take: 1 },
      },
      take: 4,
    });

    return properties.map((p) => ({
      ...p,
      images: JSON.parse(p.images) as string[],
      minPrice: p.rooms[0]?.price || null,
    }));
  } catch {
    return [];
  }
}

const categories = [
  { name: "Guesthouses", icon: Hotel, count: 50, slug: "guesthouses" },
  { name: "Resorts", icon: Building, count: 24, slug: "resorts" },
  { name: "Diving", icon: Waves, count: 35, slug: "diving" },
  { name: "Snorkeling", icon: Fish, count: 42, slug: "snorkeling" },
  { name: "Island Hopping", icon: Ship, count: 18, slug: "island-hopping" },
  { name: "Water Sports", icon: Anchor, count: 28, slug: "water-sports" },
  { name: "Dining", icon: UtensilsCrossed, count: 65, slug: "dining" },
  { name: "Wellness", icon: Heart, count: 20, slug: "wellness" },
];

const atolls = [
  {
    name: "Malé Atoll",
    image: "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=800",
    properties: 38,
  },
  {
    name: "Ari Atoll",
    image: "https://images.unsplash.com/photo-1540202404-a2f29016b523?w=800",
    properties: 25,
  },
  {
    name: "Baa Atoll",
    image: "https://images.unsplash.com/photo-1551918120-9739cb430c6d?w=800",
    properties: 18,
  },
  {
    name: "Maafushi Island",
    image: "https://images.unsplash.com/photo-1544550581-5f7ceaf7f992?w=800",
    properties: 32,
  },
  {
    name: "Thulusdhoo",
    image: "https://images.unsplash.com/photo-1559628233-100c798642d4?w=800",
    properties: 14,
  },
  {
    name: "Fuvahmulah",
    image: "https://images.unsplash.com/photo-1586861203927-800a5acdcc4d?w=800",
    properties: 10,
  },
];

export default async function HomePage() {
  const featuredProperties = await getFeaturedProperties();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[650px] flex items-center justify-center">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=1920"
            alt="Aerial view of Maldives islands"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>

        <div className="relative z-10 container mx-auto px-4 text-center text-white">
          <Badge className="mb-6 bg-white/20 text-white border-white/30 backdrop-blur-sm px-4 py-1.5 text-sm">
            AI Your Journey
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Discover Paradise in the Maldives
          </h1>
          <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto text-white/90">
            Find the perfect guesthouse, plan island activities, and create
            unforgettable memories in the world&apos;s most beautiful islands.
          </p>

          <div className="max-w-4xl mx-auto mb-8">
            <SearchBar />
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <span className="bg-white/15 backdrop-blur-sm border border-white/25 rounded-full px-4 py-2 text-sm font-medium">
              200+ Islands
            </span>
            <span className="bg-white/15 backdrop-blur-sm border border-white/25 rounded-full px-4 py-2 text-sm font-medium">
              50+ Guesthouses
            </span>
            <span className="bg-white/15 backdrop-blur-sm border border-white/25 rounded-full px-4 py-2 text-sm font-medium">
              100+ Activities
            </span>
          </div>
        </div>
      </section>

      {/* Category Cards */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-3">Explore by Category</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              From island stays to underwater adventures, find exactly what
              you&apos;re looking for
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={`/search?category=${category.slug}`}
              >
                <Card className="group h-full hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer border-border/60">
                  <CardContent className="p-5 flex flex-col items-center text-center">
                    <div className="w-12 h-12 mb-3 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <category.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-sm mb-1">
                      {category.name}
                    </h3>
                    <span className="text-xs text-muted-foreground">
                      {category.count} listings
                    </span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Where to Stay</h2>
              <p className="text-muted-foreground">
                Hand-picked guesthouses and resorts across the Maldives
              </p>
            </div>
            <Button asChild variant="outline">
              <Link href="/properties">View All</Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProperties.map((property) => (
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
                            USD {property.minPrice}
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

      {/* Plan Your Trip Tools */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Plan Your Trip</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Use our smart tools to plan, budget, and explore the Maldives like
              never before
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link href="/explore">
              <Card className="group h-full hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer">
                <CardContent className="p-6 text-center">
                  <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-blue-500/10 flex items-center justify-center">
                    <Compass className="h-7 w-7 text-blue-500" />
                  </div>
                  <h3 className="font-semibold mb-2">Explore</h3>
                  <p className="text-sm text-muted-foreground">
                    Discover guesthouses, activities, and hidden gems across the
                    Maldives
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/map-explore">
              <Card className="group h-full hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer">
                <CardContent className="p-6 text-center">
                  <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-green-500/10 flex items-center justify-center">
                    <Map className="h-7 w-7 text-green-500" />
                  </div>
                  <h3 className="font-semibold mb-2">Map Explore</h3>
                  <p className="text-sm text-muted-foreground">
                    Browse islands and atolls on an interactive map of the
                    Maldives
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/budget-planner">
              <Card className="group h-full hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer">
                <CardContent className="p-6 text-center">
                  <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-amber-500/10 flex items-center justify-center">
                    <Wallet className="h-7 w-7 text-amber-500" />
                  </div>
                  <h3 className="font-semibold mb-2">Budget Planner</h3>
                  <p className="text-sm text-muted-foreground">
                    Plan your Maldives trip budget with smart recommendations
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/itinerary-planner">
              <Card className="group h-full hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer">
                <CardContent className="p-6 text-center">
                  <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-purple-500/10 flex items-center justify-center">
                    <CalendarDays className="h-7 w-7 text-purple-500" />
                  </div>
                  <h3 className="font-semibold mb-2">Itinerary Planner</h3>
                  <p className="text-sm text-muted-foreground">
                    Build your day-by-day Maldives island-hopping itinerary
                  </p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Doletz */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Choose Doletz</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Your trusted partner for booking the perfect Maldives getaway
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Best Island Deals</h3>
              <p className="text-sm text-muted-foreground">
                Exclusive rates on guesthouses and resorts across every atoll in
                the Maldives.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <Clock className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Instant Confirmation</h3>
              <p className="text-sm text-muted-foreground">
                Get instant booking confirmation with transfer and activity
                details included.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <CreditCard className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Secure Payment</h3>
              <p className="text-sm text-muted-foreground">
                Your payment information is protected with bank-level
                encryption.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <Headphones className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">24/7 Support</h3>
              <p className="text-sm text-muted-foreground">
                Our island experts are available around the clock to help with
                your trip.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Atolls/Islands */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Popular Atolls & Islands</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Explore the most sought-after destinations in the Maldives
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {atolls.map((atoll) => (
              <Link
                key={atoll.name}
                href={`/search?area=${encodeURIComponent(atoll.name)}`}
              >
                <Card className="group overflow-hidden cursor-pointer">
                  <div className="relative aspect-[16/9] overflow-hidden">
                    <Image
                      src={atoll.image}
                      alt={atoll.name}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-4 left-4 text-white">
                      <h3 className="text-xl font-semibold">{atoll.name}</h3>
                      <p className="text-sm text-white/80">
                        {atoll.properties} properties
                      </p>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Explore Paradise?
          </h2>
          <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
            Join thousands of travelers who have discovered their perfect
            Maldives escape with Doletz.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="secondary">
              <Link href="/properties">Browse Properties</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-primary"
            >
              <Link href="/register">Create Account</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
