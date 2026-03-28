"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePlanId } from "@/hooks/usePlanID";
import { getTodayLesson, markLesson } from "@/lib/api";
import { cn } from "@/lib/utils";
import {
    AlertTriangle,
    BookOpen,
    CalendarCheck,
    CheckCircle2,
    ChevronRight,
    Clock,
    Flame,
    Loader2,
    XCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

interface TodayLesson {
  id: number;
  plan_id: number;
  topic: string;
  phase: string;
  difficulty: string;
  estimated_minutes: number;
  status: string;
  scheduled_date: string;
  is_regenerated: boolean;
}

interface TodayResponse {
  lesson: TodayLesson | null;
  health: string;
  days_behind: number;
  message: string | null;
}

const difficultyConfig: Record<string, any> = {
  easy: { label: "Easy", variant: "secondary" },
  medium: { label: "Medium", variant: "outline" },
  hard: { label: "Hard", variant: "destructive" },
};

const healthConfig: Record<string, any> = {
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

type MarkStatus = "completed" | "missed" | "difficult";

export default function TodayPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planParam = searchParams.get("plan");
  const { planId: storedPlanId, loaded } = usePlanId();
  const planId = planParam ? parseInt(planParam) : storedPlanId;

  const [data, setData] = useState<TodayResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState<MarkStatus | null>(null);
  const [marked, setMarked] = useState(false);
  const [markResult, setMarkResult] = useState<any>(null);

  useEffect(() => {
    if (!loaded && !planParam) return;
    if (!planId) return;

    setLoading(true);
    getTodayLesson(planId)
      .then((res: any) => setData(res))
      .finally(() => setLoading(false));
  }, [planId, loaded]);

  const handleMark = async (status: MarkStatus) => {
    if (!data?.lesson) return;
    setMarking(status);

    try {
      const res: any = await markLesson({
        lesson_id: data.lesson.id,
        plan_id: data.lesson.plan_id,
        status,
      });
      setMarkResult({ status, response: res });
      setMarked(true);

      // Refresh today data after marking
      if (planId) {
        const updated: any = await getTodayLesson(planId);
        setData(updated);
      }
    } catch (e: any) {
      alert(e.message);
    } finally {
      setMarking(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const health = data?.health ? healthConfig[data.health] : healthConfig.green;
  const diff = data?.lesson
    ? difficultyConfig[data.lesson.difficulty] || difficultyConfig.easy
    : null;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <CalendarCheck className="h-6 w-6 text-primary" />
            Today's Lesson
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        {/* Health indicator */}
        {data?.health && (
          <div className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium",
            health.bg, health.color
          )}>
            <div className={cn("h-2 w-2 rounded-full", health.dot)} />
            {health.label}
          </div>
        )}
      </div>

      {/* Behind schedule alert */}
      {data?.health === "red" && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
          <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-700">
              You are {data.days_behind} days behind your goal.
            </p>
            <p className="text-xs text-red-600">
              Consider extending your timeline in Settings.
            </p>
          </div>
          <Link href="/user_dashboard/settings">
            <Button size="sm" variant="destructive">Extend</Button>
          </Link>
        </div>
      )}

      {/* No lesson today */}
      {!data?.lesson && (
        <Card>
          <CardContent className="py-16 text-center space-y-4">
            <BookOpen className="h-14 w-14 text-muted-foreground mx-auto opacity-40" />
            <div>
              <p className="font-semibold text-lg">No lesson today</p>
              <p className="text-sm text-muted-foreground mt-1">
                {data?.message || "Enjoy your rest day!"}
              </p>
            </div>
            <Link href="/user_dashboard/roadmap">
              <Button variant="outline">View Full Roadmap</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Today's lesson card */}
      {data?.lesson && (
        <>
          <Card className="border-primary/30">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {data.lesson.is_regenerated && (
                      <Badge variant="outline" className="text-xs text-blue-600 border-blue-200">
                        Simplified
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-xl leading-tight">
                    {data.lesson.topic}
                  </CardTitle>
                </div>
                {diff && (
                  <Badge variant={diff.variant} className="flex-shrink-0 capitalize">
                    {diff.label}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Meta info */}
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  {data.lesson.phase}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {data.lesson.estimated_minutes} min
                </span>
              </div>

              {/* Open lesson button */}
              {!marked && (
                <Link href={`/user_dashboard/lesson/${data.lesson.id}`}>
                  <Button className="w-full gap-2 h-12" size="lg">
                    <BookOpen className="h-5 w-5" />
                    Open Lesson
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>

          {/* Mark lesson section */}
          {!marked ? (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">
                  How did today's lesson go?
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Mark your progress after studying
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-3">
                  {/* Completed */}
                  <button
                    onClick={() => handleMark("completed")}
                    disabled={!!marking}
                    className={cn(
                      "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
                      "border-green-200 bg-green-50 hover:bg-green-100 hover:border-green-400",
                      marking === "completed" && "opacity-70"
                    )}
                  >
                    {marking === "completed" ? (
                      <Loader2 className="h-6 w-6 text-green-600 animate-spin" />
                    ) : (
                      <CheckCircle2 className="h-6 w-6 text-green-600" />
                    )}
                    <span className="text-sm font-semibold text-green-700">
                      Completed
                    </span>
                    <span className="text-xs text-green-600 text-center">
                      I finished it!
                    </span>
                  </button>

                  {/* Missed */}
                  <button
                    onClick={() => handleMark("missed")}
                    disabled={!!marking}
                    className={cn(
                      "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
                      "border-yellow-200 bg-yellow-50 hover:bg-yellow-100 hover:border-yellow-400",
                      marking === "missed" && "opacity-70"
                    )}
                  >
                    {marking === "missed" ? (
                      <Loader2 className="h-6 w-6 text-yellow-600 animate-spin" />
                    ) : (
                      <XCircle className="h-6 w-6 text-yellow-600" />
                    )}
                    <span className="text-sm font-semibold text-yellow-700">
                      Missed
                    </span>
                    <span className="text-xs text-yellow-600 text-center">
                      Couldn't study
                    </span>
                  </button>

                  {/* Difficult */}
                  <button
                    onClick={() => handleMark("difficult")}
                    disabled={!!marking}
                    className={cn(
                      "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
                      "border-red-200 bg-red-50 hover:bg-red-100 hover:border-red-400",
                      marking === "difficult" && "opacity-70"
                    )}
                  >
                    {marking === "difficult" ? (
                      <Loader2 className="h-6 w-6 text-red-600 animate-spin" />
                    ) : (
                      <Flame className="h-6 w-6 text-red-600" />
                    )}
                    <span className="text-sm font-semibold text-red-700">
                      Difficult
                    </span>
                    <span className="text-xs text-red-600 text-center">
                      Found it hard
                    </span>
                  </button>
                </div>
              </CardContent>
            </Card>
          ) : (
            /* After marking — show result */
            <Card>
              <CardContent className="py-8 text-center space-y-4">
                {markResult?.status === "completed" && (
                  <>
                    <CheckCircle2 className="h-14 w-14 text-green-500 mx-auto" />
                    <div>
                      <p className="font-bold text-lg text-green-700">
                        Great work! 🎉
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Lesson marked as completed. See you tomorrow!
                      </p>
                    </div>
                  </>
                )}
                {markResult?.status === "missed" && (
                  <>
                    <XCircle className="h-14 w-14 text-yellow-500 mx-auto" />
                    <div>
                      <p className="font-bold text-lg text-yellow-700">
                        No worries!
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Lesson rescheduled to your next available day.
                      </p>
                    </div>
                  </>
                )}
                {markResult?.status === "difficult" && (
                  <>
                    <Flame className="h-14 w-14 text-orange-500 mx-auto" />
                    <div>
                      <p className="font-bold text-lg text-orange-700">
                        A simplified lesson is ready! 🤖
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        AI has generated an easier version for tomorrow.
                      </p>
                    </div>
                  </>
                )}
                <div className="flex gap-3 justify-center pt-2">
                  <Link href="/user_dashboard/roadmap">
                    <Button variant="outline" size="sm">
                      View Roadmap
                    </Button>
                  </Link>
                  <Link href="/user_dashboard/overview">
                    <Button size="sm">
                      Go to Dashboard
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}