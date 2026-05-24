"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
import { CalendarIcon, MapPin, Search, Users } from "lucide-react";

import { cn, useIsMobile } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  const isMobile = useIsMobile();

  const form = useForm<SearchFormValues>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      location: defaultValues?.location || "",
      checkIn: defaultValues?.checkIn,
      checkOut: defaultValues?.checkOut,
      guests: defaultValues?.guests || "",
    },
  });

  const [checkInDate, setCheckInDate] = React.useState<Date | undefined>(defaultValues?.checkIn);
  const [checkOutDate, setCheckOutDate] = React.useState<Date | undefined>(defaultValues?.checkOut);

  const [checkInOpen, setCheckInOpen] = React.useState(false);
  const [checkOutOpen, setCheckOutOpen] = React.useState(false);

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

  const checkInButton = (
    <Button
      type="button"
      variant="outline"
      className={cn(
        "w-full justify-start text-left font-normal h-10",
        !checkInDate && "text-muted-foreground"
      )}
      onClick={() => setCheckInOpen(true)}
    >
      <CalendarIcon className="mr-2 h-4 w-4" />
      {checkInDate ? format(checkInDate, "MMM dd, yyyy") : "Check-in"}
    </Button>
  );

  const checkOutButton = (
    <Button
      type="button"
      variant="outline"
      className={cn(
        "w-full justify-start text-left font-normal h-10",
        !checkOutDate && "text-muted-foreground"
      )}
      onClick={() => setCheckOutOpen(true)}
    >
      <CalendarIcon className="mr-2 h-4 w-4" />
      {checkOutDate ? format(checkOutDate, "MMM dd, yyyy") : "Check-out"}
    </Button>
  );

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className={cn(
          "w-full",
          isCompact
            ? "flex flex-wrap items-end gap-2"
            : "bg-background text-foreground rounded-xl shadow-lg p-4 md:p-6",
          className
        )}
      >
        <div
          className={cn(
            isCompact
              ? "flex flex-wrap items-end gap-2 w-full"
              : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4"
          )}
        >
          {/* Location */}
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem className={cn(isCompact ? "flex-1 min-w-[150px]" : "sm:col-span-2 lg:col-span-1")}>
                {!isCompact && <FormLabel>Location</FormLabel>}
                <FormControl>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search islands..."
                      className="pl-9 h-10"
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
            render={() => (
              <FormItem className={cn(isCompact ? "flex-1 min-w-[140px]" : "")}>
                {!isCompact && <FormLabel>Check-in</FormLabel>}
                {isMobile ? (
                  <>
                    {checkInButton}
                    <Dialog open={checkInOpen} onOpenChange={setCheckInOpen}>
                      <DialogContent className="p-0 w-auto max-w-[calc(100vw-2rem)]" showCloseButton={false}>
                        <Calendar
                          mode="single"
                          selected={checkInDate}
                          onSelect={(date) => {
                            setCheckInDate(date as Date);
                            form.setValue("checkIn", date as Date, { shouldValidate: true });
                            setCheckInOpen(false);
                          }}
                          disabled={(date) =>
                            date < new Date(new Date().setHours(0, 0, 0, 0))
                          }
                        />
                      </DialogContent>
                    </Dialog>
                  </>
                ) : (
                  <Popover open={checkInOpen} onOpenChange={setCheckInOpen}>
                    <PopoverTrigger asChild>
                      {checkInButton}
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={checkInDate}
                        onSelect={(date) => {
                          setCheckInDate(date as Date);
                          form.setValue("checkIn", date as Date, { shouldValidate: true });
                          setCheckInOpen(false);
                        }}
                        disabled={(date) =>
                          date < new Date(new Date().setHours(0, 0, 0, 0))
                        }
                      />
                    </PopoverContent>
                  </Popover>
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Check-out Date */}
          <FormField
            control={form.control}
            name="checkOut"
            render={() => (
              <FormItem className={cn(isCompact ? "flex-1 min-w-[140px]" : "")}>
                {!isCompact && <FormLabel>Check-out</FormLabel>}
                {isMobile ? (
                  <>
                    {checkOutButton}
                    <Dialog open={checkOutOpen} onOpenChange={setCheckOutOpen}>
                      <DialogContent className="p-0 w-auto max-w-[calc(100vw-2rem)]" showCloseButton={false}>
                        <Calendar
                          mode="single"
                          defaultMonth={checkInDate}
                          selected={checkOutDate}
                          onSelect={(date) => {
                            setCheckOutDate(date as Date);
                            form.setValue("checkOut", date as Date, { shouldValidate: true });
                            setCheckOutOpen(false);
                          }}
                          disabled={(date) => {
                            const ci = form.getValues("checkIn");
                            return (
                              date < new Date(new Date().setHours(0, 0, 0, 0)) ||
                              (ci && date <= ci)
                            );
                          }}
                        />
                      </DialogContent>
                    </Dialog>
                  </>
                ) : (
                  <Popover open={checkOutOpen} onOpenChange={setCheckOutOpen}>
                    <PopoverTrigger asChild>
                      {checkOutButton}
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        defaultMonth={checkInDate}
                        selected={checkOutDate}
                        onSelect={(date) => {
                          setCheckOutDate(date as Date);
                          form.setValue("checkOut", date as Date, { shouldValidate: true });
                          setCheckOutOpen(false);
                        }}
                        disabled={(date) => {
                          const ci = form.getValues("checkIn");
                          return (
                            date < new Date(new Date().setHours(0, 0, 0, 0)) ||
                            (ci && date <= ci)
                          );
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                )}
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
                    <SelectTrigger className="h-10">
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
          <div className={cn(isCompact ? "" : "flex items-end sm:col-span-2 lg:col-span-1")}>
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
