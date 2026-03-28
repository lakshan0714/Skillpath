"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePlanContext } from "@/context/PlanContext";
import { getDashboard } from "@/lib/api";
import { cn } from "@/lib/utils";
import {
  Calendar,
  CheckCircle2,
  Clock,
  Flame,
  Target,
  TrendingUp,
  XCircle,
  Zap,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

interface DashboardData {
  skill_name: string;
  level: string;
  total_lessons: number;
  completed_count: number;
  missed_count: number;
  regenerated_count: number;
  completion_percentage: number;
  streak: number;
  days_behind: number;
  health_status: string;
  original_end_date: string;
  current_end_date: string;
  start_date: string;
  recent_events: any[];
  current_week: {
    week_number: number;
    completed: number;
    total: number;
  };
}

const eventConfig: Record<string, any> = {
  completed: {
    icon: CheckCircle2,
    color: "text-green-500",
    bg: "bg-green-50",
    label: "Completed",
  },
  missed: {
    icon: XCircle,
    color: "text-red-500",
    bg: "bg-red-50",
    label: "Missed",
  },
  difficult: {
    icon: Flame,
    color: "text-orange-500",
    bg: "bg-orange-50",
    label: "Marked Difficult",
  },
  regenerated: {
    icon: Zap,
    color: "text-blue-500",
    bg: "bg-blue-50",
    label: "Lesson Regenerated",
  },
  extended: {
    icon: Clock,
    color: "text-purple-500",
    bg: "bg-purple-50",
    label: "Timeline Extended",
  },
};

function ProgressContent() {
  const searchParams = useSearchParams();
  const planParam = searchParams.get("plan");
  const { planId, loading: planLoading } = usePlanContext();
  const effectivePlanId = planParam ? parseInt(planParam) : planId;

  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (planLoading) return;
    if (!effectivePlanId) return;

    setLoading(true);
    getDashboard(effectivePlanId)
      .then((res: any) => setData(res))
      .finally(() => setLoading(false));
  }, [effectivePlanId, planLoading]);

  if (planLoading || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) return null;

  const pending =
    data.total_lessons - data.completed_count - data.missed_count;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-primary" />
          Progress
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {data.skill_name} · {data.level}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Overall Completion</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <div className="relative flex items-center justify-center">
              <svg width="140" height="140" viewBox="0 0 140 140">
                <circle
                  cx="70" cy="70" r="56"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="12"
                  className="text-muted"
                />
                <circle
                  cx="70" cy="70" r="56"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 56}`}
                  strokeDashoffset={`${2 * Math.PI * 56 * (1 - data.completion_percentage / 100)}`}
                  className="text-primary transition-all duration-700"
                  transform="rotate(-90 70 70)"
                />
              </svg>
              <div className="absolute text-center">
                <p className="text-3xl font-bold text-primary">
                  {data.completion_percentage}%
                </p>
                <p className="text-xs text-muted-foreground">complete</p>
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium">
                {data.completed_count} of {data.total_lessons} lessons
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {pending} remaining
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-2 grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{data.completed_count}</p>
                  <p className="text-xs text-muted-foreground">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-orange-100 flex items-center justify-center">
                  <Flame className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{data.streak}</p>
                  <p className="text-xs text-muted-foreground">Day Streak</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-red-100 flex items-center justify-center">
                  <XCircle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{data.missed_count}</p>
                  <p className="text-xs text-muted-foreground">Missed</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Zap className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{data.regenerated_count}</p>
                  <p className="text-xs text-muted-foreground">Regenerated</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            Timeline
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <p className="text-muted-foreground text-xs">Start Date</p>
              <p className="font-medium">
                {new Date(data.start_date).toLocaleDateString("en-US", {
                  month: "short", day: "numeric", year: "numeric",
                })}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground text-xs">Original Goal</p>
              <p className="font-medium">
                {new Date(data.original_end_date).toLocaleDateString("en-US", {
                  month: "short", day: "numeric", year: "numeric",
                })}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground text-xs">Current End Date</p>
              <p className={cn(
                "font-medium",
                data.days_behind > 0 ? "text-red-600" : "text-green-600"
              )}>
                {new Date(data.current_end_date).toLocaleDateString("en-US", {
                  month: "short", day: "numeric", year: "numeric",
                })}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground text-xs">Days Behind</p>
              <p className={cn(
                "font-medium",
                data.days_behind === 0 ? "text-green-600" : "text-red-600"
              )}>
                {data.days_behind === 0 ? "On track ✓" : `${data.days_behind} days`}
              </p>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Progress</span>
              <span>{data.completion_percentage}%</span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${data.completion_percentage}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {data.current_week && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              This Week — Week {data.current_week.week_number}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Lessons completed</span>
              <span className="font-medium">
                {data.current_week.completed} / {data.current_week.total}
              </span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all"
                style={{
                  width: `${Math.round(
                    (data.current_week.completed / data.current_week.total) * 100
                  )}%`,
                }}
              />
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Activity Log</CardTitle>
        </CardHeader>
        <CardContent>
          {data.recent_events && data.recent_events.length > 0 ? (
            <div className="space-y-3">
              {data.recent_events.map((event: any, i: number) => {
                const config =
                  eventConfig[event.event_type] || eventConfig.completed;
                const Icon = config.icon;
                return (
                  <div
                    key={i}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg",
                      config.bg
                    )}
                  >
                    <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
                      <Icon className={cn("h-4 w-4", config.color)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{config.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(event.triggered_at).toLocaleDateString(
                          "en-US",
                          {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </p>
                    </div>
                    {event.shift_amount > 0 && (
                      <span className="text-xs text-muted-foreground flex-shrink-0">
                        +{event.shift_amount} day
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-6">
              No activity yet. Start your first lesson!
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function ProgressPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-64">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ProgressContent />
    </Suspense>
  );
}