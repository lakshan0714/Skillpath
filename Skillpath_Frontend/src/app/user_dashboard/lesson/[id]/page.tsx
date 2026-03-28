"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getLessonContent, markLesson } from "@/lib/api";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ClipboardList,
  Code2,
  ExternalLink,
  Flame,
  Lightbulb,
  Loader2,
  XCircle,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Reference {
  label: string;
  url: string;
}

interface LessonContent {
  analogy: string;
  explanation: string;
  code: string;
  exercises: string[];
  references: Reference[];
}

interface LessonData {
  lesson_id: number;
  topic: string;
  phase: string;
  difficulty: string;
  estimated_minutes: number;
  is_regenerated: boolean;
  content: LessonContent;
}

type MarkStatus = "completed" | "missed" | "difficult";

const difficultyConfig: Record<string, any> = {
  easy: { label: "Easy", variant: "secondary" },
  medium: { label: "Medium", variant: "outline" },
  hard: { label: "Hard", variant: "destructive" },
};

export default function LessonContentPage() {
  const params = useParams();
  const router = useRouter();
  const lessonId = parseInt(params.id as string);

  const [data, setData] = useState<LessonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState<MarkStatus | null>(null);
  const [marked, setMarked] = useState(false);
  const [markResult, setMarkResult] = useState<string | null>(null);
  const [planId, setPlanId] = useState<number | null>(null);

  useEffect(() => {
    // Get planId from localStorage
    const saved = localStorage.getItem("skillpath_selected_plan_id");
    if (saved) setPlanId(parseInt(saved));

    // Fetch lesson content
    setLoading(true);
    getLessonContent(lessonId)
      .then((res: any) => setData(res))
      .catch((e) => {
        console.error(e);
      })
      .finally(() => setLoading(false));
  }, [lessonId]);

  const handleMark = async (status: MarkStatus) => {
    if (!planId) return;
    setMarking(status);
    try {
      await markLesson({
        lesson_id: lessonId,
        plan_id: planId,
        status,
      });
      setMarkResult(status);
      setMarked(true);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setMarking(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground animate-pulse">
          AI is preparing your lesson...
        </p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Lesson not found.</p>
        <Link href="/user_dashboard/today">
          <Button variant="outline" className="mt-4">Go Back</Button>
        </Link>
      </div>
    );
  }

  const diff = difficultyConfig[data.difficulty] || difficultyConfig.easy;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">

      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
        Back
      </button>

      {/* Lesson header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant={diff.variant} className="capitalize">
            {diff.label}
          </Badge>
          {data.is_regenerated && (
            <Badge variant="outline" className="text-blue-600 border-blue-200 gap-1">
              <Zap className="h-3 w-3" />
              AI Simplified
            </Badge>
          )}
          <Badge variant="outline" className="text-muted-foreground">
            {data.phase}
          </Badge>
        </div>
        <h1 className="text-2xl font-bold">{data.topic}</h1>
        <p className="text-sm text-muted-foreground">
          Estimated time: {data.estimated_minutes} minutes
        </p>
      </div>

      {/* Analogy */}
      {data.content?.analogy && (
        <Card className="border-yellow-200 bg-yellow-50/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-yellow-700">
              <Lightbulb className="h-5 w-5" />
              Real World Analogy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-yellow-900">
              {data.content.analogy}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Explanation */}
      {data.content?.explanation && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Explanation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-foreground">
              {data.content.explanation}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Code example */}
      {data.content?.code && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Code2 className="h-5 w-5 text-primary" />
              Code Example
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted rounded-lg p-4 overflow-x-auto text-sm font-mono leading-relaxed whitespace-pre-wrap">
              {data.content.code}
            </pre>
          </CardContent>
        </Card>
      )}

      {/* Exercises */}
      {data.content?.exercises && data.content.exercises.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-primary" />
              Practice Exercises
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.content.exercises.map((exercise, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                    {i + 1}
                  </div>
                  <p className="text-sm leading-relaxed">{exercise}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* References */}
      {data.content?.references && data.content.references.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <ExternalLink className="h-5 w-5 text-primary" />
              Official References
            </CardTitle>
          </CardHeader>
          <CardContent>
              <div className="space-y-2">
                {data.content.references.map((ref, i) => (
                  console.log(ref),
                  <a
                    key={i}
                    href={ref.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-3 rounded-lg border hover:bg-muted/50 transition-colors group"
                  >
                    <ExternalLink className="h-4 w-4 text-primary flex-shrink-0" />
                    <span className="text-sm font-medium group-hover:text-primary transition-colors truncate">
                      {ref.label}
                    </span>
                  </a>
                ))}
              </div>
          </CardContent>
        </Card>
      )}

      {/* Mark lesson */}
      {!marked ? (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              How did this lesson go?
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Mark your progress after studying
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3">
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
                <span className="text-sm font-semibold text-green-700">Completed</span>
                <span className="text-xs text-green-600 text-center">I finished it!</span>
              </button>

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
                <span className="text-sm font-semibold text-yellow-700">Missed</span>
                <span className="text-xs text-yellow-600 text-center">Couldn't study</span>
              </button>

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
                <span className="text-sm font-semibold text-red-700">Difficult</span>
                <span className="text-xs text-red-600 text-center">Found it hard</span>
              </button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-8 text-center space-y-4">
            {markResult === "completed" && (
              <>
                <CheckCircle2 className="h-14 w-14 text-green-500 mx-auto" />
                <div>
                  <p className="font-bold text-lg text-green-700">Great work! 🎉</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Lesson completed. See you tomorrow!
                  </p>
                </div>
              </>
            )}
            {markResult === "missed" && (
              <>
                <XCircle className="h-14 w-14 text-yellow-500 mx-auto" />
                <div>
                  <p className="font-bold text-lg text-yellow-700">No worries!</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Lesson rescheduled to your next available day.
                  </p>
                </div>
              </>
            )}
            {markResult === "difficult" && (
              <>
                <Flame className="h-14 w-14 text-orange-500 mx-auto" />
                <div>
                  <p className="font-bold text-lg text-orange-700">
                    Simplified lesson ready! 🤖
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    AI has generated an easier version for tomorrow.
                  </p>
                </div>
              </>
            )}
            <div className="flex gap-3 justify-center pt-2">
              <Link href="/user_dashboard/roadmap">
                <Button variant="outline" size="sm">View Roadmap</Button>
              </Link>
              <Link href="/user_dashboard/overview">
                <Button size="sm">Go to Dashboard</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}