"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePlanContext } from "@/context/PlanContext";
import { getDashboard } from "@/lib/api";
import {
  AlertTriangle,
  BookOpen,
  CalendarCheck,
  CheckCircle2,
  ChevronRight,
  Clock,
  Flame,
  TrendingUp,
  XCircle,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";


interface DashboardData {
  has_plan: boolean;
  plan_id: number;
  skill_name: string;
  level: string;
  completion_percentage: number;
  total_lessons: number;
  completed_count: number;
  missed_count: number;
  regenerated_count: number;
  streak: number;
  days_behind: number;
  health_status: "green" | "yellow" | "red";
  today_lesson: any;
  recent_events: any[];
  current_week: {
    week_number: number;
    completed: number;
    total: number;
  };
  original_end_date: string;
  current_end_date: string;
}

const healthConfig = {
  green: {
    label: "On Track",
    color: "text-green-600",
    bg: "bg-green-50 border-green-200",
    dot: "bg-green-500",
  },
  yellow: {
    label: "1 Day Behind",
    color: "text-yellow-600",
    bg: "bg-yellow-50 border-yellow-200",
    dot: "bg-yellow-500",
  },
  red: {
    label: "Behind Schedule",
    color: "text-red-600",
    bg: "bg-red-50 border-red-200",
    dot: "bg-red-500",
  },
};

const eventIcons: Record<string, any> = {
  completed: { icon: CheckCircle2, color: "text-green-500" },
  missed: { icon: XCircle, color: "text-red-500" },
  difficult: { icon: Flame, color: "text-orange-500" },
  regenerated: { icon: Zap, color: "text-blue-500" },
  extended: { icon: Clock, color: "text-purple-500" },
};

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
 // Replace with
const { planId, loading: planLoading } = usePlanContext();
const searchParams = useSearchParams();
const planParam = searchParams.get("plan");
const effectivePlanId = planParam ? parseInt(planParam) : planId;


useEffect(() => {
  if (planLoading) return;

  if (!effectivePlanId) {
    router.push("/onboarding");
    return;
  }

  setLoading(true);
  getDashboard(effectivePlanId)
    .then((res: any) => {
      if (!res.has_plan) {
        router.push("/onboarding");
        return;
      }
      setData(res);
    })
    .catch(() => router.push("/onboarding"))
    .finally(() => setLoading(false));
}, [effectivePlanId, planLoading]);



  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) return null;

  const health = healthConfig[data.health_status];
  const weekProgress = data.current_week
    ? Math.round((data.current_week.completed / data.current_week.total) * 100)
    : 0;

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{data.skill_name}</h1>
          <p className="text-muted-foreground capitalize text-sm mt-1">
            {data.level} · {data.total_lessons} lessons total
          </p>
        </div>
        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium ${health.bg} ${health.color}`}>
          <div className={`h-2 w-2 rounded-full ${health.dot}`} />
          {health.label}
        </div>
      </div>

      {/* Red alert — extend timeline */}
      {data.health_status === "red" && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
          <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-700">
              You are {data.days_behind} days behind your goal.
            </p>
            <p className="text-xs text-red-600">Consider extending your timeline.</p>
          </div>
          <Link href="/user_dashboard/settings">
            <Button size="sm" variant="destructive">
              Extend
            </Button>
          </Link>
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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

      {/* Progress + Today's lesson */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Overall progress */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Overall Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Completion</span>
              <span className="font-bold text-primary">
                {data.completion_percentage}%
              </span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${data.completion_percentage}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {data.completed_count} of {data.total_lessons} lessons done
            </p>

            {/* Week progress */}
            {data.current_week && (
              <div className="pt-2 border-t">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-muted-foreground">
                    Week {data.current_week.week_number}
                  </span>
                  <span className="font-medium">
                    {data.current_week.completed}/{data.current_week.total}
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all"
                    style={{ width: `${weekProgress}%` }}
                  />
                </div>
              </div>
            )}

            <div className="flex justify-between text-xs text-muted-foreground pt-1">
              <span>
                Goal: {new Date(data.original_end_date).toLocaleDateString()}
              </span>
              {data.days_behind > 0 && (
                <span className="text-red-500">
                  +{data.days_behind} days
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Today's lesson */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <CalendarCheck className="h-4 w-4 text-primary" />
              Today's Lesson
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.today_lesson ? (
              <div className="space-y-4">
                <div>
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-semibold leading-tight">
                      {data.today_lesson.topic}
                    </h3>
                    <Badge
                      variant={
                        data.today_lesson.difficulty === "easy"
                          ? "secondary"
                          : data.today_lesson.difficulty === "medium"
                          ? "outline"
                          : "destructive"
                      }
                      className="capitalize flex-shrink-0"
                    >
                      {data.today_lesson.difficulty}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {data.today_lesson.phase} ·{" "}
                    {data.today_lesson.estimated_minutes} min
                  </p>
                </div>
                <Link href="/user_dashboard/today">
                  <Button className="w-full gap-2">
                    Open Today's Lesson
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="text-center py-6 space-y-2">
                <BookOpen className="h-10 w-10 text-muted-foreground mx-auto" />
                <p className="text-sm font-medium">No lesson today</p>
                <p className="text-xs text-muted-foreground">
                  Check your roadmap for upcoming lessons
                </p>
                <Link href="/user_dashboard/roadmap">
                  <Button variant="outline" size="sm" className="mt-2">
                    View Roadmap
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent activity */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {data.recent_events && data.recent_events.length > 0 ? (
            <div className="space-y-3">
              {data.recent_events.map((event: any, i: number) => {
                const config = eventIcons[event.event_type] || eventIcons.completed;
                const Icon = config.icon;
                return (
                  <div key={i} className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                      <Icon className={`h-4 w-4 ${config.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium capitalize">
                        {event.event_type}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(event.triggered_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No activity yet. Start your first lesson!
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

