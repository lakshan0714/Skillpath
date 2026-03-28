"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePlanContext } from "@/context/PlanContext";
import { getRoadmap } from "@/lib/api";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Circle,
  Clock,
  Flame,
  Map,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

interface Lesson {
  id: number;
  day_number: number;
  topic: string;
  phase: string;
  difficulty: string;
  estimated_minutes: number;
  status: string;
  scheduled_date: string;
  is_regenerated: boolean;
}

interface Week {
  week_number: number;
  lessons: Lesson[];
}

const difficultyConfig: Record<string, any> = {
  easy: { label: "Easy", variant: "secondary" },
  medium: { label: "Medium", variant: "outline" },
  hard: { label: "Hard", variant: "destructive" },
};

const statusIcon: Record<string, any> = {
  completed: <CheckCircle2 className="h-5 w-5 text-green-500" />,
  missed: <XCircle className="h-5 w-5 text-red-500" />,
  difficult: <Flame className="h-5 w-5 text-orange-500" />,
  pending: <Circle className="h-5 w-5 text-muted-foreground" />,
};

function RoadmapContent() {
  const searchParams = useSearchParams();
  const planParam = searchParams.get("plan");
  const { planId, loading: planLoading } = usePlanContext();
  const effectivePlanId = planParam ? parseInt(planParam) : planId;

  const [weeks, setWeeks] = useState<Week[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedWeeks, setExpandedWeeks] = useState<number[]>([1]);

  useEffect(() => {
    if (planLoading) return;
    if (!effectivePlanId) return;

    setLoading(true);
    getRoadmap(effectivePlanId)
      .then((res: any) => {
        setWeeks(res.weeks || []);
        // Auto expand current week
        const firstPending = res.weeks?.find((w: Week) =>
          w.lessons.some((l) => l.status === "pending")
        );
        if (firstPending) {
          setExpandedWeeks([firstPending.week_number]);
        }
      })
      .finally(() => setLoading(false));
  }, [effectivePlanId, planLoading]);

  const toggleWeek = (weekNum: number) => {
    setExpandedWeeks((prev) =>
      prev.includes(weekNum)
        ? prev.filter((w) => w !== weekNum)
        : [...prev, weekNum]
    );
  };

  const getWeekStats = (lessons: Lesson[]) => {
    const completed = lessons.filter((l) => l.status === "completed").length;
    return { completed, total: lessons.length };
  };

  if (planLoading || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Map className="h-6 w-6 text-primary" />
            Your Roadmap
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {weeks.length} weeks ·{" "}
            {weeks.reduce((acc, w) => acc + w.lessons.length, 0)} total lessons
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setExpandedWeeks(weeks.map((w) => w.week_number))}
          >
            Expand All
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setExpandedWeeks([])}
          >
            Collapse All
          </Button>
        </div>
      </div>

      {weeks.map((week) => {
        const isExpanded = expandedWeeks.includes(week.week_number);
        const { completed, total } = getWeekStats(week.lessons);
        const weekDone = completed === total;
        const weekProgress = Math.round((completed / total) * 100);

        return (
          <Card
            key={week.week_number}
            className={cn(weekDone && "border-green-200")}
          >
            <CardHeader
              className="cursor-pointer pb-3"
              onClick={() => toggleWeek(week.week_number)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold",
                      weekDone
                        ? "bg-green-100 text-green-700"
                        : "bg-primary/10 text-primary"
                    )}
                  >
                    {weekDone ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      week.week_number
                    )}
                  </div>
                  <div>
                    <CardTitle className="text-base">
                      Week {week.week_number}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">
                      {completed}/{total} lessons complete
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="hidden sm:flex items-center gap-2">
                    <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${weekProgress}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {weekProgress}%
                    </span>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </div>
            </CardHeader>

            {isExpanded && (
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {week.lessons.map((lesson) => {
                    const diff =
                      difficultyConfig[lesson.difficulty] ||
                      difficultyConfig.easy;
                    const isToday =
                      new Date(lesson.scheduled_date).toDateString() ===
                      new Date().toDateString();

                    return (
                      <div
                        key={lesson.id}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-lg border transition-colors",
                          isToday && "border-primary bg-primary/5",
                          lesson.status === "completed" &&
                            "bg-green-50/50 border-green-100",
                          lesson.status === "missed" &&
                            "bg-red-50/50 border-red-100",
                          lesson.status === "pending" &&
                            !isToday &&
                            "bg-muted/30"
                        )}
                      >
                        <div className="flex-shrink-0">
                          {statusIcon[lesson.status] || statusIcon.pending}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p
                              className={cn(
                                "text-sm font-medium truncate",
                                lesson.status === "completed" &&
                                  "line-through text-muted-foreground"
                              )}
                            >
                              {lesson.topic}
                            </p>
                            {lesson.is_regenerated && (
                              <Badge
                                variant="outline"
                                className="text-xs text-blue-600 border-blue-200"
                              >
                                Simplified
                              </Badge>
                            )}
                            {isToday && (
                              <Badge className="text-xs">Today</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs text-muted-foreground">
                              {lesson.phase}
                            </span>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {lesson.estimated_minutes} min
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(
                                lesson.scheduled_date
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Badge
                            variant={diff.variant}
                            className="text-xs hidden sm:inline-flex"
                          >
                            {diff.label}
                          </Badge>
                          <Link
                            href={`/user_dashboard/lesson/${lesson.id}`}
                          >
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-xs h-7"
                            >
                              {lesson.status === "completed"
                                ? "Review"
                                : "Open"}
                            </Button>
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            )}
          </Card>
        );
      })}

      {weeks.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <Map className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p>No roadmap found.</p>
        </div>
      )}
    </div>
  );
}

export default function RoadmapPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-64">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <RoadmapContent />
    </Suspense>
  );
}