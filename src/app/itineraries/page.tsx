"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format, differenceInDays } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarDays, MapPin, Pencil, Plus, Trash2, DollarSign } from "lucide-react";
import { toast } from "sonner";

interface ItineraryItem {
  id: string;
  day: number;
  timeSlot: string | null;
  activity: { name: string; city: string; price: number } | null;
  property: { name: string; city: string } | null;
}

interface Itinerary {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  budget: number | null;
  notes: string | null;
  createdAt: string;
  items: ItineraryItem[];
}

export default function ItinerariesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [itineraries, setItineraries] = useState<Itinerary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/itineraries");
      return;
    }
    if (status === "authenticated") {
      fetchItineraries();
    }
  }, [status, router]);

  async function fetchItineraries() {
    try {
      const res = await fetch("/api/itineraries");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setItineraries(data.itineraries || []);
    } catch {
      toast.error("Failed to load itineraries");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/itineraries/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setItineraries((prev) => prev.filter((it) => it.id !== id));
      toast.success("Itinerary deleted");
    } catch {
      toast.error("Failed to delete itinerary");
    }
  }

  if (isLoading || status === "loading") {
    return (
      <div className="container max-w-4xl mx-auto py-12 px-4 space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-12 px-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Itineraries</h1>
          <p className="text-muted-foreground">
            {itineraries.length} saved itinerar{itineraries.length === 1 ? "y" : "ies"}
          </p>
        </div>
        <Button asChild>
          <Link href="/itinerary-planner">
            <Plus className="mr-2 h-4 w-4" />
            New Itinerary
          </Link>
        </Button>
      </div>

      {itineraries.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <CalendarDays className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-1">No itineraries yet</h3>
            <p className="text-muted-foreground mb-4">Plan your first Maldives trip</p>
            <Button asChild>
              <Link href="/itinerary-planner">Create Itinerary</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {itineraries.map((itinerary) => {
            const days = differenceInDays(new Date(itinerary.endDate), new Date(itinerary.startDate));
            const activityCount = itinerary.items.filter((i) => i.activity).length;
            const totalCost = itinerary.items.reduce(
              (sum, i) => sum + (i.activity?.price || 0),
              0
            );
            const cities = [
              ...new Set(
                itinerary.items
                  .map((i) => i.activity?.city || i.property?.city)
                  .filter(Boolean)
              ),
            ];

            return (
              <Card key={itinerary.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl">{itinerary.name}</CardTitle>
                      <CardDescription className="flex items-center gap-4 mt-1">
                        <span className="flex items-center gap-1">
                          <CalendarDays className="h-3.5 w-3.5" />
                          {format(new Date(itinerary.startDate), "MMM d")} –{" "}
                          {format(new Date(itinerary.endDate), "MMM d, yyyy")}
                        </span>
                        <span>{days} night{days !== 1 ? "s" : ""}</span>
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button asChild variant="ghost" size="icon">
                        <Link href={`/itinerary-planner?edit=${itinerary.id}`}>
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Itinerary?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently remove &quot;{itinerary.name}&quot; and all its activities.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(itinerary.id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge variant="secondary">
                      {activityCount} activit{activityCount === 1 ? "y" : "ies"}
                    </Badge>
                    {itinerary.budget && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        {itinerary.budget.toLocaleString()} budget
                      </Badge>
                    )}
                    {totalCost > 0 && (
                      <Badge variant="outline">
                        ${totalCost.toLocaleString()} estimated
                      </Badge>
                    )}
                    {cities.length > 0 && (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {cities.join(", ")}
                      </span>
                    )}
                  </div>
                  {itinerary.notes && (
                    <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
                      {itinerary.notes}
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
