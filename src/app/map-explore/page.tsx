"use client";

import { useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Star,
  MapPin,
  Search,
  Hotel,
  Compass,
  X,
  List,
  Map as MapIcon,
} from "lucide-react";

const MapView = dynamic(() => import("@/components/map/map-view"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-muted">
      <Skeleton className="w-full h-full" />
    </div>
  ),
});

interface MapItem {
  id: string;
  name: string;
  type: "property" | "activity";
  latitude: number;
  longitude: number;
  image: string;
  rating: number;
  price: number;
  category?: string;
  city: string;
}

const MALDIVES_CENTER = { lat: 3.2028, lng: 73.2207 };

const areas = [
  { name: "All Maldives", lat: 3.2028, lng: 73.2207, zoom: 7 },
  { name: "Malé", lat: 4.1755, lng: 73.5093, zoom: 12 },
  { name: "Maafushi", lat: 3.9433, lng: 73.4906, zoom: 14 },
  { name: "Ari Atoll", lat: 3.8567, lng: 72.8561, zoom: 10 },
  { name: "Baa Atoll", lat: 5.2849, lng: 72.9853, zoom: 10 },
  { name: "Thulusdhoo", lat: 4.3747, lng: 73.6478, zoom: 14 },
  { name: "Addu City", lat: -0.6273, lng: 73.1588, zoom: 12 },
];

export default function MapExplorePage() {
  const [items, setItems] = useState<MapItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "property" | "activity">("all");
  const [selectedItem, setSelectedItem] = useState<MapItem | null>(null);
  const [showList, setShowList] = useState(false);
  const [mapCenter, setMapCenter] = useState(MALDIVES_CENTER);
  const [mapZoom, setMapZoom] = useState(7);

  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    try {
      const [propertiesRes, activitiesRes] = await Promise.all([
        fetch("/api/properties?limit=50"),
        fetch("/api/activities?limit=50"),
      ]);

      const propertiesData = await propertiesRes.json();
      const activitiesData = await activitiesRes.json();

      const propertyItems: MapItem[] = (propertiesData.properties || [])
        .filter((p: Record<string, unknown>) => p.latitude && p.longitude)
        .map((p: Record<string, unknown>) => ({
          id: p.id as string,
          name: p.name as string,
          type: "property" as const,
          latitude: p.latitude as number,
          longitude: p.longitude as number,
          image: ((p.images as string[])?.[0]) || "",
          rating: p.rating as number,
          price: (p.minPrice as number) || 0,
          city: p.city as string,
        }));

      const activityItems: MapItem[] = (activitiesData.activities || [])
        .filter((a: Record<string, unknown>) => a.latitude && a.longitude)
        .map((a: Record<string, unknown>) => ({
          id: a.id as string,
          name: a.name as string,
          type: "activity" as const,
          latitude: a.latitude as number,
          longitude: a.longitude as number,
          image: ((a.images as string[])?.[0]) || "",
          rating: a.rating as number,
          price: a.price as number,
          category: a.category as string,
          city: a.city as string,
        }));

      setItems([...propertyItems, ...activityItems]);
    } catch (error) {
      console.error("Failed to fetch map data:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const filteredItems = items.filter((item) => {
    if (filter !== "all" && item.type !== filter) return false;
    if (search && !item.name.toLowerCase().includes(search.toLowerCase()))
      return false;
    return true;
  });

  const handleAreaClick = (area: (typeof areas)[0]) => {
    setMapCenter({ lat: area.lat, lng: area.lng });
    setMapZoom(area.zoom);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Controls Bar */}
      <div className="border-b bg-background p-4">
        <div className="container mx-auto flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search locations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <Select
            value={filter}
            onValueChange={(v) =>
              setFilter(v as "all" | "property" | "activity")
            }
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="property">Guesthouses</SelectItem>
              <SelectItem value="activity">Activities</SelectItem>
            </SelectContent>
          </Select>

          <div className="hidden md:flex items-center gap-1">
            {areas.map((area) => (
              <Button
                key={area.name}
                variant="outline"
                size="sm"
                onClick={() => handleAreaClick(area)}
              >
                {area.name}
              </Button>
            ))}
          </div>

          <Button
            variant="outline"
            size="icon"
            className="md:hidden"
            onClick={() => setShowList(!showList)}
          >
            {showList ? (
              <MapIcon className="h-4 w-4" />
            ) : (
              <List className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Map */}
        <div
          className={`flex-1 ${showList ? "hidden md:block" : ""}`}
        >
          {isLoading ? (
            <div className="w-full h-full flex items-center justify-center bg-muted">
              <div className="text-center">
                <Compass className="h-12 w-12 mx-auto mb-4 text-muted-foreground animate-spin" />
                <p className="text-muted-foreground">Loading map...</p>
              </div>
            </div>
          ) : (
            <MapView
              items={filteredItems}
              center={mapCenter}
              zoom={mapZoom}
              selectedItem={selectedItem}
              onItemSelect={setSelectedItem}
            />
          )}
        </div>

        {/* Side Panel / List */}
        <div
          className={`w-full md:w-[380px] border-l overflow-y-auto bg-background ${
            !showList ? "hidden md:block" : ""
          }`}
        >
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">
                {filteredItems.length} locations found
              </h2>
              {selectedItem && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedItem(null)}
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              )}
            </div>

            <div className="space-y-3">
              {filteredItems.map((item) => (
                <Card
                  key={`${item.type}-${item.id}`}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedItem?.id === item.id
                      ? "ring-2 ring-primary"
                      : ""
                  }`}
                  onClick={() => setSelectedItem(item)}
                >
                  <CardContent className="p-3">
                    <div className="flex gap-3">
                      <div className="relative w-20 h-20 rounded-lg overflow-hidden shrink-0">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-muted flex items-center justify-center">
                            {item.type === "property" ? (
                              <Hotel className="h-6 w-6 text-muted-foreground" />
                            ) : (
                              <Compass className="h-6 w-6 text-muted-foreground" />
                            )}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-medium text-sm truncate">
                            {item.name}
                          </h3>
                          <Badge
                            variant={
                              item.type === "property"
                                ? "default"
                                : "secondary"
                            }
                            className="shrink-0 text-xs"
                          >
                            {item.type === "property" ? "Hotel" : "Activity"}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                          <MapPin className="h-3 w-3" />
                          <span>{item.city}</span>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs font-medium">
                              {item.rating}
                            </span>
                          </div>
                          <span className="text-sm font-semibold">
                            USD {item.price}
                          </span>
                        </div>
                      </div>
                    </div>
                    {selectedItem?.id === item.id && (
                      <div className="mt-3 pt-3 border-t">
                        <Button asChild size="sm" className="w-full">
                          <Link
                            href={
                              item.type === "property"
                                ? `/properties/${item.id}`
                                : `/activities/${item.id}`
                            }
                          >
                            View Details
                          </Link>
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}

              {filteredItems.length === 0 && !isLoading && (
                <div className="text-center py-12">
                  <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="font-semibold mb-2">No locations found</h3>
                  <p className="text-sm text-muted-foreground">
                    Try adjusting your search or filters
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
