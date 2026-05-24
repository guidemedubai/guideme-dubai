"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Calendar, Users, MapPin, Home, Phone, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

interface Booking {
  id: string;
  guestName: string | null;
  guestPhone: string | null;
  checkIn: string;
  checkOut: string;
  guests: number;
  adults: number;
  children: number;
  infants: number;
  totalPrice: number;
  status: string;
  specialRequests: string | null;
  room: {
    name: string;
    type: string;
    property: {
      name: string;
      city: string;
      country: string;
      images: string;
    };
  };
  user: {
    name: string;
    email: string;
  };
}

export default function BookingConfirmationPage() {
  const { id } = useParams<{ id: string }>();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBooking() {
      try {
        const res = await fetch(`/api/bookings/${id}`);
        if (!res.ok) throw new Error("Booking not found");
        const data = await res.json();
        setBooking(data.booking);
      } catch {
        setError("Could not load booking details");
      } finally {
        setIsLoading(false);
      }
    }
    if (id) fetchBooking();
  }, [id]);

  if (isLoading) {
    return (
      <div className="container max-w-2xl mx-auto py-12 px-4 space-y-6">
        <Skeleton className="h-16 w-16 rounded-full mx-auto" />
        <Skeleton className="h-8 w-64 mx-auto" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="container max-w-2xl mx-auto py-12 px-4 text-center space-y-4">
        <p className="text-destructive">{error || "Booking not found"}</p>
        <Button asChild>
          <Link href="/bookings">View My Bookings</Link>
        </Button>
      </div>
    );
  }

  const nights = Math.ceil(
    (new Date(booking.checkOut).getTime() - new Date(booking.checkIn).getTime()) /
      (1000 * 60 * 60 * 24)
  );

  return (
    <div className="container max-w-2xl mx-auto py-12 px-4">
      <div className="text-center mb-8">
        <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold">Booking Confirmed!</h1>
        <p className="text-muted-foreground mt-2">
          Your reservation has been submitted successfully.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Reservation Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="font-medium">{booking.room.property.name}</p>
              <p className="text-sm text-muted-foreground">
                {booking.room.property.city}, {booking.room.property.country}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Home className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="font-medium">{booking.room.name}</p>
              <p className="text-sm text-muted-foreground capitalize">{booking.room.type} room</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="font-medium">
                {format(new Date(booking.checkIn), "MMM d, yyyy")} –{" "}
                {format(new Date(booking.checkOut), "MMM d, yyyy")}
              </p>
              <p className="text-sm text-muted-foreground">
                {nights} night{nights !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          {booking.guestName && (
            <div className="flex items-start gap-3">
              <User className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">{booking.guestName}</p>
              </div>
            </div>
          )}

          {booking.guestPhone && (
            <div className="flex items-start gap-3">
              <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">{booking.guestPhone}</p>
              </div>
            </div>
          )}

          <div className="flex items-start gap-3">
            <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="font-medium">
                {booking.adults} adult{booking.adults !== 1 ? "s" : ""}
                {booking.children > 0 && `, ${booking.children} child${booking.children !== 1 ? "ren" : ""}`}
                {booking.infants > 0 && `, ${booking.infants} infant${booking.infants !== 1 ? "s" : ""}`}
              </p>
              <p className="text-sm text-muted-foreground">
                {booking.guests} total guest{booking.guests !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          {booking.specialRequests && (
            <div className="pt-2 border-t">
              <p className="text-sm font-medium">Special Requests</p>
              <p className="text-sm text-muted-foreground">{booking.specialRequests}</p>
            </div>
          )}

          <div className="pt-4 border-t flex items-center justify-between">
            <span className="text-lg font-semibold">Total</span>
            <span className="text-lg font-bold">${booking.totalPrice.toLocaleString()}</span>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <Button asChild className="flex-1">
          <Link href="/bookings">View My Bookings</Link>
        </Button>
        <Button asChild variant="outline" className="flex-1">
          <Link href="/properties">Browse More Properties</Link>
        </Button>
      </div>
    </div>
  );
}
