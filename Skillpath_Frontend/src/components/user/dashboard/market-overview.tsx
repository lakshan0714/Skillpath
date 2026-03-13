"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Clock, TrendingDown, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";

interface MarketIndex {
  name: string;
  symbol: string;
  value: number;
  change: number;
  changePercent: number;
}

export default function MarketOverview() {
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [marketStatus, setMarketStatus] = useState<"open" | "closed">("open");

  // Simulated market data (replace with real API if available)
  const marketIndices: MarketIndex[] = [
    {
      name: "S&P 500",
      symbol: "SPX",
      value: 4783.45,
      change: 21.54,
      changePercent: 0.45,
    },
    {
      name: "Dow Jones",
      symbol: "DJI",
      value: 37545.33,
      change: 86.21,
      changePercent: 0.23,
    },
    {
      name: "NASDAQ",
      symbol: "IXIC",
      value: 14843.77,
      change: -17.82,
      changePercent: -0.12,
    },
  ];

  useEffect(() => {
    // Update timestamp every minute
    const interval = setInterval(() => {
      setLastUpdated(new Date());
    }, 60000);

    // Check market hours (simplified - US market 9:30 AM - 4:00 PM ET)
    const checkMarketStatus = () => {
      const now = new Date();
      const hour = now.getHours();
      const day = now.getDay();
      
      // Weekend
      if (day === 0 || day === 6) {
        setMarketStatus("closed");
        return;
      }
      
      // Weekday hours (simplified, not accounting for timezone)
      if (hour >= 9 && hour < 16) {
        setMarketStatus("open");
      } else {
        setMarketStatus("closed");
      }
    };

    checkMarketStatus();
    const statusInterval = setInterval(checkMarketStatus, 60000);

    return () => {
      clearInterval(interval);
      clearInterval(statusInterval);
    };
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Market Overview
          </CardTitle>
          <div className="flex items-center gap-2">
            {marketStatus === "open" ? (
              <span className="flex items-center gap-1 text-xs text-green-600">
                <div className="h-2 w-2 rounded-full bg-green-600 animate-pulse" />
                Open
              </span>
            ) : (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <div className="h-2 w-2 rounded-full bg-gray-400" />
                Closed
              </span>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {marketIndices.map((index) => (
          <div
            key={index.symbol}
            className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
          >
            <div>
              <p className="font-semibold">{index.name}</p>
              <p className="text-sm text-muted-foreground">{index.symbol}</p>
            </div>
            <div className="text-right">
              <p className="font-semibold">
                {index.value.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
              <div
                className={`flex items-center gap-1 text-sm ${
                  index.change >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {index.change >= 0 ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                <span>
                  {index.change >= 0 ? "+" : ""}
                  {index.change.toFixed(2)} ({index.changePercent >= 0 ? "+" : ""}
                  {index.changePercent.toFixed(2)}%)
                </span>
              </div>
            </div>
          </div>
        ))}

        <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground pt-2">
          <Clock className="h-3 w-3" />
          <span>Last updated: {formatTime(lastUpdated)}</span>
        </div>

        <div className="rounded-lg bg-blue-50 dark:bg-blue-950 p-3 text-xs text-blue-900 dark:text-blue-100">
          <p className="font-medium mb-1">📊 Market Insight</p>
          <p>
            Market data is simulated for demonstration. Use our AI predictions
            for individual stock analysis.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}