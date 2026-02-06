"use client";

import * as React from "react";
import { Star } from "lucide-react";

import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
  interactive?: boolean;
  onChange?: (rating: number) => void;
  className?: string;
}

const sizeClasses = {
  sm: "h-3.5 w-3.5",
  md: "h-5 w-5",
  lg: "h-6 w-6",
};

export function StarRating({
  rating,
  maxRating = 5,
  size = "md",
  showValue = false,
  interactive = false,
  onChange,
  className,
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = React.useState<number | null>(null);

  const displayRating = hoverRating !== null ? hoverRating : rating;

  const handleClick = (index: number) => {
    if (interactive && onChange) {
      onChange(index + 1);
    }
  };

  const handleMouseEnter = (index: number) => {
    if (interactive) {
      setHoverRating(index + 1);
    }
  };

  const handleMouseLeave = () => {
    if (interactive) {
      setHoverRating(null);
    }
  };

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div
        className="flex items-center gap-0.5"
        onMouseLeave={handleMouseLeave}
        role={interactive ? "radiogroup" : undefined}
        aria-label={interactive ? "Rating" : `Rating: ${rating} out of ${maxRating}`}
      >
        {Array.from({ length: maxRating }).map((_, index) => {
          const isFilled = index < displayRating;
          const isHalfFilled =
            !isFilled && index < displayRating && index + 0.5 <= displayRating;

          return (
            <button
              key={index}
              type="button"
              disabled={!interactive}
              onClick={() => handleClick(index)}
              onMouseEnter={() => handleMouseEnter(index)}
              className={cn(
                "focus:outline-none",
                interactive && "cursor-pointer hover:scale-110 transition-transform",
                !interactive && "cursor-default"
              )}
              role={interactive ? "radio" : undefined}
              aria-checked={interactive ? isFilled : undefined}
              aria-label={interactive ? `${index + 1} star${index === 0 ? "" : "s"}` : undefined}
            >
              <Star
                className={cn(
                  sizeClasses[size],
                  "transition-colors",
                  isFilled
                    ? "fill-yellow-400 text-yellow-400"
                    : isHalfFilled
                    ? "fill-yellow-400/50 text-yellow-400"
                    : "fill-muted text-muted-foreground/30"
                )}
              />
            </button>
          );
        })}
      </div>
      {showValue && (
        <span className="text-sm text-muted-foreground ml-1">
          ({rating.toFixed(1)})
        </span>
      )}
    </div>
  );
}

interface StarRatingInputProps {
  value: number;
  onChange: (rating: number) => void;
  maxRating?: number;
  size?: "sm" | "md" | "lg";
  label?: string;
  required?: boolean;
  error?: string;
  className?: string;
}

export function StarRatingInput({
  value,
  onChange,
  maxRating = 5,
  size = "md",
  label,
  required = false,
  error,
  className,
}: StarRatingInputProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <label className="text-sm font-medium leading-none">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}
      <StarRating
        rating={value}
        maxRating={maxRating}
        size={size}
        interactive
        onChange={onChange}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
