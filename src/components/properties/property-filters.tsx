"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, SlidersHorizontal } from "lucide-react";

export interface PropertyFiltersProps {
  filters: {
    city: string;
    minPrice: string;
    maxPrice: string;
    guests: string;
    amenities: string[];
  };
  onFiltersChange: (filters: PropertyFiltersProps["filters"]) => void;
  onApply: () => void;
  onClear: () => void;
}

const AMENITIES_LIST = [
  { id: "pool", label: "Pool" },
  { id: "spa", label: "Spa" },
  { id: "wifi", label: "WiFi" },
  { id: "restaurant", label: "Restaurant" },
  { id: "gym", label: "Gym" },
  { id: "beach", label: "Beach" },
  { id: "parking", label: "Parking" },
];

const CITIES = [
  "Dubai",
  "Abu Dhabi",
  "Sharjah",
  "Ajman",
  "Ras Al Khaimah",
  "Fujairah",
];

const GUEST_OPTIONS = ["1", "2", "3", "4", "5", "6", "7", "8", "10+"];

export function PropertyFilters({
  filters,
  onFiltersChange,
  onApply,
  onClear,
}: PropertyFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const handleCityChange = (value: string) => {
    onFiltersChange({ ...filters, city: value === "all" ? "" : value });
  };

  const handleMinPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({ ...filters, minPrice: e.target.value });
  };

  const handleMaxPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({ ...filters, maxPrice: e.target.value });
  };

  const handleGuestsChange = (value: string) => {
    onFiltersChange({ ...filters, guests: value === "any" ? "" : value });
  };

  const handleAmenityToggle = (amenityId: string) => {
    const newAmenities = filters.amenities.includes(amenityId)
      ? filters.amenities.filter((a) => a !== amenityId)
      : [...filters.amenities, amenityId];
    onFiltersChange({ ...filters, amenities: newAmenities });
  };

  const hasActiveFilters =
    filters.city ||
    filters.minPrice ||
    filters.maxPrice ||
    filters.guests ||
    filters.amenities.length > 0;

  return (
    <Card className="sticky top-4">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <SlidersHorizontal className="h-5 w-5" />
            Filters
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="md:hidden"
          >
            {isExpanded ? "Hide" : "Show"}
          </Button>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-6">
          {/* City Filter */}
          <div className="space-y-2">
            <Label htmlFor="city">Location</Label>
            <Select value={filters.city || "all"} onValueChange={handleCityChange}>
              <SelectTrigger id="city" className="w-full">
                <SelectValue placeholder="Select city" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cities</SelectItem>
                {CITIES.map((city) => (
                  <SelectItem key={city} value={city}>
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Price Range */}
          <div className="space-y-2">
            <Label>Price Range (AED/night)</Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                placeholder="Min"
                value={filters.minPrice}
                onChange={handleMinPriceChange}
                min="0"
                className="w-full"
              />
              <span className="text-muted-foreground">-</span>
              <Input
                type="number"
                placeholder="Max"
                value={filters.maxPrice}
                onChange={handleMaxPriceChange}
                min="0"
                className="w-full"
              />
            </div>
          </div>

          {/* Guest Count */}
          <div className="space-y-2">
            <Label htmlFor="guests">Guests</Label>
            <Select
              value={filters.guests || "any"}
              onValueChange={handleGuestsChange}
            >
              <SelectTrigger id="guests" className="w-full">
                <SelectValue placeholder="Any" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any</SelectItem>
                {GUEST_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option.replace("+", "")}>
                    {option} {parseInt(option) === 1 ? "Guest" : "Guests"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Amenities */}
          <div className="space-y-2">
            <Label>Amenities</Label>
            <div className="grid grid-cols-2 gap-2">
              {AMENITIES_LIST.map((amenity) => (
                <label
                  key={amenity.id}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={filters.amenities.includes(amenity.id)}
                    onChange={() => handleAmenityToggle(amenity.id)}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="text-sm">{amenity.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2 pt-2">
            <Button onClick={onApply} className="w-full">
              Apply Filters
            </Button>
            {hasActiveFilters && (
              <Button
                variant="outline"
                onClick={onClear}
                className="w-full"
              >
                <X className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
