"use client";

import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import type { DateRange } from "react-day-picker";

import { cn, useIsMobile } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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

interface DateRangePickerProps {
  value?: DateRange;
  onChange?: (range: DateRange | undefined) => void;
  disabled?: (date: Date) => boolean;
  placeholder?: string;
  className?: string;
  align?: "start" | "center" | "end";
  numberOfMonths?: number;
  minDate?: Date;
  maxDate?: Date;
}

export function DateRangePicker({
  value,
  onChange,
  disabled,
  placeholder = "Select dates",
  className,
  align = "start",
  numberOfMonths = 2,
  minDate,
  maxDate,
}: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false);
  const isMobile = useIsMobile();
  const months = isMobile ? 1 : numberOfMonths;

  const defaultDisabled = React.useCallback(
    (date: Date) => {
      if (disabled) return disabled(date);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (date < today) return true;
      if (minDate && date < minDate) return true;
      if (maxDate && date > maxDate) return true;

      return false;
    },
    [disabled, minDate, maxDate]
  );

  const formatDateRange = () => {
    if (!value?.from) {
      return placeholder;
    }

    if (value.to) {
      if (isMobile) {
        return `${format(value.from, "MMM dd")} - ${format(value.to, "MMM dd")}`;
      }
      return `${format(value.from, "MMM dd, yyyy")} - ${format(
        value.to,
        "MMM dd, yyyy"
      )}`;
    }

    return format(value.from, "MMM dd, yyyy");
  };

  const handleSelect = (range: DateRange | undefined) => {
    onChange?.(range);
    if (range?.from && range?.to) {
      setOpen(false);
    }
  };

  const trigger = (
    <Button
      type="button"
      variant="outline"
      className={cn(
        "w-full justify-start text-left font-normal",
        !value?.from && "text-muted-foreground",
        className
      )}
      onClick={() => setOpen(true)}
    >
      <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
      <span className="truncate">{formatDateRange()}</span>
    </Button>
  );

  const calendar = (
    <Calendar
      mode="range"
      defaultMonth={value?.from}
      selected={value}
      onSelect={handleSelect}
      numberOfMonths={months}
      disabled={defaultDisabled}
    />
  );

  if (isMobile) {
    return (
      <>
        {trigger}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="p-0 w-auto max-w-[calc(100vw-2rem)]" showCloseButton={false}>
            {calendar}
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent className="w-auto p-0" align={align}>
        {calendar}
      </PopoverContent>
    </Popover>
  );
}

interface DateRangePickerWithLabelsProps extends DateRangePickerProps {
  checkInLabel?: string;
  checkOutLabel?: string;
}

export function DateRangePickerWithLabels({
  value,
  onChange,
  disabled,
  className,
  checkInLabel = "Check-in",
  checkOutLabel = "Check-out",
  numberOfMonths = 2,
  minDate,
  maxDate,
}: DateRangePickerWithLabelsProps) {
  const [open, setOpen] = React.useState(false);
  const isMobile = useIsMobile();
  const months = isMobile ? 1 : numberOfMonths;

  const defaultDisabled = React.useCallback(
    (date: Date) => {
      if (disabled) return disabled(date);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (date < today) return true;
      if (minDate && date < minDate) return true;
      if (maxDate && date > maxDate) return true;

      return false;
    },
    [disabled, minDate, maxDate]
  );

  const handleSelect = (range: DateRange | undefined) => {
    onChange?.(range);
    if (range?.from && range?.to) {
      setOpen(false);
    }
  };

  const trigger = (
    <Button
      type="button"
      variant="outline"
      className={cn(
        "w-full justify-start text-left font-normal h-auto py-2",
        className
      )}
      onClick={() => setOpen(true)}
    >
      <div className="flex items-center gap-3 sm:gap-4 w-full">
        <CalendarIcon className="h-5 w-5 text-muted-foreground shrink-0" />
        <div className="grid grid-cols-2 gap-3 sm:gap-4 flex-1 min-w-0">
          <div className="space-y-1 min-w-0">
            <p className="text-xs text-muted-foreground">{checkInLabel}</p>
            <p className={cn("text-sm truncate", !value?.from && "text-muted-foreground")}>
              {value?.from
                ? format(value.from, isMobile ? "MMM dd" : "MMM dd, yyyy")
                : "Select date"}
            </p>
          </div>
          <div className="space-y-1 border-l pl-3 sm:pl-4 min-w-0">
            <p className="text-xs text-muted-foreground">{checkOutLabel}</p>
            <p className={cn("text-sm truncate", !value?.to && "text-muted-foreground")}>
              {value?.to
                ? format(value.to, isMobile ? "MMM dd" : "MMM dd, yyyy")
                : "Select date"}
            </p>
          </div>
        </div>
      </div>
    </Button>
  );

  const calendar = (
    <Calendar
      mode="range"
      defaultMonth={value?.from}
      selected={value}
      onSelect={handleSelect}
      numberOfMonths={months}
      disabled={defaultDisabled}
    />
  );

  if (isMobile) {
    return (
      <>
        {trigger}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="p-0 w-auto max-w-[calc(100vw-2rem)]" showCloseButton={false}>
            {calendar}
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        {calendar}
      </PopoverContent>
    </Popover>
  );
}
