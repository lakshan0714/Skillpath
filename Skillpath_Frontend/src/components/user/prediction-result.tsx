"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  Activity,
  Minus,
  Target,
  TrendingDown,
  TrendingUp,
  Zap,
} from "lucide-react";

interface PredictionResultProps {
  result: any;
}

export default function PredictionResult({ result }: PredictionResultProps) {
  const getFinalRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case "BUY":
        return "bg-green-500 hover:bg-green-600";
      case "SELL":
        return "bg-red-500 hover:bg-red-600";
      case "HOLD":
        return "bg-yellow-500 hover:bg-yellow-600";
      default:
        return "bg-gray-500";
    }
  };

  const getRecommendationIcon = (recommendation: string) => {
    switch (recommendation) {
      case "BUY":
        return <TrendingUp className="h-4 w-4" />;
      case "SELL":
        return <TrendingDown className="h-4 w-4" />;
      case "HOLD":
        return <Minus className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getModelIcon = (modelKey: string) => {
    switch (modelKey) {
      case "model_1":
        return <Target className="h-5 w-5 text-blue-500" />;
      case "model_2":
        return <Activity className="h-5 w-5 text-green-500" />;
      case "model_3":
        return <Zap className="h-5 w-5 text-purple-500" />;
      default:
        return null;
    }
  };

  const getModelTitle = (modelKey: string) => {
    switch (modelKey) {
      case "model_1":
        return "Model 1: Valuation";
      case "model_2":
        return "Model 2: Financial Health";
      case "model_3":
        return "Model 3: Growth Trajectory";
      default:
        return "";
    }
  };

  const models = [
    { key: "model_1", data: result.model_1_valuation },
    { key: "model_2", data: result.model_2_health },
    { key: "model_3", data: result.model_3_growth },
  ];

  return (
    <div className="space-y-6">
      {/* Stock Info */}
      <Card>
        <CardHeader>
          <CardTitle>
            {result.stock_info.ticker} - {result.stock_info.company_name}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {result.stock_info.sector}
          </p>
        </CardHeader>
      </Card>

      {/* Final Recommendation */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Final Recommendation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Badge
              className={`${getFinalRecommendationColor(
                result.ensemble_prediction.final_recommendation
              )} text-lg px-4 py-2`}
            >
              {getRecommendationIcon(
                result.ensemble_prediction.final_recommendation
              )}
              <span className="ml-2">
                {result.ensemble_prediction.final_recommendation}
              </span>
            </Badge>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Confidence</p>
              <p className="text-2xl font-bold">
                {(result.ensemble_prediction.confidence * 100).toFixed(0)}%
              </p>
            </div>
          </div>

          <Progress
            value={result.ensemble_prediction.confidence * 100}
            className="h-2"
          />

          <div className="rounded-lg bg-muted p-4">
            <p className="text-sm font-medium mb-2">Reasoning:</p>
            <p className="text-sm text-muted-foreground">
              {result.ensemble_prediction.reasoning}
            </p>
          </div>

          {/* Top Contributing Factors */}
          <div>
            <p className="text-sm font-medium mb-2">
              Top Contributing Factors:
            </p>
            <div className="space-y-2">
              {result.ensemble_prediction.overall_top_features
                .slice(0, 5)
                .map((feature: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-muted-foreground">
                      {idx + 1}. {feature.name.replace(/_/g, " ")}
                    </span>
                    <span className="font-medium">
                      {feature.value.toFixed(4)} (
                      {(feature.impact * 100).toFixed(4)}%)
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Individual Model Predictions */}
      {models.map((model) => (
        <Card key={model.key}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getModelIcon(model.key)}
              {getModelTitle(model.key)}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Prediction</p>
                <p className="text-lg font-semibold">
                  {model.data.prediction}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Confidence</p>
                <p className="text-lg font-semibold">
                  {(model.data.confidence * 100).toFixed(0)}%
                </p>
              </div>
            </div>

            <Progress value={model.data.confidence * 100} className="h-1.5" />

            <div className="rounded-lg bg-muted p-3">
              <p className="text-sm text-muted-foreground">
                {model.data.reason}
              </p>
            </div>

            {/* Top Features */}
            <div>
              <p className="text-sm font-medium mb-2">Key Features:</p>
              <div className="space-y-1.5">
                {model.data.top_features.map((feature: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-muted-foreground">
                      {feature.name.replace(/_/g, " ")}
                    </span>
                    <span className="font-medium">
                      {feature.value.toFixed(4)} (
                      {(feature.impact * 100).toFixed(4)}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}