"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  Star,
  MapPin,
  Clock,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Hotel,
  Compass,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PropertyResult {
  id: string;
  type: "property";
  name: string;
  description: string;
  city: string;
  country: string;
  images: string[];
  rating: number;
  reviewCount: number;
  featured: boolean;
  roomCount: number;
  minPrice: number | null;
}

interface ActivityResult {
  id: string;
  type: "activity";
  name: string;
  description: string;
  category: string;
  city: string;
  country: string;
  images: string[];
  duration: string;
  price: number;
  rating: number;
  reviewCount: number;
  featured: boolean;
  tags: string[];
}

type SearchResult = PropertyResult | ActivityResult;

interface Pagination {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  propertyCount: number;
  activityCount: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

const categoryOptions = [
  { value: "all", label: "All Categories" },
  { value: "adventure", label: "Adventure" },
  { value: "cultural", label: "Cultural" },
  { value: "dining", label: "Dining" },
  { value: "nightlife", label: "Nightlife" },
  { value: "shopping", label: "Shopping" },
  { value: "wellness", label: "Wellness" },
  { value: "water-sports", label: "Water Sports" },
  { value: "diving", label: "Diving" },
  { value: "snorkeling", label: "Snorkeling" },
  { value: "island-hopping", label: "Island Hopping" },
];

function SearchPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialQ = searchParams.get("q") || "";
  const initialArea = searchParams.get("area") || "";
  const initialCategory = searchParams.get("category") || "";

  const [searchQuery, setSearchQuery] = useState(initialQ);
  const [activeTab, setActiveTab] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState(initialCategory);
  const [properties, setProperties] = useState<PropertyResult[]>([]);
  const [activities, setActivities] = useState<ActivityResult[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const fetchResults = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set("q", searchQuery);
      if (initialArea) params.set("area", initialArea);
      if (categoryFilter && categoryFilter !== "all") params.set("category", categoryFilter);
      params.set("page", currentPage.toString());
      params.set("limit", "12");

      if (activeTab === "properties") {
        params.set("type", "property");
      } else if (activeTab === "activities") {
        params.set("type", "activity");
      } else {
        params.set("type", "all");
      }

      const res = await fetch(`/api/search?${params.toString()}`);
      const data = await res.json();

      setProperties(data.properties || []);
      setActivities(data.activities || []);
      setPagination(data.pagination || null);
    } catch (error) {
      console.error("Error fetching search results:", error);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, initialArea, categoryFilter, activeTab, currentPage]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    const params = new URLSearchParams();
    if (searchQuery) params.set("q", searchQuery);
    if (initialArea) params.set("area", initialArea);
    if (categoryFilter && categoryFilter !== "all") params.set("category", categoryFilter);
    router.push(`/search?${params.toString()}`);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setCategoryFilter("");
    setActiveTab("all");
    setCurrentPage(1);
    router.push("/search");
  };

  const allResults: SearchResult[] = [
    ...properties,
    ...activities,
  ];

  const displayResults =
    activeTab === "properties"
      ? (properties as SearchResult[])
      : activeTab === "activities"
        ? (activities as SearchResult[])
        : allResults;

  const hasActiveFilters = searchQuery || initialArea || (categoryFilter && categoryFilter !== "all");

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Search Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          {initialArea
            ? `Explore ${initialArea}`
            : searchQuery
              ? `Results for "${searchQuery}"`
              : "Search Maldives"}
        </h1>
        <p className="text-muted-foreground">
          {initialArea
            ? `Discover guesthouses, activities, and more in ${initialArea}`
            : "Find guesthouses, activities, and experiences across the Maldives"}
        </p>
      </div>

      {/* Search Bar and Filters */}
      <div className="mb-6 space-y-4">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search islands, guesthouses, activities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Filters
          </Button>
          <Button type="submit">Search</Button>
        </form>

        {/* Filters Panel */}
        {showFilters && (
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex-1 min-w-[200px]">
                  <label className="text-sm font-medium mb-1.5 block">
                    Category
                  </label>
                  <Select
                    value={categoryFilter || "all"}
                    onValueChange={(value) => {
                      setCategoryFilter(value);
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      {categoryOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="mt-auto"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Clear Filters
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Active Filters */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2">
            {searchQuery && (
              <Badge variant="secondary" className="gap-1">
                Search: {searchQuery}
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setCurrentPage(1);
                  }}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {initialArea && (
              <Badge variant="secondary" className="gap-1">
                Area: {initialArea}
                <button
                  onClick={() => router.push(`/search${searchQuery ? `?q=${searchQuery}` : ""}`)}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {categoryFilter && categoryFilter !== "all" && (
              <Badge variant="secondary" className="gap-1 capitalize">
                Category: {categoryFilter}
                <button
                  onClick={() => {
                    setCategoryFilter("");
                    setCurrentPage(1);
                  }}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(value) => {
          setActiveTab(value);
          setCurrentPage(1);
        }}
        className="mb-6"
      >
        <TabsList>
          <TabsTrigger value="all">
            All
            {pagination && (
              <span className="ml-1.5 text-xs">({pagination.totalCount})</span>
            )}
          </TabsTrigger>
          <TabsTrigger value="properties">
            <Hotel className="h-4 w-4 mr-1.5" />
            Properties
            {pagination && (
              <span className="ml-1.5 text-xs">({pagination.propertyCount})</span>
            )}
          </TabsTrigger>
          <TabsTrigger value="activities">
            <Compass className="h-4 w-4 mr-1.5" />
            Activities
            {pagination && (
              <span className="ml-1.5 text-xs">({pagination.activityCount})</span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Results */}
        <TabsContent value={activeTab} className="mt-6">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="aspect-[4/3] w-full" />
                  <CardContent className="p-4 space-y-3">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : displayResults.length === 0 ? (
            <div className="text-center py-16">
              <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No results found</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                {searchQuery
                  ? `We couldn't find anything matching "${searchQuery}". Try adjusting your search or filters.`
                  : "Try searching for guesthouses, activities, or islands in the Maldives."}
              </p>
              <div className="flex gap-3 justify-center">
                {hasActiveFilters && (
                  <Button variant="outline" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                )}
                <Button asChild>
                  <Link href="/explore">Browse All</Link>
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayResults.map((result) =>
                  result.type === "property" ? (
                    <PropertyResultCard
                      key={`property-${result.id}`}
                      property={result as PropertyResult}
                    />
                  ) : (
                    <ActivityResultCard
                      key={`activity-${result.id}`}
                      activity={result as ActivityResult}
                    />
                  )
                )}
              </div>

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 mt-8">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!pagination.hasPrevPage}
                    onClick={() => setCurrentPage((p) => p - 1)}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {pagination.page} of {pagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!pagination.hasNextPage}
                    onClick={() => setCurrentPage((p) => p + 1)}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function PropertyResultCard({ property }: { property: PropertyResult }) {
  return (
    <Link href={`/properties/${property.id}`}>
      <Card className="group overflow-hidden h-full hover:shadow-lg transition-shadow">
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image
            src={property.images[0] || "/placeholder-hotel.jpg"}
            alt={property.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute top-3 left-3 flex gap-2">
            <Badge variant="secondary" className="gap-1">
              <Hotel className="h-3 w-3" />
              Property
            </Badge>
            {property.featured && <Badge>Featured</Badge>}
          </div>
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
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {property.description}
          </p>
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
                <span className="text-sm text-muted-foreground">From </span>
                <span className="font-semibold">
                  USD {property.minPrice.toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function ActivityResultCard({ activity }: { activity: ActivityResult }) {
  return (
    <Link href={`/search?q=${encodeURIComponent(activity.name)}`}>
      <Card className="group overflow-hidden h-full hover:shadow-lg transition-shadow">
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image
            src={activity.images[0] || "/placeholder-hotel.jpg"}
            alt={activity.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute top-3 left-3 flex gap-2">
            <Badge variant="secondary" className="gap-1">
              <Compass className="h-3 w-3" />
              Activity
            </Badge>
            {activity.featured && <Badge>Featured</Badge>}
          </div>
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold text-lg mb-1 line-clamp-1">
            {activity.name}
          </h3>
          <div className="flex items-center gap-3 text-sm text-muted-foreground mb-2">
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {activity.duration}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {activity.city}
            </span>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {activity.description}
          </p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="font-medium">{activity.rating}</span>
              <span className="text-sm text-muted-foreground">
                ({activity.reviewCount})
              </span>
            </div>
            <p className="font-semibold">
              USD {activity.price.toLocaleString()}
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-10 w-64 mb-4" />
          <Skeleton className="h-5 w-96 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="aspect-[4/3] w-full" />
                <CardContent className="p-4 space-y-3">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      }
    >
      <SearchPageContent />
    </Suspense>
  );
}
