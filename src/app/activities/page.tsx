"use client";

import { useEffect, useState, useCallback } from "react";
import { ActivityCard, ActivityCardSkeleton } from "@/components/activities/activity-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Mountain,
  Landmark,
  UtensilsCrossed,
  Moon,
  ShoppingBag,
  Heart,
  Waves,
  Sun,
  LayoutGrid,
} from "lucide-react";

interface Activity {
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
  reviewCount: number;
  featured: boolean;
}

interface Pagination {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

const categories = [
  { value: "", label: "All", icon: LayoutGrid },
  { value: "adventure", label: "Adventure", icon: Mountain },
  { value: "cultural", label: "Cultural", icon: Landmark },
  { value: "dining", label: "Dining", icon: UtensilsCrossed },
  { value: "nightlife", label: "Nightlife", icon: Moon },
  { value: "shopping", label: "Shopping", icon: ShoppingBag },
  { value: "wellness", label: "Wellness", icon: Heart },
  { value: "water-sports", label: "Water Sports", icon: Waves },
  { value: "desert", label: "Desert", icon: Sun },
];

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const fetchActivities = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", currentPage.toString());
      params.set("limit", "12");

      if (selectedCategory) params.set("category", selectedCategory);
      if (searchQuery) params.set("search", searchQuery);

      const response = await fetch(`/api/activities?${params.toString()}`);
      const data = await response.json();

      setActivities(data.activities || []);
      setPagination(data.pagination || null);
    } catch (error) {
      console.error("Error fetching activities:", error);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, selectedCategory, searchQuery]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchActivities();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Discover Maldives Activities</h1>
        <p className="text-muted-foreground">
          Explore unforgettable experiences from snorkeling to island hopping
        </p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="relative max-w-xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search activities... (e.g., snorkeling, diving, island hopping)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-24"
          />
          <Button
            type="submit"
            size="sm"
            className="absolute right-1.5 top-1/2 -translate-y-1/2"
          >
            Search
          </Button>
        </div>
      </form>

      {/* Category Tabs */}
      <div className="mb-8 overflow-x-auto">
        <div className="flex gap-2 pb-2 min-w-max">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = selectedCategory === cat.value;
            return (
              <Button
                key={cat.value}
                variant={isActive ? "default" : "outline"}
                size="sm"
                onClick={() => handleCategoryChange(cat.value)}
                className="gap-1.5"
              >
                <Icon className="h-4 w-4" />
                {cat.label}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Activities Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <ActivityCardSkeleton key={i} />
          ))}
        </div>
      ) : activities.length === 0 ? (
        <div className="text-center py-16">
          <div className="mx-auto w-24 h-24 mb-6 rounded-full bg-muted flex items-center justify-center">
            <Sun className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No activities found</h3>
          <p className="text-muted-foreground mb-2 max-w-md mx-auto">
            We could not find any activities matching your criteria. Try browsing our popular Maldives experiences like snorkeling, diving, island hopping, or dolphin watching.
          </p>
          <div className="flex gap-3 justify-center mt-6">
            <Button
              onClick={() => {
                setSelectedCategory("");
                setSearchQuery("");
                setCurrentPage(1);
              }}
              variant="outline"
            >
              Clear Filters
            </Button>
          </div>
        </div>
      ) : (
        <>
          {/* Results count */}
          {pagination && (
            <p className="text-sm text-muted-foreground mb-4">
              Showing {activities.length} of {pagination.totalCount} activities
              {selectedCategory && (
                <span>
                  {" "}in{" "}
                  <span className="font-medium capitalize">
                    {selectedCategory.replace("-", " ")}
                  </span>
                </span>
              )}
            </p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {activities.map((activity) => (
              <ActivityCard key={activity.id} activity={activity} />
            ))}
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
    </div>
  );
}
