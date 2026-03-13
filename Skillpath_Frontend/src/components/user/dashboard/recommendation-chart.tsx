"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PredictionStats } from "@/types/dashboard";
import { Minus, TrendingDown, TrendingUp } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

interface RecommendationChartProps {
  stats: PredictionStats;
}

export default function RecommendationChart({ stats }: RecommendationChartProps) {
  const data = [
    { name: "BUY", value: stats.buy, color: "#22c55e" },
    { name: "SELL", value: stats.sell, color: "#ef4444" },
    { name: "HOLD", value: stats.hold, color: "#eab308" },
  ].filter((item) => item.value > 0); // Only show non-zero values

  const COLORS = {
    BUY: "#22c55e",
    SELL: "#ef4444",
    HOLD: "#eab308",
  };

  const renderCustomLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
    const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        className="font-semibold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  if (stats.total === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recommendation Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            <p>No data to display</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recommendation Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomLabel}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>

        <div className="mt-4 space-y-2">
          {stats.buy > 0 && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-green-500" />
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium">BUY</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {stats.buy} ({stats.buyPercentage.toFixed(1)}%)
              </span>
            </div>
          )}
          {stats.sell > 0 && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-red-500" />
                <TrendingDown className="h-4 w-4 text-red-500" />
                <span className="text-sm font-medium">SELL</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {stats.sell} ({stats.sellPercentage.toFixed(1)}%)
              </span>
            </div>
          )}
          {stats.hold > 0 && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-yellow-500" />
                <Minus className="h-4 w-4 text-yellow-500" />
                <span className="text-sm font-medium">HOLD</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {stats.hold} ({stats.holdPercentage.toFixed(1)}%)
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}