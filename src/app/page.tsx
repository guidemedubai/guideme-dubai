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

export default async function HomePage() {
  const featuredProperties = await getFeaturedProperties();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[600px] flex items-center justify-center">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1920"
            alt="Dubai Skyline"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/50" />
        </div>

        <div className="relative z-10 container mx-auto px-4 text-center text-white">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Discover Dubai&apos;s Finest Hotels
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto text-white/90">
            Experience luxury and comfort at the best hotels in Dubai. Book your
            perfect stay today.
          </p>

          <div className="max-w-4xl mx-auto">
            <SearchBar />
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Featured Properties</h2>
              <p className="text-muted-foreground">
                Hand-picked hotels for an exceptional stay
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
                            AED {property.minPrice}
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

      {/* Why Choose Us */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Book With Us</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We make hotel booking simple, secure, and hassle-free
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Best Price Guarantee</h3>
              <p className="text-sm text-muted-foreground">
                Find a lower price? We&apos;ll match it and give you 10% off.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <Clock className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Instant Confirmation</h3>
              <p className="text-sm text-muted-foreground">
                Get instant booking confirmation with all details.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <CreditCard className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Secure Payment</h3>
              <p className="text-sm text-muted-foreground">
                Your payment information is protected with encryption.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <Headphones className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">24/7 Support</h3>
              <p className="text-sm text-muted-foreground">
                Our support team is available around the clock.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Destinations */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Popular Destinations</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Explore the most sought-after locations in Dubai
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: "Downtown Dubai",
                image:
                  "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800",
                properties: 45,
              },
              {
                name: "Palm Jumeirah",
                image:
                  "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800",
                properties: 32,
              },
              {
                name: "Dubai Marina",
                image:
                  "https://images.unsplash.com/photo-1518684079-3c830dcef090?w=800",
                properties: 28,
              },
            ].map((destination) => (
              <Link
                key={destination.name}
                href={`/properties?city=${encodeURIComponent(destination.name)}`}
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
                        {destination.properties} properties
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
            Ready to Book Your Dream Stay?
          </h2>
          <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
            Join thousands of happy travelers who have found their perfect
            accommodation through GuideMe Dubai.
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
