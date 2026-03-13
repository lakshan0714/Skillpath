"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PredictionStats } from "@/types/dashboard";
import { Activity, Minus, TrendingDown, TrendingUp } from "lucide-react";

interface StatsCardsProps {
  stats: PredictionStats;
}

export default function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Predictions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Predictions
          </CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total}</div>
          <p className="text-xs text-muted-foreground">
            All time predictions
          </p>
        </CardContent>
      </Card>

      {/* BUY Signals */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">BUY Signals</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{stats.buy}</div>
          <p className="text-xs text-muted-foreground">
            {stats.buyPercentage.toFixed(1)}% of total
          </p>
        </CardContent>
      </Card>

      {/* SELL Signals */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">SELL Signals</CardTitle>
          <TrendingDown className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{stats.sell}</div>
          <p className="text-xs text-muted-foreground">
            {stats.sellPercentage.toFixed(1)}% of total
          </p>
        </CardContent>
      </Card>

      {/* HOLD Signals */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">HOLD Signals</CardTitle>
          <Minus className="h-4 w-4 text-yellow-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-600">{stats.hold}</div>
          <p className="text-xs text-muted-foreground">
            {stats.holdPercentage.toFixed(1)}% of total
          </p>
        </CardContent>
      </Card>
    </div>
  );
}