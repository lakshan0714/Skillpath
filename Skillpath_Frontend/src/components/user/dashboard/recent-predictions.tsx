"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { RecentPrediction } from "@/types/dashboard";
import { format } from "date-fns";
import {
    AlertCircle,
    ArrowRight,
    History,
    Minus,
    RefreshCw,
    TrendingDown,
    TrendingUp,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { JSX } from "react";

interface RecentPredictionsProps {
  predictions: RecentPrediction[];
  onRefresh: () => void;
}

export default function RecentPredictions({
  predictions,
  onRefresh,
}: RecentPredictionsProps) {
  const router = useRouter();

  const getRecommendationBadge = (recommendation: string) => {
    const variants: Record<string, string> = {
      BUY: "bg-green-500 hover:bg-green-600",
      SELL: "bg-red-500 hover:bg-red-600",
      HOLD: "bg-yellow-500 hover:bg-yellow-600",
    };

    const icons: Record<string, JSX.Element> = {
      BUY: <TrendingUp className="h-3 w-3" />,
      SELL: <TrendingDown className="h-3 w-3" />,
      HOLD: <Minus className="h-3 w-3" />,
    };

    return (
      <Badge className={variants[recommendation] || "bg-gray-500"}>
        {icons[recommendation]}
        <span className="ml-1">{recommendation}</span>
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Recent Predictions
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onRefresh}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/user/prediction?tab=history")}
            >
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {predictions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-2" />
            <p className="text-lg font-medium">No predictions yet</p>
            <p className="text-sm text-muted-foreground mb-4">
              Make your first prediction to see it here
            </p>
            <Button onClick={() => router.push("/user/prediction")}>
              <TrendingUp className="mr-2 h-4 w-4" />
              New Prediction
            </Button>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Sector</TableHead>
                  <TableHead>Recommendation</TableHead>
                  <TableHead>Confidence</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {predictions.map((prediction) => (
                  <TableRow key={prediction.id}>
                    <TableCell>
                      {format(new Date(prediction.predicted_at), "MMM dd, HH:mm")}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{prediction.ticker}</div>
                      <div className="text-xs text-muted-foreground">
                        {prediction.company_name}
                      </div>
                    </TableCell>
                    <TableCell>{prediction.sector || "-"}</TableCell>
                    <TableCell>
                      {getRecommendationBadge(prediction.final_recommendation)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress
                          value={prediction.final_confidence * 100}
                          className="h-2 w-16"
                        />
                        <span className="text-sm">
                          {(prediction.final_confidence * 100).toFixed(0)}%
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}