"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ShoppingCart,
  MapPin,
  Calendar,
  Users,
  Clock,
  Loader2,
  CheckCircle,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";

interface CartRoom {
  id: string;
  name: string;
  type: string;
  capacity: number;
  price: number;
  images: string[];
  property: {
    id: string;
    name: string;
    city: string;
    country: string;
    images: string[];
  };
}

interface CartActivity {
  id: string;
  name: string;
  category: string;
  city: string;
  country: string;
  images: string[];
  duration: string;
  price: number;
}

interface CartItem {
  id: string;
  type: string;
  quantity: number;
  checkIn: string | null;
  checkOut: string | null;
  guests: number | null;
  room?: CartRoom;
  activity?: CartActivity;
}

interface BookingResult {
  id: string;
  status: string;
  totalPrice: number;
  room?: {
    name: string;
    property: {
      name: string;
    };
  };
}

export default function CheckoutPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [bookingResults, setBookingResults] = useState<BookingResult[]>([]);

  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/checkout");
    }
  }, [status, router]);

  // Pre-fill contact info from session
  useEffect(() => {
    if (session?.user) {
      setContactName(session.user.name || "");
      setContactEmail(session.user.email || "");
    }
  }, [session]);

  useEffect(() => {
    async function fetchCart() {
      try {
        const response = await fetch("/api/cart");
        const data = await response.json();
        const items = data.cartItems || [];
        setCartItems(items);

        if (items.length === 0 && !isSuccess) {
          router.push("/cart");
        }
      } catch {
        toast.error("Failed to load cart");
      } finally {
        setIsLoading(false);
      }
    }

    if (session) {
      fetchCart();
    }
  }, [session, router, isSuccess]);

  const getItemPrice = (item: CartItem): number => {
    if (item.type === "room" && item.room) {
      if (item.checkIn && item.checkOut) {
        const checkIn = new Date(item.checkIn);
        const checkOut = new Date(item.checkOut);
        const nights = Math.ceil(
          (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
        );
        return item.room.price * Math.max(nights, 1) * item.quantity;
      }
      return item.room.price * item.quantity;
    }
    if (item.type === "activity" && item.activity) {
      return item.activity.price * item.quantity;
    }
    return 0;
  };

  const roomItems = cartItems.filter((item) => item.type === "room");
  const activityItems = cartItems.filter((item) => item.type === "activity");
  const grandTotal = cartItems.reduce((sum, item) => sum + getItemPrice(item), 0);

  const handleConfirmBooking = async () => {
    if (!contactName || !contactEmail) {
      toast.error("Please fill in your contact information");
      return;
    }

    setIsSubmitting(true);
    const results: BookingResult[] = [];
    let hasError = false;

    try {
      // Create bookings for room items
      for (const item of roomItems) {
        if (!item.room || !item.checkIn || !item.checkOut) {
          toast.error(`Please set check-in/out dates for ${item.room?.name || "room"}`);
          hasError = true;
          break;
        }

        try {
          const response = await fetch("/api/bookings", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              roomId: item.room.id,
              checkIn: item.checkIn,
              checkOut: item.checkOut,
              guests: item.guests || 1,
              specialRequests: specialRequests || undefined,
            }),
          });

          const data = await response.json();

          if (!response.ok) {
            toast.error(data.error || `Failed to book ${item.room.name}`);
            hasError = true;
            break;
          }

          results.push(data.booking);
        } catch {
          toast.error(`Failed to create booking for ${item.room.name}`);
          hasError = true;
          break;
        }
      }

      if (hasError) {
        setIsSubmitting(false);
        return;
      }

      // Clear all cart items after successful bookings
      for (const item of cartItems) {
        try {
          await fetch(`/api/cart/${item.id}`, { method: "DELETE" });
        } catch {
          // Silently continue if cart cleanup fails
        }
      }

      setBookingResults(results);
      setIsSuccess(true);
      toast.success("Bookings confirmed successfully!");
    } catch {
      toast.error("Something went wrong during checkout");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent className="p-6 space-y-4">
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          </div>
          <div>
            <Card>
              <CardContent className="p-6 space-y-4">
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-8 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  if (isSuccess) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center py-16">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold mb-4">Booking Confirmed!</h1>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Your reservations have been placed successfully. You will receive a
            confirmation email shortly.
          </p>

          {bookingResults.length > 0 && (
            <Card className="mb-8 text-left">
              <CardHeader>
                <CardTitle className="text-lg">Booking Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {bookingResults.map((booking) => (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between py-2 border-b last:border-0"
                  >
                    <div>
                      <p className="font-medium">
                        {booking.room?.name || "Room Booking"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {booking.room?.property.name}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        USD {booking.totalPrice.toLocaleString()}
                      </p>
                      <p className="text-sm text-muted-foreground capitalize">
                        {booking.status}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {activityItems.length > 0 && (
            <Card className="mb-8 text-left">
              <CardHeader>
                <CardTitle className="text-lg">Activities Booked</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {activityItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between py-2 border-b last:border-0"
                  >
                    <div>
                      <p className="font-medium">{item.activity?.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.quantity} x USD {item.activity?.price.toLocaleString()}
                      </p>
                    </div>
                    <p className="font-semibold">
                      USD {getItemPrice(item).toLocaleString()}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild>
              <Link href="/bookings">View My Bookings</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/properties">Continue Exploring</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/cart">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Cart
          </Link>
        </Button>
        <h1 className="text-3xl font-bold mb-2">Checkout</h1>
        <p className="text-muted-foreground">
          Review your order and complete your booking
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Contact Info + Order Items */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="Your full name"
                    className="mt-1.5"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="mt-1.5"
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="phone">Phone Number (Optional)</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="+960 XXX XXXX"
                  className="mt-1.5"
                />
              </div>
            </CardContent>
          </Card>

          {/* Special Requests */}
          <Card>
            <CardHeader>
              <CardTitle>Special Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                placeholder="Any special requests for your bookings (e.g., early check-in, dietary requirements, accessibility needs)..."
                rows={4}
              />
              <p className="text-sm text-muted-foreground mt-2">
                Special requests are subject to availability and cannot be guaranteed.
              </p>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Room Items */}
              {roomItems.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <div className="relative w-20 h-16 rounded-lg overflow-hidden shrink-0">
                    <Image
                      src={item.room?.images[0] || item.room?.property.images[0] || "/placeholder-hotel.jpg"}
                      alt={item.room?.name || "Room"}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium line-clamp-1">{item.room?.name}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-0.5">
                      <MapPin className="h-3 w-3" />
                      <span className="line-clamp-1">{item.room?.property.name}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1 flex-wrap">
                      {item.checkIn && item.checkOut && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>
                            {format(new Date(item.checkIn), "MMM dd")} -{" "}
                            {format(new Date(item.checkOut), "MMM dd")}
                          </span>
                        </div>
                      )}
                      {item.guests && (
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          <span>{item.guests}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="font-semibold shrink-0">
                    USD {getItemPrice(item).toLocaleString()}
                  </p>
                </div>
              ))}

              {/* Activity Items */}
              {activityItems.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <div className="relative w-20 h-16 rounded-lg overflow-hidden shrink-0">
                    <Image
                      src={item.activity?.images[0] || "/placeholder-hotel.jpg"}
                      alt={item.activity?.name || "Activity"}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium line-clamp-1">{item.activity?.name}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-0.5">
                      <MapPin className="h-3 w-3" />
                      <span>{item.activity?.city}, {item.activity?.country}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <Clock className="h-3 w-3" />
                      <span>{item.activity?.duration}</span>
                      {item.quantity > 1 && (
                        <span>x {item.quantity}</span>
                      )}
                    </div>
                  </div>
                  <p className="font-semibold shrink-0">
                    USD {getItemPrice(item).toLocaleString()}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Total + Confirm */}
        <div className="lg:col-span-1">
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle>Total Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {roomItems.length > 0 && (
                <>
                  {roomItems.map((item) => {
                    const nights =
                      item.checkIn && item.checkOut
                        ? Math.ceil(
                            (new Date(item.checkOut).getTime() -
                              new Date(item.checkIn).getTime()) /
                              (1000 * 60 * 60 * 24)
                          )
                        : 0;

                    return (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-muted-foreground line-clamp-1 max-w-[60%]">
                          {item.room?.name}
                          {nights > 0 && ` (${nights} nights)`}
                          {item.quantity > 1 && ` x${item.quantity}`}
                        </span>
                        <span>USD {getItemPrice(item).toLocaleString()}</span>
                      </div>
                    );
                  })}
                </>
              )}

              {activityItems.length > 0 && (
                <>
                  {activityItems.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-muted-foreground line-clamp-1 max-w-[60%]">
                        {item.activity?.name}
                        {item.quantity > 1 && ` x${item.quantity}`}
                      </span>
                      <span>USD {getItemPrice(item).toLocaleString()}</span>
                    </div>
                  ))}
                </>
              )}

              <Separator />

              <div className="flex justify-between font-semibold text-lg">
                <span>Grand Total</span>
                <span>USD {grandTotal.toLocaleString()}</span>
              </div>

              <Button
                className="w-full"
                size="lg"
                onClick={handleConfirmBooking}
                disabled={isSubmitting || cartItems.length === 0}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Confirm Booking
                  </>
                )}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                By confirming, you agree to our terms and conditions.
                Payment will be collected upon confirmation.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
