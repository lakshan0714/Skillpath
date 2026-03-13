"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import {
    Activity,
    AlertCircle,
    Eye,
    History,
    Minus,
    RefreshCw,
    Target,
    TrendingDown,
    TrendingUp,
    Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Prediction {
  id: number;
  ticker: string;
  company_name: string;
  sector: string;
  final_recommendation: string;
  final_confidence: number;
  predicted_at: string;
  
  // Model predictions
  model_1_prediction: string;
  model_1_confidence: number;
  model_1_reason: string;
  model_1_top_features: any[];
  
  model_2_prediction: string;
  model_2_confidence: number;
  model_2_reason: string;
  model_2_top_features: any[];
  
  model_3_prediction: string;
  model_3_confidence: number;
  model_3_reason: string;
  model_3_top_features: any[];
  
  final_reasoning: string;
  overall_top_features: any[];
}

export default function PredictionHistory() {
  const BACKEND_HOST = process.env.NEXT_PUBLIC_BACKEND_HOST;
  const BACKEND_PORT = process.env.NEXT_PUBLIC_BACKEND_PORT;
  const API_URL = `http://${BACKEND_HOST}:${BACKEND_PORT}`;

  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPrediction, setSelectedPrediction] = useState<Prediction | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/predict/history?limit=50`, {
        credentials: "include",
      });

      const result = await response.json();

      if (response.ok && result.data) {
        setPredictions(result.data);
        setTotal(result.total || result.data.length);
      } else {
        toast.error("Failed to fetch prediction history");
      }
    } catch (error) {
      console.error("Fetch history error:", error);
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  const viewDetails = async (predictionId: number) => {
    try {
      const response = await fetch(
        `${API_URL}/predict/history/${predictionId}`,
        {
          credentials: "include",
        }
      );

      const result = await response.json();

      if (response.ok && result.data) {
        setSelectedPrediction(result.data);
        setDialogOpen(true);
      } else {
        toast.error("Failed to fetch prediction details");
      }
    } catch (error) {
      console.error("Fetch details error:", error);
      toast.error("Network error");
    }
  };

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
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Prediction History
            </CardTitle>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Total: {total}
              </span>
              <Button variant="outline" size="sm" onClick={fetchHistory}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : predictions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mb-2" />
              <p className="text-lg font-medium">No predictions yet</p>
              <p className="text-sm text-muted-foreground">
                Make your first prediction to see it here
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Sector</TableHead>
                    <TableHead>Recommendation</TableHead>
                    <TableHead>Confidence</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {predictions.map((prediction) => (
                    <TableRow key={prediction.id}>
                      <TableCell>
                        {format(
                          new Date(prediction.predicted_at),
                          "MMM dd, yyyy HH:mm"
                        )}
                      </TableCell>
                      <TableCell className="font-medium">
                        {prediction.ticker}
                      </TableCell>
                      <TableCell>{prediction.company_name}</TableCell>
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
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => viewDetails(prediction.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Prediction Details Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>
              Prediction Details - {selectedPrediction?.ticker}
            </DialogTitle>
            <DialogDescription>
              {selectedPrediction?.company_name} (
              {selectedPrediction?.sector || "Unknown Sector"})
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[calc(90vh-150px)]">
            {selectedPrediction && (
              <div className="space-y-6 pr-4">
                {/* Final Recommendation */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Final Recommendation
                  </h3>
                  <div className="rounded-lg border p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      {getRecommendationBadge(
                        selectedPrediction.final_recommendation
                      )}
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">
                          Confidence
                        </p>
                        <p className="text-xl font-bold">
                          {(selectedPrediction.final_confidence * 100).toFixed(
                            0
                          )}
                          %
                        </p>
                      </div>
                    </div>
                    <Progress
                      value={selectedPrediction.final_confidence * 100}
                      className="h-2"
                    />
                    <div className="rounded-lg bg-muted p-3">
                      <p className="text-sm text-muted-foreground">
                        {selectedPrediction.final_reasoning}
                      </p>
                    </div>

                    {/* Overall Top Features */}
                    {selectedPrediction.overall_top_features &&
                      selectedPrediction.overall_top_features.length > 0 && (
                        <div>
                          <p className="text-sm font-medium mb-2">
                            Top Contributing Factors:
                          </p>
                          <div className="space-y-1.5">
                            {selectedPrediction.overall_top_features.map(
                              (feature: any, idx: number) => (
                                <div
                                  key={idx}
                                  className="flex items-center justify-between text-sm"
                                >
                                  <span className="text-muted-foreground">
                                    {idx + 1}.{" "}
                                    {feature.name.replace(/_/g, " ")}
                                  </span>
                                  <span className="font-medium">
                                    {feature.value.toFixed(2)} (
                                    {(feature.impact * 100).toFixed(1)}%)
                                  </span>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}
                  </div>
                </div>

                <Separator />

                {/* Model 1: Valuation */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Target className="h-5 w-5 text-blue-500" />
                    Model 1: Valuation
                  </h3>
                  <div className="rounded-lg border p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Prediction
                        </p>
                        <p className="text-lg font-semibold">
                          {selectedPrediction.model_1_prediction}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">
                          Confidence
                        </p>
                        <p className="text-lg font-semibold">
                          {(selectedPrediction.model_1_confidence * 100).toFixed(
                            0
                          )}
                          %
                        </p>
                      </div>
                    </div>
                    <Progress
                      value={selectedPrediction.model_1_confidence * 100}
                      className="h-1.5"
                    />
                    <div className="rounded-lg bg-muted p-3">
                      <p className="text-sm text-muted-foreground">
                        {selectedPrediction.model_1_reason}
                      </p>
                    </div>
                    {selectedPrediction.model_1_top_features &&
                      selectedPrediction.model_1_top_features.length > 0 && (
                        <div>
                          <p className="text-sm font-medium mb-2">
                            Key Features:
                          </p>
                          <div className="space-y-1.5">
                            {selectedPrediction.model_1_top_features.map(
                              (feature: any, idx: number) => (
                                <div
                                  key={idx}
                                  className="flex items-center justify-between text-sm"
                                >
                                  <span className="text-muted-foreground">
                                    {feature.name.replace(/_/g, " ")}
                                  </span>
                                  <span className="font-medium">
                                    {feature.value.toFixed(2)} (
                                    {(feature.impact * 100).toFixed(1)}%)
                                  </span>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}
                  </div>
                </div>

                {/* Model 2: Financial Health */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Activity className="h-5 w-5 text-green-500" />
                    Model 2: Financial Health
                  </h3>
                  <div className="rounded-lg border p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Prediction
                        </p>
                        <p className="text-lg font-semibold">
                          {selectedPrediction.model_2_prediction}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">
                          Confidence
                        </p>
                        <p className="text-lg font-semibold">
                          {(selectedPrediction.model_2_confidence * 100).toFixed(
                            0
                          )}
                          %
                        </p>
                      </div>
                    </div>
                    <Progress
                      value={selectedPrediction.model_2_confidence * 100}
                      className="h-1.5"
                    />
                    <div className="rounded-lg bg-muted p-3">
                      <p className="text-sm text-muted-foreground">
                        {selectedPrediction.model_2_reason}
                      </p>
                    </div>
                    {selectedPrediction.model_2_top_features &&
                      selectedPrediction.model_2_top_features.length > 0 && (
                        <div>
                          <p className="text-sm font-medium mb-2">
                            Key Features:
                          </p>
                          <div className="space-y-1.5">
                            {selectedPrediction.model_2_top_features.map(
                              (feature: any, idx: number) => (
                                <div
                                  key={idx}
                                  className="flex items-center justify-between text-sm"
                                >
                                  <span className="text-muted-foreground">
                                    {feature.name.replace(/_/g, " ")}
                                  </span>
                                  <span className="font-medium">
                                    {feature.value.toFixed(2)} (
                                    {(feature.impact * 100).toFixed(1)}%)
                                  </span>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}
                  </div>
                </div>

                {/* Model 3: Growth Trajectory */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Zap className="h-5 w-5 text-purple-500" />
                    Model 3: Growth Trajectory
                  </h3>
                  <div className="rounded-lg border p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Prediction
                        </p>
                        <p className="text-lg font-semibold">
                          {selectedPrediction.model_3_prediction}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">
                          Confidence
                        </p>
                        <p className="text-lg font-semibold">
                          {(selectedPrediction.model_3_confidence * 100).toFixed(
                            0
                          )}
                          %
                        </p>
                      </div>
                    </div>
                    <Progress
                      value={selectedPrediction.model_3_confidence * 100}
                      className="h-1.5"
                    />
                    <div className="rounded-lg bg-muted p-3">
                      <p className="text-sm text-muted-foreground">
                        {selectedPrediction.model_3_reason}
                      </p>
                    </div>
                    {selectedPrediction.model_3_top_features &&
                      selectedPrediction.model_3_top_features.length > 0 && (
                        <div>
                          <p className="text-sm font-medium mb-2">
                            Key Features:
                          </p>
                          <div className="space-y-1.5">
                            {selectedPrediction.model_3_top_features.map(
                              (feature: any, idx: number) => (
                                <div
                                  key={idx}
                                  className="flex items-center justify-between text-sm"
                                >
                                  <span className="text-muted-foreground">
                                    {feature.name.replace(/_/g, " ")}
                                  </span>
                                  <span className="font-medium">
                                    {feature.value.toFixed(2)} (
                                    {(feature.impact * 100).toFixed(1)}%)
                                  </span>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}
                  </div>
                </div>

                {/* Metadata */}
                <div className="rounded-lg bg-muted p-4">
                  <p className="text-xs text-muted-foreground">
                    Predicted on:{" "}
                    {format(
                      new Date(selectedPrediction.predicted_at),
                      "MMMM dd, yyyy 'at' HH:mm:ss"
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Prediction ID: {selectedPrediction.id}
                  </p>
                </div>
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}