"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { format, differenceInDays } from "date-fns";
import { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { DateRangePicker } from "@/components/booking/date-range-picker";
import { Loader2, Users, MapPin, AlertCircle, CheckCircle } from "lucide-react";
import { toast } from "sonner";

interface Room {
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
  };
}

export default function BookingPage({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const { roomId } = use(params);
  const { data: session, status } = useSession();
  const router = useRouter();

  const [room, setRoom] = useState<Room | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);

  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [guests, setGuests] = useState(1);
  const [specialRequests, setSpecialRequests] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push(`/login?callbackUrl=/book/${roomId}`);
    }
  }, [status, router, roomId]);

  useEffect(() => {
    async function fetchRoom() {
      try {
        const response = await fetch(`/api/rooms/${roomId}`);
        if (!response.ok) throw new Error("Room not found");
        const data = await response.json();
        setRoom(data);
      } catch {
        toast.error("Failed to load room details");
      } finally {
        setIsLoading(false);
      }
    }
    fetchRoom();
  }, [roomId]);

  useEffect(() => {
    async function checkAvailability() {
      if (!dateRange?.from || !dateRange?.to) {
        setIsAvailable(null);
        return;
      }

      setIsCheckingAvailability(true);
      try {
        const response = await fetch("/api/bookings/check-availability", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            roomId,
            checkIn: dateRange.from.toISOString(),
            checkOut: dateRange.to.toISOString(),
          }),
        });
        const data = await response.json();
        setIsAvailable(data.available);
      } catch {
        setIsAvailable(null);
      } finally {
        setIsCheckingAvailability(false);
      }
    }
    checkAvailability();
  }, [dateRange, roomId]);

  const nights =
    dateRange?.from && dateRange?.to
      ? differenceInDays(dateRange.to, dateRange.from)
      : 0;
  const totalPrice = room ? nights * room.price : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!dateRange?.from || !dateRange?.to) {
      toast.error("Please select check-in and check-out dates");
      return;
    }

    if (!isAvailable) {
      toast.error("Room is not available for selected dates");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId,
          checkIn: dateRange.from.toISOString(),
          checkOut: dateRange.to.toISOString(),
          guests,
          specialRequests,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create booking");
      }

      toast.success("Booking created successfully!");
      router.push(`/bookings/${data.booking.id}/confirmation`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create booking"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!room) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Room not found</h1>
        <Button asChild>
          <Link href="/properties">Browse Properties</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Complete Your Booking</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Booking Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Select Dates</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Check-in & Check-out</Label>
                  <DateRangePicker
                    value={dateRange}
                    onChange={setDateRange}
                    className="mt-2"
                  />
                </div>

                {isCheckingAvailability && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Checking availability...</span>
                  </div>
                )}

                {isAvailable === true && (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span>Room is available for selected dates</span>
                  </div>
                )}

                {isAvailable === false && (
                  <div className="flex items-center gap-2 text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    <span>Room is not available for selected dates</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Guest Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="guests">Number of Guests</Label>
                  <Input
                    id="guests"
                    type="number"
                    min={1}
                    max={room.capacity}
                    value={guests}
                    onChange={(e) => setGuests(parseInt(e.target.value) || 1)}
                    className="mt-2"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Maximum {room.capacity} guests
                  </p>
                </div>

                <div>
                  <Label htmlFor="requests">Special Requests (Optional)</Label>
                  <Textarea
                    id="requests"
                    placeholder="Any special requests or requirements..."
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    className="mt-2"
                  />
                </div>
              </CardContent>
            </Card>

            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={
                isSubmitting || !isAvailable || !dateRange?.from || !dateRange?.to
              }
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                `Confirm Booking - AED ${totalPrice.toLocaleString()}`
              )}
            </Button>
          </form>
        </div>

        {/* Booking Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Booking Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative aspect-video rounded-lg overflow-hidden">
                <Image
                  src={room.images[0] || "/placeholder-room.jpg"}
                  alt={room.name}
                  fill
                  className="object-cover"
                />
              </div>

              <div>
                <h3 className="font-semibold">{room.name}</h3>
                <p className="text-sm text-muted-foreground">{room.type}</p>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>
                  {room.property.name}, {room.property.city}
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>Up to {room.capacity} guests</span>
              </div>

              <Separator />

              <div className="space-y-2">
                {dateRange?.from && dateRange?.to && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span>Check-in</span>
                      <span>{format(dateRange.from, "MMM dd, yyyy")}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Check-out</span>
                      <span>{format(dateRange.to, "MMM dd, yyyy")}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>
                        AED {room.price} x {nights} nights
                      </span>
                      <span>AED {totalPrice.toLocaleString()}</span>
                    </div>
                  </>
                )}
              </div>

              <Separator />

              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>AED {totalPrice.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
