"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { addDays, differenceInDays, format } from "date-fns";
import type { DateRange } from "react-day-picker";
import { toast } from "sonner";

import { cn, useIsMobile } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  CalendarDays,
  Plus,
  Trash2,
  GripVertical,
  Clock,
  Sun,
  Sunset,
  Moon,
  DollarSign,
  Loader2,
  Printer,
  Share2,
  Search,
  MapPin,
  Star,
} from "lucide-react";

// ── Types ───────────────────────────────────────────────────────────────────

interface Activity {
  id: string;
  name: string;
  description: string;
  category: string;
  address: string;
  city: string;
  images: string[];
  duration: string;
  price: number;
  rating: number;
  reviewCount: number;
  tags: string[];
}

interface ItinerarySlotItem {
  clientId: string; // for React key / local tracking
  activityId?: string;
  activity?: Activity;
  notes?: string;
}

interface DaySlots {
  morning: ItinerarySlotItem[];
  afternoon: ItinerarySlotItem[];
  evening: ItinerarySlotItem[];
}

type TimeSlot = "morning" | "afternoon" | "evening";

const TIME_SLOTS: { key: TimeSlot; label: string; icon: React.ReactNode }[] = [
  { key: "morning", label: "Morning", icon: <Sun className="h-4 w-4" /> },
  { key: "afternoon", label: "Afternoon", icon: <Sunset className="h-4 w-4" /> },
  { key: "evening", label: "Evening", icon: <Moon className="h-4 w-4" /> },
];

// ── Helpers ─────────────────────────────────────────────────────────────────

let clientIdCounter = 0;
function nextClientId() {
  clientIdCounter += 1;
  return `item-${clientIdCounter}-${Date.now()}`;
}

// ── Component ───────────────────────────────────────────────────────────────

export default function ItineraryPlannerPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-8 max-w-5xl"><Loader2 className="h-8 w-8 animate-spin mx-auto mt-16 text-muted-foreground" /></div>}>
      <ItineraryPlannerContent />
    </Suspense>
  );
}

function ItineraryPlannerContent() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");

  const isMobile = useIsMobile();

  // Trip details
  const [tripName, setTripName] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [budget, setBudget] = useState("");
  const [startPopoverOpen, setStartPopoverOpen] = useState(false);
  const [endPopoverOpen, setEndPopoverOpen] = useState(false);

  // Day plan state: { [dayIndex]: DaySlots }
  const [dayPlans, setDayPlans] = useState<Record<number, DaySlots>>({});

  // Activity search dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeDayIndex, setActiveDayIndex] = useState<number>(0);
  const [activeSlot, setActiveSlot] = useState<TimeSlot>("morning");

  const [activitySearch, setActivitySearch] = useState("");
  const [activityCategory, setActivityCategory] = useState("");
  const [loadingActivities, setLoadingActivities] = useState(false);

  // Save state
  const [saving, setSaving] = useState(false);
  const [editLoaded, setEditLoaded] = useState(false);

  // ── Load existing itinerary for editing ────────────────────────────────
  useEffect(() => {
    if (!editId || editLoaded) return;
    async function loadItinerary() {
      try {
        const res = await fetch(`/api/itineraries/${editId}`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        const it = data.itinerary;

        setTripName(it.name);
        setDateRange({
          from: new Date(it.startDate),
          to: new Date(it.endDate),
        });
        setBudget(it.budget ? String(it.budget) : "");

        // Rebuild dayPlans from items
        const plans: Record<number, DaySlots> = {};
        for (const item of it.items) {
          const dayIndex = item.day - 1;
          if (!plans[dayIndex]) {
            plans[dayIndex] = { morning: [], afternoon: [], evening: [] };
          }
          const slot = (item.timeSlot || "morning") as TimeSlot;
          plans[dayIndex][slot].push({
            clientId: nextClientId(),
            activityId: item.activity?.id,
            activity: item.activity
              ? {
                  id: item.activity.id,
                  name: item.activity.name,
                  description: item.activity.description,
                  category: item.activity.category,
                  address: item.activity.address,
                  city: item.activity.city,
                  images: [],
                  duration: item.activity.duration,
                  price: item.activity.price,
                  rating: item.activity.rating,
                  reviewCount: item.activity.reviewCount,
                  tags: [],
                }
              : undefined,
            notes: item.notes || undefined,
          });
        }
        setDayPlans(plans);
        setEditLoaded(true);
      } catch {
        toast.error("Failed to load itinerary");
      }
    }
    loadItinerary();
  }, [editId, editLoaded]);

  // ── Derived values ──────────────────────────────────────────────────────

  const numberOfDays = useMemo(() => {
    if (!dateRange?.from || !dateRange?.to) return 0;
    return differenceInDays(dateRange.to, dateRange.from) + 1;
  }, [dateRange]);

  const dayCards = useMemo(() => {
    if (!dateRange?.from || numberOfDays <= 0) return [];
    return Array.from({ length: numberOfDays }, (_, i) => ({
      index: i,
      date: addDays(dateRange.from!, i),
      label: `Day ${i + 1}`,
    }));
  }, [dateRange, numberOfDays]);

  // Running cost total
  const totalCost = useMemo(() => {
    let cost = 0;
    Object.values(dayPlans).forEach((day) => {
      (["morning", "afternoon", "evening"] as TimeSlot[]).forEach((slot) => {
        day[slot].forEach((item) => {
          if (item.activity) {
            cost += item.activity.price;
          }
        });
      });
    });
    return cost;
  }, [dayPlans]);

  // ── Initialize day plans when date range changes ────────────────────────

  useEffect(() => {
    if (numberOfDays <= 0) {
      setDayPlans({});
      return;
    }

    setDayPlans((prev) => {
      const next: Record<number, DaySlots> = {};
      for (let i = 0; i < numberOfDays; i++) {
        next[i] = prev[i] || { morning: [], afternoon: [], evening: [] };
      }
      return next;
    });
  }, [numberOfDays]);

  // ── Fetch activities (once) ──────────────────────────────────────────────

  const [allActivities, setAllActivities] = useState<Activity[]>([]);
  const [activitiesLoaded, setActivitiesLoaded] = useState(false);

  useEffect(() => {
    if (dialogOpen && !activitiesLoaded) {
      setLoadingActivities(true);
      fetch("/api/activities?limit=100")
        .then((res) => res.json())
        .then((data) => {
          setAllActivities(data.activities || []);
          setActivitiesLoaded(true);
        })
        .catch(() => toast.error("Failed to load activities"))
        .finally(() => setLoadingActivities(false));
    }
  }, [dialogOpen, activitiesLoaded]);

  const filteredActivities = useMemo(() => {
    return allActivities.filter((a) => {
      if (activitySearch && !a.name.toLowerCase().includes(activitySearch.toLowerCase())) return false;
      if (activityCategory && a.category !== activityCategory) return false;
      return true;
    });
  }, [allActivities, activitySearch, activityCategory]);

  // ── Handlers ────────────────────────────────────────────────────────────

  function openAddDialog(dayIndex: number, slot: TimeSlot) {
    setActiveDayIndex(dayIndex);
    setActiveSlot(slot);
    setActivitySearch("");
    setActivityCategory("");
    setDialogOpen(true);
  }

  function addActivityToSlot(activity: Activity) {
    setDayPlans((prev) => {
      const day = prev[activeDayIndex] || { morning: [], afternoon: [], evening: [] };
      const slotItems = [...day[activeSlot]];

      // Prevent duplicate in same slot
      if (slotItems.some((item) => item.activityId === activity.id)) {
        toast.error("Activity already added to this slot");
        return prev;
      }

      slotItems.push({
        clientId: nextClientId(),
        activityId: activity.id,
        activity,
      });

      return {
        ...prev,
        [activeDayIndex]: { ...day, [activeSlot]: slotItems },
      };
    });
    setDialogOpen(false);
  }

  function removeItem(dayIndex: number, slot: TimeSlot, clientId: string) {
    setDayPlans((prev) => {
      const day = prev[dayIndex];
      if (!day) return prev;
      return {
        ...prev,
        [dayIndex]: {
          ...day,
          [slot]: day[slot].filter((item) => item.clientId !== clientId),
        },
      };
    });
  }

  function moveItem(
    dayIndex: number,
    slot: TimeSlot,
    fromIndex: number,
    direction: "up" | "down"
  ) {
    setDayPlans((prev) => {
      const day = prev[dayIndex];
      if (!day) return prev;
      const items = [...day[slot]];
      const toIndex = direction === "up" ? fromIndex - 1 : fromIndex + 1;
      if (toIndex < 0 || toIndex >= items.length) return prev;
      [items[fromIndex], items[toIndex]] = [items[toIndex], items[fromIndex]];
      return {
        ...prev,
        [dayIndex]: { ...day, [slot]: items },
      };
    });
  }

  // ── Save ────────────────────────────────────────────────────────────────

  async function handleSave() {
    if (!session?.user?.id) {
      router.push("/login?callbackUrl=/itinerary-planner");
      return;
    }

    if (!tripName.trim()) {
      toast.error("Please enter a trip name");
      return;
    }

    if (!dateRange?.from || !dateRange?.to) {
      toast.error("Please select trip dates");
      return;
    }

    // Flatten day plans into items array
    const items: {
      day: number;
      timeSlot: string;
      order: number;
      activityId?: string;
      notes?: string;
    }[] = [];

    Object.entries(dayPlans).forEach(([dayIndexStr, daySlots]) => {
      const dayNum = parseInt(dayIndexStr) + 1; // 1-based day number
      (["morning", "afternoon", "evening"] as TimeSlot[]).forEach((slot) => {
        daySlots[slot].forEach((item, order) => {
          items.push({
            day: dayNum,
            timeSlot: slot,
            order,
            activityId: item.activityId,
            notes: item.notes,
          });
        });
      });
    });

    setSaving(true);
    try {
      const url = editId ? `/api/itineraries/${editId}` : "/api/itineraries";
      const method = editId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: tripName.trim(),
          startDate: dateRange.from.toISOString(),
          endDate: dateRange.to.toISOString(),
          budget: budget ? budget : null,
          items,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save itinerary");
      }

      toast.success(editId ? "Itinerary updated!" : "Itinerary saved!");
      router.push("/itineraries");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save itinerary");
    } finally {
      setSaving(false);
    }
  }

  // ── Print ───────────────────────────────────────────────────────────────

  function handlePrint() {
    window.print();
  }

  async function handleShare() {
    const text = `Check out my Maldives trip plan: ${tripName}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: tripName, text });
      } catch {
        // User cancelled or share failed silently
      }
    } else {
      await navigator.clipboard.writeText(text);
      toast.success("Trip details copied to clipboard!");
    }
  }

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <CalendarDays className="h-8 w-8 text-primary" />
            {editId ? "Edit Itinerary" : "Itinerary Planner"}
          </h1>
          <p className="text-muted-foreground mt-1">
            Plan your perfect Maldives trip day by day
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button variant="outline" size="sm" onClick={handleShare}>
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      {/* Trip Details Card */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-lg">Trip Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Trip Name */}
            <div className="space-y-2 sm:col-span-2 lg:col-span-1">
              <Label htmlFor="trip-name">Trip Name</Label>
              <Input
                id="trip-name"
                placeholder="My Maldives Adventure"
                value={tripName}
                onChange={(e) => setTripName(e.target.value)}
              />
            </div>

            {/* Start Date */}
            <div className="space-y-2">
              <Label>Start Date</Label>
              {isMobile ? (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dateRange?.from && "text-muted-foreground"
                    )}
                    onClick={() => setStartPopoverOpen(true)}
                  >
                    <CalendarDays className="mr-2 h-4 w-4" />
                    {dateRange?.from
                      ? format(dateRange.from, "MMM dd, yyyy")
                      : "Pick a date"}
                  </Button>
                  <Dialog open={startPopoverOpen} onOpenChange={setStartPopoverOpen}>
                    <DialogContent className="p-0 w-auto max-w-[calc(100vw-2rem)]" showCloseButton={false}>
                      <Calendar
                        mode="single"
                        selected={dateRange?.from}
                        onSelect={(date) => {
                          setDateRange((prev) => ({
                            from: date,
                            to: prev?.to && date && prev.to > date ? prev.to : undefined,
                          }));
                          setStartPopoverOpen(false);
                        }}
                        disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                      />
                    </DialogContent>
                  </Dialog>
                </>
              ) : (
                <Popover open={startPopoverOpen} onOpenChange={setStartPopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dateRange?.from && "text-muted-foreground"
                      )}
                    >
                      <CalendarDays className="mr-2 h-4 w-4" />
                      {dateRange?.from
                        ? format(dateRange.from, "MMM dd, yyyy")
                        : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateRange?.from}
                      onSelect={(date) => {
                        setDateRange((prev) => ({
                          from: date,
                          to: prev?.to && date && prev.to > date ? prev.to : undefined,
                        }));
                        setStartPopoverOpen(false);
                      }}
                      disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                    />
                  </PopoverContent>
                </Popover>
              )}
            </div>

            {/* End Date */}
            <div className="space-y-2">
              <Label>End Date</Label>
              {isMobile ? (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dateRange?.to && "text-muted-foreground"
                    )}
                    onClick={() => setEndPopoverOpen(true)}
                  >
                    <CalendarDays className="mr-2 h-4 w-4" />
                    {dateRange?.to
                      ? format(dateRange.to, "MMM dd, yyyy")
                      : "Pick a date"}
                  </Button>
                  <Dialog open={endPopoverOpen} onOpenChange={setEndPopoverOpen}>
                    <DialogContent className="p-0 w-auto max-w-[calc(100vw-2rem)]" showCloseButton={false}>
                      <Calendar
                        key={dateRange?.from?.toISOString()}
                        mode="single"
                        defaultMonth={dateRange?.from}
                        selected={dateRange?.to}
                        onSelect={(date) => {
                          setDateRange((prev) => ({ from: prev?.from, to: date }));
                          setEndPopoverOpen(false);
                        }}
                        disabled={(date) => {
                          const today = new Date(new Date().setHours(0, 0, 0, 0));
                          if (date < today) return true;
                          if (dateRange?.from && date <= dateRange.from) return true;
                          return false;
                        }}
                      />
                    </DialogContent>
                  </Dialog>
                </>
              ) : (
                <Popover open={endPopoverOpen} onOpenChange={setEndPopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dateRange?.to && "text-muted-foreground"
                      )}
                    >
                      <CalendarDays className="mr-2 h-4 w-4" />
                      {dateRange?.to
                        ? format(dateRange.to, "MMM dd, yyyy")
                        : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      key={dateRange?.from?.toISOString()}
                      mode="single"
                      defaultMonth={dateRange?.from}
                      selected={dateRange?.to}
                      onSelect={(date) => {
                        setDateRange((prev) => ({ from: prev?.from, to: date }));
                        setEndPopoverOpen(false);
                      }}
                      disabled={(date) => {
                        const today = new Date(new Date().setHours(0, 0, 0, 0));
                        if (date < today) return true;
                        if (dateRange?.from && date <= dateRange.from) return true;
                        return false;
                      }}
                    />
                  </PopoverContent>
                </Popover>
              )}
            </div>

            {/* Budget */}
            <div className="space-y-2">
              <Label htmlFor="budget">Budget (USD)</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="budget"
                  type="number"
                  placeholder="Optional"
                  className="pl-9"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  min={0}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cost Summary Bar */}
      {numberOfDays > 0 && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6 p-4 rounded-lg border bg-muted/50">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{numberOfDays} day{numberOfDays !== 1 ? "s" : ""}</span>
            </div>
            <Separator orientation="vertical" className="h-5 hidden sm:block" />
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">
                Total: USD {totalCost.toLocaleString()}
              </span>
            </div>
            {budget && parseFloat(budget) > 0 && (
              <>
                <Separator orientation="vertical" className="h-5 hidden sm:block" />
                <Badge
                  variant={totalCost > parseFloat(budget) ? "destructive" : "secondary"}
                >
                  {totalCost > parseFloat(budget)
                    ? `USD ${(totalCost - parseFloat(budget)).toLocaleString()} over budget`
                    : `USD ${(parseFloat(budget) - totalCost).toLocaleString()} remaining`}
                </Badge>
              </>
            )}
          </div>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              editId ? "Update Itinerary" : "Save Itinerary"
            )}
          </Button>
        </div>
      )}

      {/* Day Cards */}
      {numberOfDays <= 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <CalendarDays className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Select your trip dates</h2>
            <p className="text-muted-foreground">
              Choose a start and end date above to begin planning your itinerary.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {dayCards.map(({ index, date, label }) => (
            <Card key={index}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Badge variant="secondary" className="text-base px-3 py-1">
                      {label}
                    </Badge>
                    <span className="text-sm text-muted-foreground font-normal">
                      {format(date, "EEEE, MMM dd, yyyy")}
                    </span>
                  </CardTitle>
                  <DayCostBadge dayPlan={dayPlans[index]} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {TIME_SLOTS.map(({ key, label: slotLabel, icon }) => (
                    <TimeSlotColumn
                      key={key}
                      dayIndex={index}
                      slot={key}
                      label={slotLabel}
                      icon={icon}
                      items={dayPlans[index]?.[key] || []}
                      onAdd={() => openAddDialog(index, key)}
                      onRemove={(clientId) => removeItem(index, key, clientId)}
                      onMove={(fromIdx, dir) => moveItem(index, key, fromIdx, dir)}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Bottom Save Button (mobile) */}
      {numberOfDays > 0 && (
        <div className="mt-8 flex justify-end print:hidden">
          <Button size="lg" onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              editId ? "Update Itinerary" : "Save Itinerary"
            )}
          </Button>
        </div>
      )}

      {/* Activity Search Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] flex flex-col overflow-hidden">
          <DialogHeader>
            <DialogTitle>Add Activity</DialogTitle>
          </DialogHeader>

          {/* Search */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search activities..."
                className="pl-9"
                value={activitySearch}
                onChange={(e) => setActivitySearch(e.target.value)}
              />
            </div>
            <select
              className="border rounded-md px-3 py-2 text-sm bg-background"
              value={activityCategory}
              onChange={(e) => setActivityCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              <option value="adventure">Adventure</option>
              <option value="cultural">Cultural</option>
              <option value="dining">Dining</option>
              <option value="nightlife">Nightlife</option>
              <option value="shopping">Shopping</option>
              <option value="wellness">Wellness</option>
              <option value="water-sports">Water Sports</option>
              <option value="desert">Desert</option>
            </select>
          </div>

          {/* Results */}
          <div className="flex-1 -mx-6 px-6 min-h-0 overflow-y-auto">
            {loadingActivities ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : filteredActivities.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No activities found</p>
              </div>
            ) : (
              <div className="space-y-2 pb-2">
                {filteredActivities.map((activity) => (
                  <button
                    key={activity.id}
                    className="w-full text-left p-3 rounded-lg border hover:bg-accent transition-colors"
                    onClick={() => addActivityToSlot(activity)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{activity.name}</p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {activity.city}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {activity.duration}
                          </span>
                          {activity.rating > 0 && (
                            <span className="flex items-center gap-1">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              {activity.rating.toFixed(1)}
                            </span>
                          )}
                        </div>
                        {activity.tags && activity.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {activity.tags.slice(0, 3).map((tag) => (
                              <Badge
                                key={tag}
                                variant="secondary"
                                className="text-[10px] px-1.5 py-0"
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-semibold text-sm">
                          USD {activity.price.toLocaleString()}
                        </p>
                        <Badge variant="outline" className="text-[10px] mt-1">
                          {activity.category}
                        </Badge>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────────────────────

function DayCostBadge({ dayPlan }: { dayPlan?: DaySlots }) {
  if (!dayPlan) return null;

  let cost = 0;
  (["morning", "afternoon", "evening"] as TimeSlot[]).forEach((slot) => {
    dayPlan[slot].forEach((item) => {
      if (item.activity) cost += item.activity.price;
    });
  });

  if (cost === 0) return null;

  return (
    <Badge variant="outline" className="text-xs">
      <DollarSign className="h-3 w-3 mr-1" />
      USD {cost.toLocaleString()}
    </Badge>
  );
}

function TimeSlotColumn({
  dayIndex,
  slot,
  label,
  icon,
  items,
  onAdd,
  onRemove,
  onMove,
}: {
  dayIndex: number;
  slot: TimeSlot;
  label: string;
  icon: React.ReactNode;
  items: ItinerarySlotItem[];
  onAdd: () => void;
  onRemove: (clientId: string) => void;
  onMove: (fromIndex: number, direction: "up" | "down") => void;
}) {
  return (
    <div className="rounded-lg border bg-muted/30 p-3">
      {/* Slot Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-sm font-medium">
          {icon}
          {label}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs"
          onClick={onAdd}
        >
          <Plus className="h-3.5 w-3.5 mr-1" />
          Add
        </Button>
      </div>

      {/* Items */}
      {items.length === 0 ? (
        <button
          onClick={onAdd}
          className="w-full border-2 border-dashed rounded-md p-4 text-center text-xs text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors"
        >
          <Plus className="h-4 w-4 mx-auto mb-1" />
          Add activity
        </button>
      ) : (
        <div className="space-y-2">
          {items.map((item, idx) => (
            <div
              key={item.clientId}
              className="group flex items-start gap-2 rounded-md border bg-background p-2.5 text-sm"
            >
              {/* Grip / reorder controls */}
              <div className="flex flex-col items-center gap-0.5 pt-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                {idx > 0 && (
                  <button
                    className="text-muted-foreground hover:text-foreground"
                    onClick={() => onMove(idx, "up")}
                    aria-label="Move up"
                  >
                    <GripVertical className="h-3 w-3 rotate-0" />
                  </button>
                )}
                {idx < items.length - 1 && (
                  <button
                    className="text-muted-foreground hover:text-foreground"
                    onClick={() => onMove(idx, "down")}
                    aria-label="Move down"
                  >
                    <GripVertical className="h-3 w-3" />
                  </button>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate text-xs">
                  {item.activity?.name || "Activity"}
                </p>
                {item.activity && (
                  <div className="flex items-center gap-2 mt-0.5 text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-0.5">
                      <Clock className="h-2.5 w-2.5" />
                      {item.activity.duration}
                    </span>
                    <span>USD {item.activity.price.toLocaleString()}</span>
                  </div>
                )}
              </div>

              {/* Remove */}
              <button
                className="text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100 shrink-0"
                onClick={() => onRemove(item.clientId)}
                aria-label="Remove activity"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}

          {/* Add more button at bottom of items */}
          <button
            onClick={onAdd}
            className="w-full border border-dashed rounded-md py-1.5 text-center text-[10px] text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors"
          >
            <Plus className="h-3 w-3 inline mr-1" />
            Add more
          </button>
        </div>
      )}
    </div>
  );
}
