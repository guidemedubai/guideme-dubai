"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { format, differenceInDays } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Loader2, Users, MapPin, AlertCircle, CheckCircle, CalendarIcon } from "lucide-react";
import { cn, useIsMobile } from "@/lib/utils";
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

  const [checkIn, setCheckIn] = useState<Date | undefined>();
  const [checkOut, setCheckOut] = useState<Date | undefined>();
  const isMobile = useIsMobile();
  const [checkInOpen, setCheckInOpen] = useState(false);
  const [checkOutOpen, setCheckOutOpen] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
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
      if (!checkIn || !checkOut) {
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
            checkIn: checkIn.toISOString(),
            checkOut: checkOut.toISOString(),
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
  }, [checkIn, checkOut, roomId]);

  const nights =
    checkIn && checkOut
      ? differenceInDays(checkOut, checkIn)
      : 0;
  const totalPrice = room ? nights * room.price : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!checkIn || !checkOut) {
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
          checkIn: checkIn.toISOString(),
          checkOut: checkOut.toISOString(),
          guests: adults + children + infants,
          adults,
          children,
          infants,
          guestName,
          guestPhone,
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Check-in</Label>
                    {isMobile ? (
                      <div>
                        <Button
                          type="button"
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal mt-2",
                            !checkIn && "text-muted-foreground"
                          )}
                          onClick={() => setCheckInOpen(true)}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {checkIn ? format(checkIn, "MMM dd, yyyy") : "Select date"}
                        </Button>
                        <Dialog open={checkInOpen} onOpenChange={setCheckInOpen}>
                          <DialogContent className="p-0 w-auto max-w-[calc(100vw-2rem)]" showCloseButton={false}>
                            <Calendar
                              mode="single"
                              selected={checkIn}
                              onSelect={(date) => {
                                setCheckIn(date);
                                if (date && checkOut && date >= checkOut) {
                                  setCheckOut(undefined);
                                }
                                setCheckInOpen(false);
                              }}
                              disabled={(date) => {
                                const today = new Date();
                                today.setHours(0, 0, 0, 0);
                                return date < today;
                              }}
                            />
                          </DialogContent>
                        </Dialog>
                      </div>
                    ) : (
                      <Popover open={checkInOpen} onOpenChange={setCheckInOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            type="button"
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal mt-2",
                              !checkIn && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {checkIn ? format(checkIn, "MMM dd, yyyy") : "Select date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={checkIn}
                            onSelect={(date) => {
                              setCheckIn(date);
                              if (date && checkOut && date >= checkOut) {
                                setCheckOut(undefined);
                              }
                              setCheckInOpen(false);
                            }}
                            disabled={(date) => {
                              const today = new Date();
                              today.setHours(0, 0, 0, 0);
                              return date < today;
                            }}
                          />
                        </PopoverContent>
                      </Popover>
                    )}
                  </div>
                  <div>
                    <Label>Check-out</Label>
                    {isMobile ? (
                      <div>
                        <Button
                          type="button"
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal mt-2",
                            !checkOut && "text-muted-foreground"
                          )}
                          onClick={() => setCheckOutOpen(true)}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {checkOut ? format(checkOut, "MMM dd, yyyy") : "Select date"}
                        </Button>
                        <Dialog open={checkOutOpen} onOpenChange={setCheckOutOpen}>
                          <DialogContent className="p-0 w-auto max-w-[calc(100vw-2rem)]" showCloseButton={false}>
                            <Calendar
                              mode="single"
                              selected={checkOut}
                              onSelect={(date) => {
                                setCheckOut(date);
                                setCheckOutOpen(false);
                              }}
                              disabled={(date) => {
                                if (!checkIn) {
                                  const today = new Date();
                                  today.setHours(0, 0, 0, 0);
                                  return date <= today;
                                }
                                return date <= checkIn;
                              }}
                            />
                          </DialogContent>
                        </Dialog>
                      </div>
                    ) : (
                      <Popover open={checkOutOpen} onOpenChange={setCheckOutOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            type="button"
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal mt-2",
                              !checkOut && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {checkOut ? format(checkOut, "MMM dd, yyyy") : "Select date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={checkOut}
                            onSelect={(date) => {
                              setCheckOut(date);
                              setCheckOutOpen(false);
                            }}
                            disabled={(date) => {
                              if (!checkIn) {
                                const today = new Date();
                                today.setHours(0, 0, 0, 0);
                                return date <= today;
                              }
                              return date <= checkIn;
                            }}
                          />
                        </PopoverContent>
                      </Popover>
                    )}
                  </div>
                </div>

                {checkIn && checkOut && nights > 0 && (
                  <p className="text-sm font-medium">
                    {nights} night{nights !== 1 ? "s" : ""} · {nights + 1} day{nights + 1 !== 1 ? "s" : ""}
                  </p>
                )}

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
                  <Label htmlFor="guestName">Full Name *</Label>
                  <Input
                    id="guestName"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="Name as on ID/passport"
                    className="mt-2"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="guestPhone">Contact Number *</Label>
                  <Input
                    id="guestPhone"
                    type="tel"
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    placeholder="+960 xxx xxxx"
                    className="mt-2"
                    required
                  />
                </div>

                <Separator />

                <p className="text-sm font-medium">Number of Guests</p>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="adults">Adults (12+)</Label>
                    <Input
                      id="adults"
                      type="number"
                      min={1}
                      max={room.capacity}
                      value={adults}
                      onChange={(e) => setAdults(Math.max(1, parseInt(e.target.value) || 1))}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="children">Children (2–12)</Label>
                    <Input
                      id="children"
                      type="number"
                      min={0}
                      max={room.capacity}
                      value={children}
                      onChange={(e) => setChildren(Math.max(0, parseInt(e.target.value) || 0))}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="infants">Infants (&lt;2)</Label>
                    <Input
                      id="infants"
                      type="number"
                      min={0}
                      max={5}
                      value={infants}
                      onChange={(e) => setInfants(Math.max(0, parseInt(e.target.value) || 0))}
                      className="mt-2"
                    />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  {adults + children + infants} total · max {room.capacity} guests
                </p>

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
                isSubmitting || !isAvailable || !checkIn || !checkOut || !guestName.trim() || !guestPhone.trim()
              }
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                `Confirm Booking - USD ${totalPrice.toLocaleString()}`
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

              {guestName && (
                <div className="text-sm">
                  <p className="font-medium">{guestName}</p>
                  {guestPhone && <p className="text-muted-foreground">{guestPhone}</p>}
                  <p className="text-muted-foreground">
                    {adults} adult{adults !== 1 ? "s" : ""}
                    {children > 0 && `, ${children} child${children !== 1 ? "ren" : ""}`}
                    {infants > 0 && `, ${infants} infant${infants !== 1 ? "s" : ""}`}
                  </p>
                </div>
              )}

              <Separator />

              <div className="space-y-2">
                {checkIn && checkOut && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span>Check-in</span>
                      <span>{format(checkIn, "MMM dd, yyyy")}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Check-out</span>
                      <span>{format(checkOut, "MMM dd, yyyy")}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>
                        USD {room.price} x {nights} nights
                      </span>
                      <span>USD {totalPrice.toLocaleString()}</span>
                    </div>
                  </>
                )}
              </div>

              <Separator />

              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>USD {totalPrice.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
