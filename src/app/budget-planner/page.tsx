"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Hotel,
  Compass,
  UtensilsCrossed,
  ShoppingBag,
  Car,
  Wallet,
  TrendingUp,
  ArrowRight,
} from "lucide-react";

const CHART_COLORS = [
  "hsl(221, 83%, 53%)",  // Blue - Accommodation
  "hsl(142, 71%, 45%)",  // Green - Activities
  "hsl(38, 92%, 50%)",   // Amber - Dining
  "hsl(280, 67%, 55%)",  // Purple - Shopping
  "hsl(0, 72%, 51%)",    // Red - Transportation
];

interface Category {
  key: string;
  label: string;
  icon: React.ReactNode;
  defaultPercent: number;
  color: string;
}

const CATEGORIES: Category[] = [
  {
    key: "accommodation",
    label: "Accommodation",
    icon: <Hotel className="h-4 w-4" />,
    defaultPercent: 40,
    color: CHART_COLORS[0],
  },
  {
    key: "activities",
    label: "Activities & Tours",
    icon: <Compass className="h-4 w-4" />,
    defaultPercent: 20,
    color: CHART_COLORS[1],
  },
  {
    key: "dining",
    label: "Dining",
    icon: <UtensilsCrossed className="h-4 w-4" />,
    defaultPercent: 20,
    color: CHART_COLORS[2],
  },
  {
    key: "shopping",
    label: "Shopping",
    icon: <ShoppingBag className="h-4 w-4" />,
    defaultPercent: 10,
    color: CHART_COLORS[3],
  },
  {
    key: "transportation",
    label: "Transportation",
    icon: <Car className="h-4 w-4" />,
    defaultPercent: 10,
    color: CHART_COLORS[4],
  },
];

function getAccommodationTier(dailyBudget: number) {
  if (dailyBudget >= 200) {
    return {
      tier: "Luxury Resorts",
      description:
        "5-star overwater villas, premium resorts, and world-class service at iconic Maldivian properties.",
      badge: "Premium",
    };
  }
  if (dailyBudget >= 50) {
    return {
      tier: "Island Guesthouses",
      description:
        "Comfortable guesthouses and boutique stays on local islands with authentic Maldivian hospitality.",
      badge: "Popular",
    };
  }
  return {
    tier: "Budget Stays",
    description:
      "Affordable guesthouses, hostels, and budget-friendly stays on local islands.",
    badge: "Value",
  };
}

function getActivitiesTier(budget: number) {
  if (budget >= 3000) {
    return {
      tier: "Premium Experiences",
      description:
        "Private diving excursions, seaplane tours, luxury yacht cruises, and underwater dining experiences.",
      badge: "Exclusive",
    };
  }
  if (budget >= 1000) {
    return {
      tier: "Popular Activities",
      description:
        "Snorkeling trips, dolphin watching, island hopping tours, and guided reef excursions.",
      badge: "Popular",
    };
  }
  return {
    tier: "Free & Budget Activities",
    description:
      "Beach visits, local island exploration, sandbank trips, and self-guided snorkeling.",
    badge: "Value",
  };
}

function getDiningTier(budget: number) {
  if (budget >= 2000) {
    return {
      tier: "Fine Dining",
      description:
        "Overwater restaurants, underwater dining, and resort chef-curated tasting menus.",
      badge: "Gourmet",
    };
  }
  if (budget >= 800) {
    return {
      tier: "Casual Dining",
      description:
        "Resort restaurants, beachside grills, and local island eateries with fresh seafood.",
      badge: "Popular",
    };
  }
  return {
    tier: "Local Cafes & Eateries",
    description:
      "Local island cafes, Maldivian home-cooked meals, and affordable seafood spots.",
    badge: "Value",
  };
}

function getShoppingTier(budget: number) {
  if (budget >= 2000) {
    return {
      tier: "Luxury Shopping",
      description:
        "Resort boutiques, designer shops, and premium Maldivian crafts and jewelry.",
      badge: "Luxury",
    };
  }
  if (budget >= 500) {
    return {
      tier: "Resort & Island Shopping",
      description:
        "Resort gift shops, island souvenir stores, and handmade Maldivian goods.",
      badge: "Popular",
    };
  }
  return {
    tier: "Local Market Shopping",
    description:
      "Local island markets, handcrafted souvenirs, and traditional lacquerware.",
    badge: "Value",
  };
}

function getTransportTier(budget: number) {
  if (budget >= 1500) {
    return {
      tier: "Seaplane & Speedboat",
      description:
        "Seaplane transfers, private speedboat charters, and luxury yacht transfers between islands.",
      badge: "Premium",
    };
  }
  if (budget >= 500) {
    return {
      tier: "Speedboat Transfers",
      description:
        "Shared speedboat transfers, resort boat services, and inter-island ferry rides.",
      badge: "Convenient",
    };
  }
  return {
    tier: "Public Ferries",
    description:
      "Public ferries, local dhoni boats, and shared transport between nearby islands.",
    badge: "Smart",
  };
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; payload: { fill: string; amount: number } }>;
}) {
  if (!active || !payload?.length) return null;
  const data = payload[0];
  return (
    <div className="rounded-lg border bg-background p-3 shadow-md">
      <p className="font-medium">{data.name}</p>
      <p className="text-sm text-muted-foreground">
        {data.value}% &middot; USD {data.payload.amount.toLocaleString()}
      </p>
    </div>
  );
}

export default function BudgetPlannerPage() {
  const [totalBudget, setTotalBudget] = useState(10000);
  const [allocations, setAllocations] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    CATEGORIES.forEach((cat) => {
      initial[cat.key] = cat.defaultPercent;
    });
    return initial;
  });

  const handleBudgetChange = useCallback((value: string) => {
    const num = parseInt(value, 10);
    if (!isNaN(num) && num >= 0) {
      setTotalBudget(Math.min(num, 999999));
    } else if (value === "") {
      setTotalBudget(0);
    }
  }, []);

  const handleAllocationChange = useCallback(
    (key: string, newValue: number) => {
      setAllocations((prev) => {
        const otherKeys = CATEGORIES.filter((c) => c.key !== key).map(
          (c) => c.key
        );
        const currentOtherTotal = otherKeys.reduce(
          (sum, k) => sum + prev[k],
          0
        );
        const clampedValue = Math.min(newValue, 100);
        const remaining = 100 - clampedValue;

        const next: Record<string, number> = { ...prev, [key]: clampedValue };

        if (currentOtherTotal > 0) {
          otherKeys.forEach((k) => {
            next[k] = Math.round((prev[k] / currentOtherTotal) * remaining);
          });
        } else {
          const equalShare = Math.floor(remaining / otherKeys.length);
          otherKeys.forEach((k, i) => {
            next[k] =
              i === otherKeys.length - 1
                ? remaining - equalShare * (otherKeys.length - 1)
                : equalShare;
          });
        }

        // Fix rounding errors
        const total = Object.values(next).reduce((sum, v) => sum + v, 0);
        if (total !== 100 && otherKeys.length > 0) {
          next[otherKeys[otherKeys.length - 1]] += 100 - total;
        }

        return next;
      });
    },
    []
  );

  const chartData = useMemo(
    () =>
      CATEGORIES.map((cat) => ({
        name: cat.label,
        value: allocations[cat.key],
        amount: Math.round((allocations[cat.key] / 100) * totalBudget),
        fill: cat.color,
      })),
    [allocations, totalBudget]
  );

  const categoryAmounts = useMemo(() => {
    const result: Record<string, number> = {};
    CATEGORIES.forEach((cat) => {
      result[cat.key] = Math.round(
        (allocations[cat.key] / 100) * totalBudget
      );
    });
    return result;
  }, [allocations, totalBudget]);

  const recommendations = useMemo(
    () => [
      {
        ...CATEGORIES[0],
        ...getAccommodationTier(categoryAmounts.accommodation),
        amount: categoryAmounts.accommodation,
      },
      {
        ...CATEGORIES[1],
        ...getActivitiesTier(categoryAmounts.activities),
        amount: categoryAmounts.activities,
      },
      {
        ...CATEGORIES[2],
        ...getDiningTier(categoryAmounts.dining),
        amount: categoryAmounts.dining,
      },
      {
        ...CATEGORIES[3],
        ...getShoppingTier(categoryAmounts.shopping),
        amount: categoryAmounts.shopping,
      },
      {
        ...CATEGORIES[4],
        ...getTransportTier(categoryAmounts.transportation),
        amount: categoryAmounts.transportation,
      },
    ],
    [categoryAmounts]
  );

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/10 via-background to-primary/5 py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border bg-background/80 px-4 py-1.5 text-sm font-medium text-muted-foreground mb-6 backdrop-blur-sm">
            <Wallet className="h-4 w-4" />
            Smart Planning Tool
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4">
            Plan Your Maldives Budget
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Set your total budget and customize how you want to spend across
            accommodation, activities, dining, shopping, and transportation in the Maldives.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          {/* Total Budget Input */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                Total Trip Budget
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <Label htmlFor="total-budget" className="shrink-0 text-base">
                    Budget (USD)
                  </Label>
                  <div className="w-full max-w-xs">
                    <Input
                      id="total-budget"
                      type="number"
                      min={0}
                      max={999999}
                      value={totalBudget || ""}
                      onChange={(e) => handleBudgetChange(e.target.value)}
                      className="text-lg font-semibold"
                      placeholder="Enter your budget"
                    />
                  </div>
                  <span className="text-sm text-muted-foreground">
                    ≈ MVR{" "}
                    {Math.round(totalBudget * 15.42).toLocaleString()}
                  </span>
                </div>
                <Slider
                  value={[totalBudget]}
                  onValueChange={(val) => setTotalBudget(val[0])}
                  min={0}
                  max={100000}
                  step={500}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>USD 0</span>
                  <span>USD 25,000</span>
                  <span>USD 50,000</span>
                  <span>USD 75,000</span>
                  <span>USD 100,000</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Budget Allocation + Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Allocation Sliders */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Budget Allocation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {CATEGORIES.map((cat) => (
                    <div key={cat.key} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="flex items-center gap-2">
                          <span
                            className="inline-flex h-3 w-3 rounded-full"
                            style={{ backgroundColor: cat.color }}
                          />
                          {cat.icon}
                          {cat.label}
                        </Label>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="font-mono">
                            {allocations[cat.key]}%
                          </Badge>
                          <span className="text-sm font-medium w-24 text-right">
                            USD{" "}
                            {categoryAmounts[cat.key]?.toLocaleString() ?? "0"}
                          </span>
                        </div>
                      </div>
                      <Slider
                        value={[allocations[cat.key]]}
                        onValueChange={(val) =>
                          handleAllocationChange(cat.key, val[0])
                        }
                        min={0}
                        max={100}
                        step={1}
                        className="w-full"
                      />
                    </div>
                  ))}
                  <Separator />
                  <div className="flex items-center justify-between font-semibold">
                    <span>Total</span>
                    <span>
                      {Object.values(allocations).reduce((a, b) => a + b, 0)}%
                      &middot; USD {totalBudget.toLocaleString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Budget Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[350px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={80}
                        outerRadius={140}
                        paddingAngle={2}
                        dataKey="value"
                        nameKey="name"
                        strokeWidth={2}
                        stroke="hsl(0, 0%, 100%)"
                      >
                        {chartData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.fill}
                            className="outline-none focus:outline-none"
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                {/* Chart Legend */}
                <div className="grid grid-cols-2 gap-3 mt-4">
                  {CATEGORIES.map((cat) => (
                    <div key={cat.key} className="flex items-center gap-2 text-sm">
                      <span
                        className="inline-block h-3 w-3 rounded-full shrink-0"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span className="truncate">{cat.label}</span>
                      <span className="ml-auto font-medium text-muted-foreground">
                        {allocations[cat.key]}%
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Suggestions Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-6">
              Personalized Suggestions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendations.map((rec) => (
                <Card key={rec.key} className="relative overflow-hidden">
                  <div
                    className="absolute top-0 left-0 h-1 w-full"
                    style={{ backgroundColor: rec.color }}
                  />
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-base">
                        {rec.icon}
                        {rec.label}
                      </CardTitle>
                      <Badge variant="outline">{rec.badge}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <p className="font-semibold text-lg">{rec.tier}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {rec.description}
                        </p>
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Allocated
                        </span>
                        <span className="font-semibold">
                          USD {rec.amount.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Summary Card */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                Budget Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {CATEGORIES.map((cat) => (
                  <div key={cat.key}>
                    <div className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-3">
                        <span
                          className="inline-flex h-3 w-3 rounded-full"
                          style={{ backgroundColor: cat.color }}
                        />
                        <span className="flex items-center gap-2">
                          {cat.icon}
                          {cat.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge variant="secondary" className="font-mono">
                          {allocations[cat.key]}%
                        </Badge>
                        <span className="font-semibold w-28 text-right">
                          USD{" "}
                          {categoryAmounts[cat.key]?.toLocaleString() ?? "0"}
                        </span>
                      </div>
                    </div>
                    <Separator />
                  </div>
                ))}
                <div className="flex items-center justify-between pt-2">
                  <span className="text-lg font-bold">Total Budget</span>
                  <span className="text-lg font-bold">
                    USD {totalBudget.toLocaleString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link
                href={`/properties?maxPrice=${categoryAmounts.accommodation}`}
              >
                Find Properties in Budget
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link
                href={`/activities?maxPrice=${categoryAmounts.activities}`}
              >
                Find Activities in Budget
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
