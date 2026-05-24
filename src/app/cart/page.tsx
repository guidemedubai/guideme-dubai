"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  MapPin,
  Calendar,
  Users,
  Loader2,
  ArrowRight,
  Clock,
} from "lucide-react";
import { toast } from "sonner";

interface CartRoom {
  id: string;
  name: string;
  description: string;
  type: string;
  capacity: number;
  price: number;
  images: string[];
  amenities: string[];
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
  description: string;
  category: string;
  city: string;
  country: string;
  images: string[];
  duration: string;
  price: number;
  rating: number;
  tags: string[];
}

interface CartItem {
  id: string;
  type: string;
  quantity: number;
  checkIn: string | null;
  checkOut: string | null;
  guests: number | null;
  createdAt: string;
  room?: CartRoom;
  activity?: CartActivity;
}

export default function CartPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/cart");
    }
  }, [status, router]);

  useEffect(() => {
    async function fetchCart() {
      try {
        const response = await fetch("/api/cart");
        const data = await response.json();
        setCartItems(data.cartItems || []);
      } catch {
        toast.error("Failed to load cart");
      } finally {
        setIsLoading(false);
      }
    }

    if (session) {
      fetchCart();
    }
  }, [session]);

  const handleUpdateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    setUpdatingId(itemId);
    try {
      const response = await fetch(`/api/cart/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: newQuantity }),
      });

      if (!response.ok) throw new Error("Failed to update");

      setCartItems((prev) =>
        prev.map((item) =>
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        )
      );
    } catch {
      toast.error("Failed to update quantity");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    setRemovingId(itemId);
    try {
      const response = await fetch(`/api/cart/${itemId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to remove");

      setCartItems((prev) => prev.filter((item) => item.id !== itemId));
      toast.success("Item removed from cart");
    } catch {
      toast.error("Failed to remove item");
    } finally {
      setRemovingId(null);
    }
  };

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

  const roomSubtotal = roomItems.reduce((sum, item) => sum + getItemPrice(item), 0);
  const activitySubtotal = activityItems.reduce((sum, item) => sum + getItemPrice(item), 0);
  const grandTotal = roomSubtotal + activitySubtotal;

  if (status === "loading" || isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">My Cart</h1>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex gap-6">
                  <Skeleton className="w-32 h-24 rounded-lg shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-6 w-1/2" />
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-4 w-1/4" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">My Cart</h1>
        <div className="text-center py-16">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
            <ShoppingCart className="h-10 w-10 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Discover amazing hotels and exciting activities to add to your cart.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild>
              <Link href="/properties">Start Exploring</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/activities">Browse Activities</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Cart</h1>
        <p className="text-muted-foreground">
          {cartItems.length} {cartItems.length === 1 ? "item" : "items"} in your cart
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-6">
          {/* Room Items */}
          {roomItems.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Rooms ({roomItems.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {roomItems.map((item, index) => (
                  <div key={item.id}>
                    {index > 0 && <Separator className="mb-4" />}
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="relative w-full sm:w-36 aspect-video rounded-lg overflow-hidden shrink-0">
                        <Image
                          src={item.room?.images[0] || item.room?.property.images[0] || "/placeholder-hotel.jpg"}
                          alt={item.room?.name || "Room"}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <Link
                              href={`/properties/${item.room?.property.id}`}
                              className="font-semibold hover:text-primary transition-colors line-clamp-1"
                            >
                              {item.room?.name}
                            </Link>
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {item.room?.property.name}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-muted-foreground hover:text-destructive shrink-0"
                            onClick={() => handleRemoveItem(item.id)}
                            disabled={removingId === item.id}
                          >
                            {removingId === item.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>

                        <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground flex-wrap">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" />
                            <span>{item.room?.property.city}, {item.room?.property.country}</span>
                          </div>
                          {item.checkIn && item.checkOut && (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5" />
                              <span>
                                {format(new Date(item.checkIn), "MMM dd")} -{" "}
                                {format(new Date(item.checkOut), "MMM dd, yyyy")}
                              </span>
                            </div>
                          )}
                          {item.guests && (
                            <div className="flex items-center gap-1">
                              <Users className="h-3.5 w-3.5" />
                              <span>{item.guests} guests</span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1 || updatingId === item.id}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center font-medium">
                              {updatingId === item.id ? (
                                <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                              ) : (
                                item.quantity
                              )}
                            </span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                              disabled={updatingId === item.id}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          <p className="font-semibold">
                            USD {getItemPrice(item).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <Separator />
                <div className="flex justify-between font-medium">
                  <span>Rooms Subtotal</span>
                  <span>USD {roomSubtotal.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Activity Items */}
          {activityItems.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Activities ({activityItems.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {activityItems.map((item, index) => (
                  <div key={item.id}>
                    {index > 0 && <Separator className="mb-4" />}
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="relative w-full sm:w-36 aspect-video rounded-lg overflow-hidden shrink-0">
                        <Image
                          src={item.activity?.images[0] || "/placeholder-hotel.jpg"}
                          alt={item.activity?.name || "Activity"}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h3 className="font-semibold line-clamp-1">
                              {item.activity?.name}
                            </h3>
                            <p className="text-sm text-muted-foreground capitalize">
                              {item.activity?.category}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-muted-foreground hover:text-destructive shrink-0"
                            onClick={() => handleRemoveItem(item.id)}
                            disabled={removingId === item.id}
                          >
                            {removingId === item.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>

                        <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground flex-wrap">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" />
                            <span>{item.activity?.city}, {item.activity?.country}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            <span>{item.activity?.duration}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1 || updatingId === item.id}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center font-medium">
                              {updatingId === item.id ? (
                                <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                              ) : (
                                item.quantity
                              )}
                            </span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                              disabled={updatingId === item.id}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          <p className="font-semibold">
                            USD {getItemPrice(item).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <Separator />
                <div className="flex justify-between font-medium">
                  <span>Activities Subtotal</span>
                  <span>USD {activitySubtotal.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {roomItems.length > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Rooms ({roomItems.length})
                  </span>
                  <span>USD {roomSubtotal.toLocaleString()}</span>
                </div>
              )}
              {activityItems.length > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Activities ({activityItems.length})
                  </span>
                  <span>USD {activitySubtotal.toLocaleString()}</span>
                </div>
              )}

              <Separator />

              <div className="flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span>USD {grandTotal.toLocaleString()}</span>
              </div>

              <Button asChild className="w-full" size="lg">
                <Link href="/checkout">
                  Proceed to Checkout
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>

              <div className="text-center">
                <Link
                  href="/properties"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Continue Shopping
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
