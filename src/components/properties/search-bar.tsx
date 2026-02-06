"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
import { CalendarIcon, MapPin, Search, Users } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const searchSchema = z
  .object({
    location: z.string().min(1, "Please enter a location"),
    checkIn: z.date({ message: "Check-in date is required" }),
    checkOut: z.date({ message: "Check-out date is required" }),
    guests: z.string().min(1, "Please select number of guests"),
  })
  .refine((data) => data.checkOut > data.checkIn, {
    message: "Check-out must be after check-in",
    path: ["checkOut"],
  });

type SearchFormValues = z.infer<typeof searchSchema>;

interface SearchBarProps {
  defaultValues?: Partial<SearchFormValues>;
  variant?: "default" | "compact";
  className?: string;
  onSearch?: (values: SearchFormValues) => void;
}

export function SearchBar({
  defaultValues,
  variant = "default",
  className,
  onSearch,
}: SearchBarProps) {
  const router = useRouter();

  const form = useForm<SearchFormValues>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      location: defaultValues?.location || "",
      checkIn: defaultValues?.checkIn,
      checkOut: defaultValues?.checkOut,
      guests: defaultValues?.guests || "",
    },
  });

  const handleSubmit = (values: SearchFormValues) => {
    if (onSearch) {
      onSearch(values);
    } else {
      const params = new URLSearchParams({
        location: values.location,
        checkIn: values.checkIn.toISOString(),
        checkOut: values.checkOut.toISOString(),
        guests: values.guests,
      });
      router.push(`/properties?${params.toString()}`);
    }
  };

  const isCompact = variant === "compact";

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className={cn(
          "w-full",
          isCompact
            ? "flex flex-wrap items-end gap-2"
            : "bg-background rounded-xl shadow-lg p-4 md:p-6",
          className
        )}
      >
        <div
          className={cn(
            isCompact
              ? "flex flex-wrap items-end gap-2 w-full"
              : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4"
          )}
        >
          {/* Location */}
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem className={cn(isCompact ? "flex-1 min-w-[150px]" : "lg:col-span-1")}>
                {!isCompact && <FormLabel>Location</FormLabel>}
                <FormControl>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Where are you going?"
                      className="pl-9"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Check-in Date */}
          <FormField
            control={form.control}
            name="checkIn"
            render={({ field }) => (
              <FormItem className={cn(isCompact ? "flex-1 min-w-[140px]" : "")}>
                {!isCompact && <FormLabel>Check-in</FormLabel>}
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? (
                          format(field.value, "MMM dd, yyyy")
                        ) : (
                          <span>Check-in</span>
                        )}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date < new Date(new Date().setHours(0, 0, 0, 0))
                      }
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Check-out Date */}
          <FormField
            control={form.control}
            name="checkOut"
            render={({ field }) => (
              <FormItem className={cn(isCompact ? "flex-1 min-w-[140px]" : "")}>
                {!isCompact && <FormLabel>Check-out</FormLabel>}
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? (
                          format(field.value, "MMM dd, yyyy")
                        ) : (
                          <span>Check-out</span>
                        )}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => {
                        const checkIn = form.getValues("checkIn");
                        return (
                          date < new Date(new Date().setHours(0, 0, 0, 0)) ||
                          (checkIn && date <= checkIn)
                        );
                      }}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Guests */}
          <FormField
            control={form.control}
            name="guests"
            render={({ field }) => (
              <FormItem className={cn(isCompact ? "flex-1 min-w-[120px]" : "")}>
                {!isCompact && <FormLabel>Guests</FormLabel>}
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <SelectValue placeholder="Guests" />
                      </div>
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num} {num === 1 ? "Guest" : "Guests"}
                      </SelectItem>
                    ))}
                    <SelectItem value="9+">9+ Guests</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Search Button */}
          <div className={cn(isCompact ? "" : "flex items-end")}>
            <Button
              type="submit"
              className={cn(isCompact ? "h-9" : "w-full h-10")}
              size={isCompact ? "default" : "lg"}
            >
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
