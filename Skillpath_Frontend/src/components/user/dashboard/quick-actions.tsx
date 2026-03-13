"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { History, TrendingUp, Zap } from "lucide-react";
import { useRouter } from "next/navigation";

export default function QuickActions() {
  const router = useRouter();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3">
        <Button
          size="lg"
          className="w-full justify-start h-auto py-4"
          onClick={() => router.push("/dashboard/prediction")}
        >
          <TrendingUp className="mr-3 h-5 w-5" />
          <div className="text-left">
            <p className="font-semibold">New Prediction</p>
            <p className="text-xs opacity-80">Get AI-powered stock analysis</p>
          </div>
        </Button>

        <Button
          size="lg"
          variant="outline"
          className="w-full justify-start h-auto py-4"
          onClick={() => router.push("/dashboard/prediction?tab=history")}
        >
          <History className="mr-3 h-5 w-5" />
          <div className="text-left">
            <p className="font-semibold">View History</p>
            <p className="text-xs opacity-60">See all past predictions</p>
          </div>
        </Button>
      </CardContent>
    </Card>
  );
}